import { VrpcError } from './errors'
import type {
  BackendStatus,
  UseClientResult,
  VrpcBackendConfig,
  VrpcCallOptions,
  VrpcClient,
  VrpcManager
} from './types'

const EMPTY_IDS: readonly string[] = Object.freeze([])

export interface ResolvedConfig {
  domain: string
  broker: string
  backends: Record<string, VrpcBackendConfig>
  identity?: string
  mqttClientId?: string
  bestEffort: boolean
  requiresSchema: boolean
  timeout?: number
  keepalive: number
  log?: 'console' | object
  debug: boolean
}

interface BackendEntry {
  backend: any
  ids?: readonly string[]
  error: VrpcError | null
  status: BackendStatus
}

export interface VrpcStore {
  /** Take ownership of a fresh client: seed state, register all listeners. Returns detach. */
  attach: (client: VrpcClient) => () => void
  /** Mark the initial connect() as failed */
  connectFailed: (error: VrpcError) => void
  getClient: () => UseClientResult
  getBackend: (key: string) => BackendEntry
  assertBackend: (key: string) => void
  subscribe: (key: string, callback: () => void) => () => void
  /** Subscribe to client-entry changes (separate from backend keys) */
  subscribeClient: (callback: () => void) => () => void
}

function isManagerConfig (config: VrpcBackendConfig): boolean {
  return !config.instance && !config.args
}

export function createVrpcStore (
  config: ResolvedConfig,
  onError: (error: VrpcError) => void
): VrpcStore {
  const debug = (...args: unknown[]) => {
    if (config.debug) console.log('[vrpc-react]', ...args)
  }

  // ----------------------------------------------------
  // State (immutable snapshot objects, replaced on change)
  // ----------------------------------------------------

  let client: VrpcClient | null = null
  let clientEntry: UseClientResult = Object.freeze({
    client: null,
    status: 'connecting' as const,
    error: null
  })
  const entries: Record<string, BackendEntry> = {}
  const listeners = new Map<string, Set<() => void>>()

  // Epoch guards async resolutions against a client that has been
  // detached or has gone offline while the promise was in flight.
  let epoch = 0

  // Per-key generations additionally invalidate in-flight resolutions
  // when THIS backend's world changed (agent offline, instance gone)
  // without a client-level epoch bump.
  const generations: Record<string, number> = {}
  const bumpGeneration = (key: string) => {
    generations[key] = (generations[key] ?? 0) + 1
  }
  const guard = (key: string) => {
    const startEpoch = epoch
    const startGeneration = generations[key] ?? 0
    return () =>
      epoch === startEpoch && (generations[key] ?? 0) === startGeneration
  }

  // Internal notification channel for the client entry; NUL cannot
  // appear in a user-defined backend key.
  const CLIENT_CHANNEL = '\u0000client'

  const notify = (key: string) => {
    listeners.get(key)?.forEach(callback => callback())
  }

  const setClientEntry = (patch: Partial<UseClientResult>) => {
    const next = Object.freeze({ ...clientEntry, ...patch })
    if (
      next.client === clientEntry.client &&
      next.status === clientEntry.status &&
      next.error === clientEntry.error
    ) {
      return
    }
    clientEntry = next
    notify(CLIENT_CHANNEL)
  }

  const setEntry = (key: string, patch: Partial<BackendEntry>) => {
    const previous = entries[key]
    const next = Object.freeze({ ...previous, ...patch })
    if (
      next.backend === previous.backend &&
      next.ids === previous.ids &&
      next.error === previous.error &&
      next.status === previous.status
    ) {
      return
    }
    entries[key] = next
    notify(key)
  }

  // ----------------------------------------------------
  // Managers (stable identity for the store's lifetime)
  // ----------------------------------------------------

  const requireClient = (): VrpcClient => {
    if (!client || clientEntry.status !== 'connected') {
      throw new VrpcError(
        'CLIENT_OFFLINE',
        'The VRPC client is not connected'
      )
    }
    return client
  }

  const normalizeCall = (
    backendConfig: VrpcBackendConfig,
    functionName: string | VrpcCallOptions,
    args: unknown[]
  ): VrpcCallOptions => {
    if (typeof functionName === 'string') {
      return {
        functionName,
        args,
        className: backendConfig.className,
        agent: backendConfig.agent
      }
    }
    // object form: fill in the backend's defaults for omitted fields
    return {
      className: backendConfig.className,
      agent: backendConfig.agent,
      ...functionName
    }
  }

  const createManager = (key: string): VrpcManager => {
    const backendConfig = config.backends[key]
    return {
      create: async (id, options = {}) =>
        requireClient().create({
          agent: options.agent ?? backendConfig.agent,
          className: options.className ?? backendConfig.className,
          args: options.args ?? [],
          instance: id,
          cacheProxy: true
        }),
      get: async id =>
        requireClient().getInstance(id, {
          className: backendConfig.className,
          agent: backendConfig.agent,
          noWait: true
        }),
      delete: async id =>
        requireClient().delete(id, {
          className: backendConfig.className,
          agent: backendConfig.agent
        }),
      callStatic: (async (
        functionName: string | VrpcCallOptions,
        ...args: unknown[]
      ) =>
        requireClient().callStatic(
          normalizeCall(backendConfig, functionName, args)
        )) as VrpcManager['callStatic'],
      callAll: (async (
        functionName: string | VrpcCallOptions,
        ...args: unknown[]
      ) =>
        requireClient().callAll(
          normalizeCall(backendConfig, functionName, args)
        )) as VrpcManager['callAll'],
      get ids () {
        return entries[key]?.ids ?? EMPTY_IDS
      }
    }
  }

  const initialEntry = (key: string): BackendEntry => {
    const backendConfig = config.backends[key]
    if (isManagerConfig(backendConfig)) {
      return Object.freeze({
        backend: managers[key],
        ids: EMPTY_IDS,
        error: null,
        status: 'connecting' as const
      })
    }
    return Object.freeze({
      backend: null,
      error: null,
      status: 'connecting' as const
    })
  }

  const managers: Record<string, VrpcManager> = {}
  for (const key of Object.keys(config.backends)) {
    if (isManagerConfig(config.backends[key])) {
      managers[key] = createManager(key)
    }
  }
  for (const key of Object.keys(config.backends)) {
    entries[key] = initialEntry(key)
  }

  const resetAllEntries = (patch?: Partial<BackendEntry>) => {
    for (const key of Object.keys(config.backends)) {
      setEntry(key, { ...initialEntry(key), ...patch })
    }
  }

  const backendsOfAgent = (agent: string): string[] =>
    Object.keys(config.backends).filter(
      key => config.backends[key].agent === agent
    )

  const backendsOfClass = (className: string, agent: string): string[] =>
    Object.keys(config.backends).filter(
      key =>
        config.backends[key].className === className &&
        config.backends[key].agent === agent
    )

  // ----------------------------------------------------
  // Event handlers
  // ----------------------------------------------------

  // The client's own cache of currently known instances. Needed because
  // vrpc does NOT re-emit instanceNew after an agent bounce: the class
  // cache survives agent-offline, so an unchanged classInfo republish
  // diffs to nothing. The cache is the source of truth at agent-online.
  const availableInstances = (
    backendConfig: VrpcBackendConfig
  ): readonly string[] => {
    if (!client) return EMPTY_IDS
    try {
      return client.getAvailableInstances({
        className: backendConfig.className,
        agent: backendConfig.agent
      })
    } catch {
      return EMPTY_IDS
    }
  }

  const createActive = (key: string) => {
    const backendConfig = config.backends[key]
    const currentClient = client
    if (!currentClient || !backendConfig.args) return
    const alive = guard(key)
    currentClient
      .create({
        agent: backendConfig.agent,
        className: backendConfig.className,
        instance: backendConfig.instance,
        args: backendConfig.args,
        cacheProxy: true
      })
      .then(proxy => {
        if (!alive()) return
        debug(
          `Created instance '${backendConfig.instance ?? '<anonymous>'}' for backend '${key}'`
        )
        setEntry(key, { backend: proxy, error: null, status: 'ready' })
      })
      .catch((cause: unknown) => {
        if (!alive()) return
        const error = new VrpcError(
          'INSTANCE_CREATION_FAILED',
          `Could not create instance '${backendConfig.instance ?? '<anonymous>'}' for backend '${key}'`,
          { cause, backendKey: key, agent: backendConfig.agent }
        )
        setEntry(key, { backend: null, error, status: 'error' })
        onError(error)
      })
  }

  const attachPassive = (key: string) => {
    const backendConfig = config.backends[key]
    const currentClient = client
    if (!currentClient || !backendConfig.instance) return
    const alive = guard(key)
    currentClient
      .getInstance(backendConfig.instance, {
        className: backendConfig.className,
        agent: backendConfig.agent
      })
      .then(proxy => {
        if (!alive()) return
        setEntry(key, { backend: proxy, error: null, status: 'ready' })
      })
      .catch((cause: unknown) => {
        if (!alive()) return
        const error = new VrpcError(
          'INSTANCE_ATTACH_FAILED',
          `Could not attach to backend instance '${backendConfig.instance}'`,
          { cause, backendKey: key, agent: backendConfig.agent }
        )
        setEntry(key, { backend: null, error, status: 'error' })
        onError(error)
      })
  }

  const handleAgentOnline = (agent: string) => {
    for (const key of backendsOfAgent(agent)) {
      const backendConfig = config.backends[key]
      const entry = entries[key]
      if (isManagerConfig(backendConfig)) {
        // seed ids from the client's cache; later diffs arrive as
        // instanceNew/instanceGone events
        const cached = availableInstances(backendConfig)
        const ids =
          cached.length > 0 ? Object.freeze([...cached]) : entry.ids ?? EMPTY_IDS
        setEntry(key, { ids, error: null, status: 'ready' })
      } else if (backendConfig.args) {
        // active or anonymous instance: create (attaches if it already exists)
        if (entry.status === 'ready' && entry.backend) continue
        createActive(key)
      } else {
        // passive instance: attach right away if the instance is already
        // known, otherwise wait for its instanceNew
        if (entry.status === 'ready' && entry.backend) continue
        if (
          backendConfig.instance &&
          availableInstances(backendConfig).includes(backendConfig.instance)
        ) {
          attachPassive(key)
        } else {
          setEntry(key, { error: null, status: 'connecting' })
        }
      }
    }
  }

  const handleAgentOffline = (agent: string) => {
    for (const key of backendsOfAgent(agent)) {
      const backendConfig = config.backends[key]
      // invalidate in-flight resolutions targeting the lost agent
      bumpGeneration(key)
      const error = new VrpcError(
        'AGENT_OFFLINE',
        `Lost agent '${agent}' required for backend '${key}'`,
        { backendKey: key, agent }
      )
      if (isManagerConfig(backendConfig)) {
        setEntry(key, { ids: EMPTY_IDS, error, status: 'offline' })
      } else {
        setEntry(key, { backend: null, error, status: 'offline' })
      }
      onError(error)
    }
  }

  const handleInstanceNew = (
    added: string[],
    info: { className?: string, agent?: string }
  ) => {
    if (!info.className || !info.agent) return
    for (const key of backendsOfClass(info.className, info.agent)) {
      const backendConfig = config.backends[key]
      if (isManagerConfig(backendConfig)) {
        const current = entries[key].ids ?? EMPTY_IDS
        const merged = Object.freeze(
          Array.from(new Set([...current, ...added]))
        )
        setEntry(key, { ids: merged, error: null, status: 'ready' })
      } else if (
        !backendConfig.args &&
        backendConfig.instance &&
        added.includes(backendConfig.instance)
      ) {
        // passive instance backend: attach now that its instance exists
        attachPassive(key)
      }
    }
  }

  const handleInstanceGone = (
    gone: string[],
    info: { className?: string, agent?: string }
  ) => {
    if (!info.className || !info.agent) return
    for (const key of backendsOfClass(info.className, info.agent)) {
      const backendConfig = config.backends[key]
      if (isManagerConfig(backendConfig)) {
        const current = entries[key].ids ?? EMPTY_IDS
        const filtered = current.filter(id => !gone.includes(id))
        if (filtered.length !== current.length) {
          setEntry(key, { ids: Object.freeze(filtered) })
        }
      } else if (
        backendConfig.instance &&
        gone.includes(backendConfig.instance)
      ) {
        bumpGeneration(key)
        if (backendConfig.args) {
          // active backend owns its instance: self-heal by re-creating
          debug(
            `Instance '${backendConfig.instance}' of backend '${key}' disappeared - re-creating`
          )
          setEntry(key, { backend: null, error: null, status: 'connecting' })
          createActive(key)
        } else {
          const error = new VrpcError(
            'INSTANCE_GONE',
            `Lost instance '${backendConfig.instance}' required for backend '${key}'`,
            { backendKey: key, agent: backendConfig.agent }
          )
          setEntry(key, { backend: null, error, status: 'offline' })
          onError(error)
        }
      }
    }
  }

  const handleOffline = () => {
    epoch++
    const error = new VrpcError('CLIENT_OFFLINE', 'Lost connection to the MQTT broker')
    setClientEntry({ status: 'offline', error })
    resetAllEntries({ error, status: 'offline' })
    onError(error)
  }

  const handleConnect = () => {
    debug('VRPC client is connected')
    setClientEntry({ status: 'connected', error: null })
    // Recovery is event-driven: vrpc re-subscribes retained agent/class
    // topics, which replay 'agent' and 'instanceNew' for everything alive.
    resetAllEntries()
  }

  const handleNetworkError = (cause: Error) => {
    const error = new VrpcError('NETWORK_ERROR', 'The MQTT connection reported an error', { cause })
    setClientEntry({ error })
    onError(error)
  }

  // ----------------------------------------------------
  // Store interface
  // ----------------------------------------------------

  return {
    attach (nextClient: VrpcClient) {
      epoch++
      client = nextClient
      setClientEntry({ client: nextClient, status: 'connecting', error: null })
      resetAllEntries()

      const onConnect = () => handleConnect()
      const onOffline = () => handleOffline()
      const onReconnect = () => debug('Reconnecting to the MQTT broker...')
      const onAgent = ({ agent, status }: { agent: string, status: string }) => {
        if (status === 'online') handleAgentOnline(agent)
        else if (status === 'offline') handleAgentOffline(agent)
      }

      nextClient.on('connect', onConnect)
      nextClient.on('offline', onOffline)
      nextClient.on('reconnect', onReconnect)
      nextClient.on('error', handleNetworkError)
      nextClient.on('agent', onAgent)
      nextClient.on('instanceNew', handleInstanceNew)
      nextClient.on('instanceGone', handleInstanceGone)

      return () => {
        epoch++
        nextClient.removeListener('connect', onConnect)
        nextClient.removeListener('offline', onOffline)
        nextClient.removeListener('reconnect', onReconnect)
        nextClient.removeListener('error', handleNetworkError)
        nextClient.removeListener('agent', onAgent)
        nextClient.removeListener('instanceNew', handleInstanceNew)
        nextClient.removeListener('instanceGone', handleInstanceGone)
        if (client === nextClient) client = null
      }
    },

    connectFailed (error: VrpcError) {
      setClientEntry({ status: 'error', error })
      resetAllEntries({ error, status: 'error' })
      onError(error)
    },

    getClient () {
      return clientEntry
    },

    getBackend (key: string) {
      const entry = entries[key]
      if (!entry) {
        throw new VrpcError(
          'UNKNOWN_BACKEND',
          `Backend '${key}' is not configured in createVrpc`,
          { backendKey: key }
        )
      }
      return entry
    },

    assertBackend (key: string) {
      this.getBackend(key)
    },

    subscribe (key: string, callback: () => void) {
      let set = listeners.get(key)
      if (!set) {
        set = new Set()
        listeners.set(key, set)
      }
      set.add(callback)
      return () => {
        set.delete(callback)
      }
    },

    subscribeClient (callback: () => void) {
      return this.subscribe(CLIENT_CHANNEL, callback)
    }
  }
}
