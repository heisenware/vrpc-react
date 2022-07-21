import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  useMemo
} from 'react'
import { VrpcClient } from 'vrpc'

const NETWORK_ERROR = 'NetworkError'
const VRPC_ERROR = 'VrpcError'

const vrpcClientContext = createContext()
const vrpcBackendContexts = []

export function createVrpcProvider ({
  domain = 'vrpc',
  broker = 'wss://vrpc.io/mqtt',
  backends = {},
  identity = null,
  bestEffort = false,
  debug = false
}) {
  // create a context for every user-specified backend
  for (const key of Object.keys(backends)) {
    const context = createContext()
    context.displayName = key
    vrpcBackendContexts.push(context)
  }
  return function VrpcProvider ({
    children,
    username,
    password,
    token,
    onError = msg => debug && console.error(msg)
  }) {
    return (
      <VrpcBackendMaker
        backends={backends}
        broker={broker}
        token={token}
        domain={domain}
        username={username}
        password={password}
        identity={identity}
        bestEffort={bestEffort}
        debug={debug}
        onError={onError}
      >
        {children}
      </VrpcBackendMaker>
    )
  }
}

function VrpcBackendMaker ({
  children,
  backends,
  broker,
  token,
  domain,
  username,
  password,
  identity,
  bestEffort,
  debug,
  onError
}) {
  const client = useMemo(
    () =>
      new VrpcClient({
        broker,
        token,
        domain,
        username,
        password,
        identity,
        bestEffort
      }),
    [broker, token, domain, username, password, identity, bestEffort]
  )
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState(null)
  const [backend, setBackend] = useState([])

  useEffect(() => {
    function filterBackends (className, agent) {
      const ret = []
      for (const [k, v] of Object.entries(backends)) {
        if (v.className === className && v.agent === agent) {
          ret.push(k)
        }
      }
      return ret
    }

    function createMultiInstanceBackend (
      client,
      defaultClassName,
      defaultAgent
    ) {
      return {
        create: async (
          id,
          { args = [], className = defaultClassName, agent = defaultAgent } = {}
        ) =>
          client.create({
            agent,
            className,
            args,
            instance: id
          }),
        get: async id => client.getInstance(id, { agent: defaultAgent }),
        delete: async id => client.delete(id, { agent: defaultAgent }),
        callStatic: async (functionName, ...args) => {
          let options = {}
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
        callAll: async (functionName, ...args) => {
          let options = {}
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
        ids: []
      }
    }

    function initializeBackends (client) {
      setBackend(prev => {
        Object.keys(backends).forEach(x => {
          const { instance, args, className, agent } = backends[x]
          if (!instance && !args) {
            const backend = createMultiInstanceBackend(client, className, agent)
            prev[x] = [backend, null]
          } else {
            prev[x] = [null, null]
          }
        })
        return { ...prev }
      })
    }

    function registerHandlers (client) {
      client.on('instanceNew', async (added, { className, agent }) => {
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
              setBackend(prev => {
                prev[key] = [proxy, null]
                return { ...prev }
              })
            } catch (err) {
              const error = new Error(
                `Could not attach to backend instance '${instance}', because: ${err.message}`,
                { cause: err }
              )
              error.name = VRPC_ERROR
              onError(error)
              setBackend(prev => {
                prev[key] = [null, error]
                return { ...prev }
              })
            }
          } else {
            // multi-instance backend
            setBackend(prev => {
              if (!prev[key][0] || !prev[key][0].ids) return prev
              prev[key][0].ids = [...new Set([...prev[key][0].ids, ...added])]
              return { ...prev }
            })
          }
        }
      })

      client.on('instanceGone', async (gone, { className, agent }) => {
        if (!className) return
        const keys = filterBackends(className, agent)
        for (const key of keys) {
          const { instance, args } = backends[key]
          // Available instance is used by this backend
          if (instance && gone.includes(instance)) {
            const error = new Error(
              `Lost instance '${instance}' required for backend '${key}'`
            )
            error.name = VRPC_ERROR
            onError(error)
            setBackend(prev => {
              prev[key] = [null, error]
              return { ...prev }
            })
            continue
          }
          setBackend(prev => {
            if (!prev[key][0] || !prev[key][0].ids) return prev
            prev[key][0].ids = prev[key][0].ids.filter(x => !gone.includes(x))
            return { ...prev }
          })
        }
      })

      client.on('agent', async ({ agent, status }) => {
        for (const [k, v] of Object.entries(backends)) {
          if (v.agent !== agent) continue
          if (status === 'offline') {
            const error = new Error(
              `Lost agent '${agent}' required for backend '${k}'`
            )
            error.name = VRPC_ERROR
            onError(error)
            setBackend(prev => {
              if (!v.instance && !v.args && prev[k][0]) {
                prev[k][0].ids = []
              } else {
                prev[k][0] = null
              }
              prev[k][1] = error
              return { ...prev }
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
                    `Created instance '${v.instance ||
                      '<anonymous>'}' for: backend ${k}`
                  )
                }
                setBackend(prev => {
                  prev[k] = [proxy, null]
                  return { ...prev }
                })
              } catch (err) {
                const error = new Error(
                  `Could not create instance '${v.instance ||
                    '<anonymous>'}' for backend '${k}' because: ${err.message}`,
                  { cause: err }
                )
                error.name = VRPC_ERROR
                onError(error)
                setBackend(prev => {
                  prev[k] = [null, error]
                  return { ...prev }
                })
              }
            } else {
              setBackend(prev => {
                prev[k][1] = null
                return { ...prev }
              })
            }
          }
        }
      })
    }

    async function init () {
      try {
        initializeBackends(client)
        client.on('error', error => {
          error.name = NETWORK_ERROR
          onError(error)
          setError(error)
        })
        await client.connect()
        registerHandlers(client)
        if (debug) console.log('VRPC client is connected')
        setIsInitializing(false)
      } catch (err) {
        const error = new Error(
          `VRPC client failed to connect because: ${err.message}`,
          { cause: err }
        )
        error.name = VRPC_ERROR
        onError(error)
        setError(error)
      }
    }

    // Initialize here
    init()
  }, [client, backends, debug, onError])

  function refresh (backend) {
    setBackend(prev => {
      if (!prev[backend]) return prev
      prev[backend][0] = { ...prev[backend][0] }
      return { ...prev }
    })
  }

  function renderProviders (index = -1) {
    if (index === -1) {
      return (
        <vrpcClientContext.Provider value={[client, error, refresh]}>
          {renderProviders(index + 1)}
        </vrpcClientContext.Provider>
      )
    }
    if (index < vrpcBackendContexts.length) {
      const Context = vrpcBackendContexts[index]
      const Provider = Context.Provider
      return (
        <Provider value={[...backend[Context.displayName]]}>
          {renderProviders(index + 1)}
        </Provider>
      )
    }
    return children
  }

  if (isInitializing) return null
  return renderProviders()
}

export function useClient ({ onError } = {}) {
  const [client, error] = useContext(vrpcClientContext)
  if (onError) client.on('error', onError)
  return [client, error]
}

export function useBackend (name, id) {
  const context = useContext(
    vrpcBackendContexts.find(x => x.displayName === name)
  )
  const [, , refresh] = useContext(vrpcClientContext)
  const [proxy, setProxy] = useState([null, null])
  useEffect(() => {
    if (!id) return
    const [backend] = context
    if (backend.ids && backend.ids.includes(id)) {
      backend
        .get(id)
        .then(proxy => setProxy([proxy, null, () => refresh(name)]))
        .catch(err => {
          const error = new Error(
            `Failed proxy creation for id '${id}' of backend '${name}' because: ${err.message}`,
            { cause: err }
          )
          error.name = VRPC_ERROR
          setProxy([null, error])
        })
    } else {
      const error = new Error(
        'The provided id is not an instance on the selected backend'
      )
      error.name = VRPC_ERROR
      setProxy([null, error])
    }
  }, [context, id, refresh, name])
  if (id) return proxy
  context.push(() => refresh(name))
  return context
}
