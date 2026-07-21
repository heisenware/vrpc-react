import { VrpcError } from './errors'
import type {
  BackendStatus,
  UseClientResult,
  VrpcBackendConfig,
  VrpcCallOptions,
  VrpcClient,
  VrpcManager
} from './types'

const DEFAULT_HEALTH_INTERVAL_MS = 30000
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
}

function isManagerConfig (config: VrpcBackendConfig): boolean {
  return !config.instance && !config.args
}

function healthIntervalMs (config: VrpcBackendConfig): number | null {
  if (!config.healthCheck) return null
  if (config.healthCheck === true) return DEFAULT_HEALTH_INTERVAL_MS
  return config.healthCheck.intervalMs ?? DEFAULT_HEALTH_INTERVAL_MS
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
    notify('$client')
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
    return functionName
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
          agent: backendConfig.agent,
          noWait: true
        }),
      delete: async id =>
        requireClient().delete(id, { agent: backendConfig.agent }),
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

  const handleAgentOnline = (agent: string) => {
    for (const key of backendsOfAgent(agent)) {
      const backendConfig = config.backends[key]
      if (isManagerConfig(backendConfig)) {
        setEntry(key, { error: null, status: 'ready' })
      } else if (backendConfig.args) {
        // active or anonymous instance: create (attaches if it already exists)
        const entry = entries[key]
        if (entry.status === 'ready' && entry.backend) continue
        const startEpoch = epoch
        const currentClient = client
        if (!currentClient) continue
        currentClient
          .create({
            agent: backendConfig.agent,
            className: backendConfig.className,
            instance: backendConfig.instance,
            args: backendConfig.args,
            cacheProxy: true
          })
          .then(proxy => {
            if (epoch !== startEpoch) return
            debug(
              `Created instance '${backendConfig.instance ?? '<anonymous>'}' for backend '${key}'`
            )
            setEntry(key, { backend: proxy, error: null, status: 'ready' })
          })
          .catch((cause: unknown) => {
            if (epoch !== startEpoch) return
            const error = new VrpcError(
              'INSTANCE_CREATION_FAILED',
              `Could not create instance '${backendConfig.instance ?? '<anonymous>'}' for backend '${key}'`,
              { cause, backendKey: key, agent }
            )
            setEntry(key, { backend: null, error, status: 'error' })
            onError(error)
          })
      } else {
        // passive instance: clear a stale error, wait for its instanceNew
        setEntry(key, { error: null, status: 'connecting' })
      }
    }
  }

  const handleAgentOffline = (agent: string) => {
    for (const key of backendsOfAgent(agent)) {
      const backendConfig = config.backends[key]
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
        const startEpoch = epoch
        const currentClient = client
        if (!currentClient) continue
        currentClient
          .getInstance(backendConfig.instance, {
            className: backendConfig.className,
            agent: backendConfig.agent
          })
          .then(proxy => {
            if (epoch !== startEpoch) return
            setEntry(key, { backend: proxy, error: null, status: 'ready' })
          })
          .catch((cause: unknown) => {
            if (epoch !== startEpoch) return
            const error = new VrpcError(
              'INSTANCE_ATTACH_FAILED',
              `Could not attach to backend instance '${backendConfig.instance}'`,
              { cause, backendKey: key, agent: backendConfig.agent }
            )
            setEntry(key, { backend: null, error, status: 'error' })
            onError(error)
          })
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
  // Health checks
  // ----------------------------------------------------

  const healthTimers: Array<ReturnType<typeof setInterval>> = []

  const startHealthTimers = () => {
    if (healthTimers.length > 0) return
    for (const key of Object.keys(config.backends)) {
      const backendConfig = config.backends[key]
      const intervalMs = healthIntervalMs(backendConfig)
      if (intervalMs === null) continue
      healthTimers.push(
        setInterval(() => {
          const currentClient = client
          if (!currentClient || clientEntry.status !== 'connected') return
          currentClient
            .callStatic({
              agent: backendConfig.agent,
              className: 'Health',
              functionName: 'check'
            })
            .then(() => {
              const entry = entries[key]
              if (entry.error?.code === 'HEALTH_CHECK_FAILED') {
                setEntry(key, {
                  error: null,
                  status: entry.backend ? 'ready' : 'connecting'
                })
              }
            })
            .catch((cause: unknown) => {
              const error = new VrpcError(
                'HEALTH_CHECK_FAILED',
                `Health check failed for backend '${key}'`,
                { cause, backendKey: key, agent: backendConfig.agent }
              )
              // keep the proxy: in-flight UI stays functional
              setEntry(key, { error, status: 'error' })
              onError(error)
            })
        }, intervalMs)
      )
    }
  }

  const stopHealthTimers = () => {
    healthTimers.forEach(timer => clearInterval(timer))
    healthTimers.length = 0
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

      const onConnect = () => {
        handleConnect()
        startHealthTimers()
      }
      const onOffline = () => {
        stopHealthTimers()
        handleOffline()
      }
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
        stopHealthTimers()
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
    }
  }
}
