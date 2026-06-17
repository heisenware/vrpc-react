import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  useMemo,
  useCallback,
  ReactNode
} from 'react'
// @ts-ignore - Assuming vrpc doesn't have strict exported types yet, or you can remove this if it does
import { VrpcClient } from 'vrpc'

const NETWORK_ERROR = 'NetworkError'
const VRPC_ERROR = 'VrpcError'

// --------------------------------------------------------
// Types & Interfaces
// --------------------------------------------------------

export interface VrpcBackendConfig {
  className: string
  agent: string
  instance?: string
  args?: any[]
  checkHealth?: boolean
}

export interface CreateVrpcProviderOptions {
  domain?: string
  broker?: string
  backends?: Record<string, VrpcBackendConfig>
  identity?: string | null
  mqttClientId?: string
  bestEffort?: boolean
  requiresSchema?: boolean
  debug?: boolean
}

export interface VrpcProviderProps {
  children: ReactNode
  username?: string
  password?: string
  token?: string
  onError?: (error: Error) => void
}

type BackendStateValue = [any | null, Error | null]
type BackendState = Record<string, BackendStateValue>

// --------------------------------------------------------
// Globals
// --------------------------------------------------------

const vrpcContexts: Record<string, React.Context<any>> = {}
const vrpcContextKeys: string[] = []
const vrpcClients: Record<string, any> = {}

// --------------------------------------------------------
// Helpers
// --------------------------------------------------------

function createVrpcError(message: string, prevError?: Error): Error {
  const error = prevError?.message
    ? new Error(`${message}, because: ${prevError.message}`, {
        cause: prevError
      })
    : new Error(message)

  error.name = VRPC_ERROR
  return error
}

// --------------------------------------------------------
// Factory
// --------------------------------------------------------

// Defined outside to ensure a stable reference and prevent unnecessary re-renders
const defaultOnError = (msg: any) => console.error(msg)

export function createVrpcProvider({
  domain = 'vrpc',
  broker = 'wss://vrpc.io/mqtt',
  backends = {},
  identity = null,
  mqttClientId,
  bestEffort = true,
  requiresSchema = false,
  debug = false
}: CreateVrpcProviderOptions) {
  // create a context for every user-specified backend
  for (const key of Object.keys(backends)) {
    if (!vrpcContexts[key]) {
      vrpcContexts[key] = createContext<BackendStateValue>([null, null])
      vrpcContextKeys.push(key)
    }
  }

  return function VrpcProvider({
    children,
    username,
    password,
    token,
    onError = defaultOnError // Now using the stable reference
  }: VrpcProviderProps) {
    return (
      <VrpcBackendMaker
        backends={backends}
        broker={broker}
        token={token}
        domain={domain}
        username={username}
        password={password}
        identity={identity}
        mqttClientId={mqttClientId}
        bestEffort={bestEffort}
        requiresSchema={requiresSchema}
        debug={debug}
        onError={onError}
      >
        {children}
      </VrpcBackendMaker>
    )
  }
}

// --------------------------------------------------------
// Internal Logic Component
// --------------------------------------------------------

interface VrpcBackendMakerProps
  extends VrpcProviderProps, CreateVrpcProviderOptions {
  backends: Record<string, VrpcBackendConfig>
  domain: string
}

function VrpcBackendMaker({
  children,
  backends,
  broker,
  token,
  domain,
  username,
  password,
  identity,
  mqttClientId,
  bestEffort,
  requiresSchema,
  debug,
  onError
}: VrpcBackendMakerProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [backend, setBackend] = useState<BackendState>({})

  const handleError = useCallback(
    (err: Error) => {
      console.log('REACT-VRPC-ERROR', err)
      if (err.message === 'Connection refused: Not authorized') {
        console.log('Authentication issues')
      }
      if (onError) onError(err)
    },
    [onError]
  )

  // Client memoization purely based on config
  const client = useMemo(() => {
    return new VrpcClient({
      broker,
      token,
      domain,
      username,
      password,
      identity,
      bestEffort,
      requiresSchema,
      mqttClientId,
      keepalive: 3600 * 3 // 3 hours
    })
  }, [
    broker,
    token,
    domain,
    username,
    password,
    identity,
    mqttClientId,
    bestEffort,
    requiresSchema
  ])

  // Independent effect to handle error listener binding and unbinding
  useEffect(() => {
    if (!client) return

    const onClientError = (error: Error) => {
      error.name = NETWORK_ERROR
      handleError(error)
    }

    client.on('error', onClientError)

    return () => {
      client.removeListener('error', onClientError)
    }
  }, [client, handleError])

  const filterBackends = useCallback(
    (className: string, agent: string) => {
      const ret: string[] = []
      for (const [k, v] of Object.entries(backends)) {
        if (v.className === className && v.agent === agent) {
          ret.push(k)
        }
      }
      return ret
    },
    [backends]
  )

  const createMultiInstanceBackend = useCallback(
    (defaultClassName: string, defaultAgent: string) => {
      return {
        create: async (
          id: string,
          { args = [], className = defaultClassName, agent = defaultAgent } = {}
        ) =>
          client.create({
            agent,
            className,
            args,
            instance: id,
            cacheProxy: true
          }),
        get: async (id: string) =>
          client.getInstance(id, { agent: defaultAgent, noWait: true }),
        delete: async (id: string) =>
          client.delete(id, { agent: defaultAgent }),
        callStatic: async (functionName: string | object, ...args: any[]) => {
          let options: any = {}
          if (typeof functionName === 'string') {
            options.functionName = functionName
            options.args = args
            options.className = defaultClassName
            options.agent = defaultAgent
          } else {
            options = functionName
          }
          return client.callStatic(options)
        },
        callAll: async (functionName: string | object, ...args: any[]) => {
          let options: any = {}
          if (typeof functionName === 'string') {
            options.functionName = functionName
            options.args = args
            options.className = defaultClassName
            options.agent = defaultAgent
          } else {
            options = functionName
          }
          return client.callAll(options)
        },
        ids: [] as string[]
      }
    },
    [client]
  )

  const initializeBackends = useCallback(() => {
    setBackend(prev => {
      const nextState = { ...prev }
      Object.keys(backends).forEach(x => {
        const { instance, args, className, agent } = backends[x]
        if (!instance && !args) {
          const be = createMultiInstanceBackend(className, agent)
          nextState[x] = [be, null]
        } else {
          nextState[x] = [null, null]
        }
      })
      return nextState
    })
  }, [backends, createMultiInstanceBackend])

  const registerHandlers = useCallback(() => {
    client.on(
      'instanceNew',
      async (
        added: string[],
        { className, agent }: { className: string; agent: string }
      ) => {
        if (!className) return
        const keys = filterBackends(className, agent)
        for (const key of keys) {
          const { agent, instance, args } = backends[key]
          if (args) continue // active instance backend

          if (instance) {
            // passive instance backend
            try {
              const proxy = await client.getInstance(instance, {
                className,
                agent
              })
              setBackend(prev => ({ ...prev, [key]: [proxy, null] }))
            } catch (err: any) {
              const error = createVrpcError(
                `Could not attach to backend instance '${instance}'`,
                err
              )
              handleError(error)
              setBackend(prev => ({ ...prev, [key]: [null, error] }))
            }
          } else {
            // multi-instance backend
            setBackend(prev => {
              if (!prev[key][0] || !prev[key][0].ids) return prev
              prev[key][0].ids = Array.from(
                new Set([...prev[key][0].ids, ...added])
              )
              return { ...prev }
            })
          }
        }
      }
    )

    client.on(
      'instanceGone',
      async (
        gone: string[],
        { className, agent }: { className: string; agent: string }
      ) => {
        if (!className) return
        const keys = filterBackends(className, agent)
        for (const key of keys) {
          const { instance } = backends[key]
          if (instance && gone.includes(instance)) {
            const error = createVrpcError(
              `Lost instance '${instance}' required for backend '${key}'`
            )
            handleError(error)
            setBackend(prev => ({ ...prev, [key]: [null, error] }))
            continue
          }
          setBackend(prev => {
            if (!prev[key][0] || !prev[key][0].ids) return prev
            prev[key][0].ids = prev[key][0].ids.filter(
              (x: string) => !gone.includes(x)
            )
            return { ...prev }
          })
        }
      }
    )

    client.on(
      'agent',
      async ({ agent, status }: { agent: string; status: string }) => {
        for (const [k, v] of Object.entries(backends)) {
          if (v.agent !== agent) continue

          if (status === 'offline') {
            const error = createVrpcError(
              `Lost agent '${agent}' required for backend '${k}'`
            )
            handleError(error)
            setBackend(prev => {
              const nextState = { ...prev }
              if (!v.instance && !v.args && nextState[k][0]) {
                nextState[k][0].ids = []
              } else {
                nextState[k][0] = null
              }
              nextState[k][1] = error
              return nextState
            })
          } else if (status === 'online') {
            if (v.args) {
              // active instance backend
              try {
                const proxy = await client.create({
                  agent: v.agent,
                  className: v.className,
                  instance: v.instance,
                  args: v.args,
                  cacheProxy: true
                })
                if (debug) {
                  console.log(
                    `Created instance '${v.instance || '<anonymous>'}' for: backend ${k}`
                  )
                }
                setBackend(prev => ({ ...prev, [k]: [proxy, null] }))
              } catch (err: any) {
                const error = createVrpcError(
                  `Could not create instance '${v.instance || '<anonymous>'}' for backend '${k}'`,
                  err
                )
                handleError(error)
                setBackend(prev => ({ ...prev, [k]: [null, error] }))
              }
            } else {
              setBackend(prev => {
                const nextState = { ...prev }
                if (nextState[k]) nextState[k][1] = null
                return nextState
              })
            }
          }
        }
      }
    )
  }, [backends, client, filterBackends, debug, handleError])

  const initialize = useCallback(async () => {
    try {
      initializeBackends()
      await client.connect()
      registerHandlers()
      vrpcClients[domain] = client
      if (debug) console.log('VRPC client is connected')
      setIsInitializing(false)
    } catch (err: any) {
      handleError(createVrpcError('VRPC client failed to connect', err))
    }
  }, [client, debug, domain, handleError, initializeBackends, registerHandlers])

  // 4. Added the critical cleanup function to tear down the old connection
  useEffect(() => {
    if (!client) return

    initialize()

    return () => {
      client.end().catch((err: Error) => {
        if (debug) console.error('Error ending VRPC client:', err)
      })
    }
  }, [client, initialize, debug])

  useEffect(() => {
    if (!isInitializing) {
      const timers: ReturnType<typeof setInterval>[] = []
      for (const { agent, checkHealth } of Object.values(backends)) {
        if (checkHealth) {
          timers.push(
            setInterval(() => {
              client
                .callStatic({
                  agent,
                  className: 'Health',
                  functionName: 'check'
                })
                .catch((err: Error) => {
                  console.log(`Health checking failed, because:${err.message}`)
                })
            }, 1000 * 30)
          )
        }
      }
      return () => timers.forEach(timer => clearInterval(timer))
    }
  }, [isInitializing, client, username, domain, backends])

  const renderProviders = useCallback(
    (index = 0): ReactNode => {
      if (index < vrpcContextKeys.length) {
        const key = vrpcContextKeys[index]
        if (!backends[key]) return renderProviders(index + 1)
        const Context = vrpcContexts[key]
        const Provider = Context.Provider
        return (
          <Provider value={backend?.[key] ? [...backend[key]] : [null, null]}>
            {renderProviders(index + 1)}
          </Provider>
        )
      }
      return children
    },
    [backend, children, backends]
  )

  if (isInitializing) return null
  return <>{renderProviders()}</>
}

// --------------------------------------------------------
// Hooks
// --------------------------------------------------------

export function useClient(domain: string): [any | null] {
  return [vrpcClients[domain] ?? null]
}

function _useBackend(name: string, id?: string): BackendStateValue {
  const context = useContext(vrpcContexts[name])
  const [proxy, setProxy] = useState<BackendStateValue>([null, null])

  useEffect(() => {
    if (!id) return
    const [backend] = context
    if (backend && backend.ids && backend.ids.includes(id)) {
      backend
        .get(id)
        .then((p: any) => setProxy([p, null]))
        .catch((err: Error) => {
          const error = createVrpcError(
            `Failed proxy creation for id '${id}' of backend '${name}'`,
            err
          )
          setProxy([null, error])
        })
    } else {
      const error = createVrpcError(
        'The provided id is not an instance on the selected backend'
      )
      setProxy([null, error])
    }
  }, [context, id, name])

  if (id) return proxy
  return context
}

export function useBackend(name: string, id?: string): BackendStateValue {
  try {
    return _useBackend(name, id)
  } catch (err: any) {
    return [
      null,
      new Error(`Failed to establish the backend, because: ${err.message}`)
    ]
  }
}
