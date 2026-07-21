import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
// vrpc ships CommonJS without static named exports - a default import is
// required for the ESM bundle to load under Node's CJS interop
// @ts-ignore - vrpc publishes no type declarations
import vrpc from 'vrpc'
import { VrpcError } from './errors'
import { createVrpcStore, type ResolvedConfig, type VrpcStore } from './store'
import type {
  BackendStatus,
  Proxied,
  UseBackendHook,
  UseBackendResult,
  UseClientResult,
  VrpcBackendConfig,
  VrpcConfig,
  VrpcProviderProps,
  VrpcProxy
} from './types'

const { VrpcClient } = vrpc

function resolveConfig (config: VrpcConfig<any>): ResolvedConfig {
  return {
    domain: config.domain ?? 'vrpc',
    broker: config.broker ?? 'wss://vrpc.io/mqtt',
    backends: config.backends ?? {},
    identity: config.identity,
    mqttClientId: config.mqttClientId,
    bestEffort: config.bestEffort ?? true,
    requiresSchema: config.requiresSchema ?? false,
    timeout: config.timeout,
    keepalive: config.keepalive ?? 30,
    log: config.log,
    debug: config.debug ?? false
  }
}

export function createVrpc<
  const B extends Record<string, VrpcBackendConfig>
> (config: VrpcConfig<B>): {
  VrpcProvider: React.FC<VrpcProviderProps>
  useBackend: UseBackendHook<B>
  useClient: () => UseClientResult
} {
  const resolved = resolveConfig(config)
  const StoreContext = createContext<VrpcStore | null>(null)

  function VrpcProvider ({
    children,
    username,
    password,
    token,
    onError
  }: VrpcProviderProps) {
    const onErrorRef = useRef(onError)
    useEffect(() => {
      onErrorRef.current = onError
    })

    const [store] = useState(() =>
      createVrpcStore(resolved, error => {
        const handler = onErrorRef.current
        if (handler) handler(error)
        else console.error(error)
      })
    )

    useEffect(() => {
      const client = new VrpcClient({
        broker: resolved.broker,
        domain: resolved.domain,
        token,
        username,
        password,
        identity: resolved.identity,
        bestEffort: resolved.bestEffort,
        requiresSchema: resolved.requiresSchema,
        mqttClientId: resolved.mqttClientId,
        keepalive: resolved.keepalive,
        ...(resolved.timeout !== undefined && { timeout: resolved.timeout }),
        ...(resolved.log !== undefined && { log: resolved.log })
      })
      const detach = store.attach(client)
      let cancelled = false
      const connecting: Promise<void> = client.connect().catch((cause: unknown) => {
        if (cancelled) return
        store.connectFailed(
          new VrpcError('CONNECTION_FAILED', 'VRPC client failed to connect', {
            cause
          })
        )
      })
      return () => {
        cancelled = true
        detach()
        // end() only after connect() settled: avoids vrpc's stale
        // connect-timeout timer killing a successor connection
        connecting.finally(() => {
          client.end().catch(() => {})
        })
      }
    }, [store, token, username, password])

    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    )
  }

  function useStore (): VrpcStore {
    const store = useContext(StoreContext)
    if (!store) {
      throw new VrpcError(
        'MISSING_PROVIDER',
        'This hook must be used below the VrpcProvider returned by the same createVrpc call'
      )
    }
    return store
  }

  function useBackend (name: string, id?: string): any {
    const store = useStore()
    store.assertBackend(name)

    const subscribe = useCallback(
      (callback: () => void) => store.subscribe(name, callback),
      [store, name]
    )
    const entry = useSyncExternalStore(
      subscribe,
      () => store.getBackend(name),
      () => store.getBackend(name)
    )

    // Resolution of a single managed instance (useBackend(name, id))
    const [idResult, setIdResult] = useState<UseBackendResult<Proxied<VrpcProxy>>>({
      backend: null,
      error: null,
      status: 'connecting'
    })

    useEffect(() => {
      if (!id) return
      const managerReady =
        entry.status === 'ready' && entry.ids !== undefined && entry.backend
      if (!managerReady) {
        setIdResult({
          backend: null,
          error: entry.error,
          status: entry.status as BackendStatus
        })
        return
      }
      if (!entry.ids!.includes(id)) {
        setIdResult({
          backend: null,
          error: new VrpcError(
            'INSTANCE_NOT_FOUND',
            `Instance '${id}' does not exist on backend '${name}'`,
            { backendKey: name }
          ),
          status: 'error'
        })
        return
      }
      let stale = false
      entry.backend
        .get(id)
        .then((proxy: any) => {
          if (!stale) setIdResult({ backend: proxy, error: null, status: 'ready' })
        })
        .catch((cause: unknown) => {
          if (stale) return
          setIdResult({
            backend: null,
            error: new VrpcError(
              'INSTANCE_ATTACH_FAILED',
              `Failed proxy creation for id '${id}' of backend '${name}'`,
              { cause, backendKey: name }
            ),
            status: 'error'
          })
        })
      return () => {
        stale = true
      }
    }, [entry, id, name])

    if (id) return idResult
    return entry
  }

  function useClient (): UseClientResult {
    const store = useStore()
    const subscribe = useCallback(
      (callback: () => void) => store.subscribe('$client', callback),
      [store]
    )
    return useSyncExternalStore(
      subscribe,
      () => store.getClient(),
      () => store.getClient()
    )
  }

  return {
    VrpcProvider,
    useBackend: useBackend as UseBackendHook<B>,
    useClient
  }
}
