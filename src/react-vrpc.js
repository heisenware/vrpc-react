import React, { Component } from 'react'
import { VrpcRemote } from 'vrpc'

const vrpcGlobalContext = React.createContext()
const vrpcContexts = []

export function createVrpcProvider ({
  domain = 'public.vrpc',
  broker = 'wss://vrpc.io/mqtt',
  backends
}) {
  for (const key of Object.keys(backends)) {
    // Create context for this backend
    const context = React.createContext()
    context.displayName = key
    vrpcContexts.push(context)
  }
  return function VrpcProvider ({
    children,
    username,
    password,
    token,
    unauthorizedErrorCallback
  }) {
    return (
      <VrpcBackendMaker
        backends={backends}
        broker={broker}
        token={token}
        domain={domain}
        username={username}
        password={password}
        unauthorizedErrorCallback={unauthorizedErrorCallback}
      >
        {children}
      </VrpcBackendMaker>
    )
  }
}

class VrpcBackendMaker extends Component {
  constructor () {
    super()
    this.state = { __global__: { vrpcIsLoading: true } }
  }

  async componentDidMount () {
    const {
      backends,
      broker,
      token,
      domain,
      username,
      password,
      unauthorizedErrorCallback
    } = this.props

    const vrpc = new VrpcRemote({ broker, token, domain, username, password })

    // handle exception for unauthorized clients, to be removed in future when
    // VRPC node handles these exceptions
    vrpc._client.on('error', err => {
      if (unauthorizedErrorCallback &&
          err &&
          err.message &&
          err.message.toLowerCase().includes('not authorized')
      ) {
        unauthorizedErrorCallback()
      } else {
        throw err
      }
    })

    await vrpc.connected()
    const obj = {}
    for (const [key, value] of Object.entries(backends)) {
      const { agent, className, instance, args, events = [] } = value
      obj[key] = {}
      if (instance) {
        if (args) { // use specific instance and create if not exists
          obj[key][key] = await vrpc.create({ agent, className, instance, args })
        } else { // use specific instance
          obj[key][key] = await vrpc.getInstance({ agent, className, instance })
        }
      } else {
        if (args) { // create anonymous/private instance
          obj[key][key] = await vrpc.create({ agent, className, args })
        } else { // observe an array of existing instances
          obj[key][key] = []
          if (typeof className === 'object') {
            const classNames = await vrpc.getAvailableClasses(agent)
            for (const name of classNames) {
              if (name.match(className)) {
                await this._registerProxy(obj[key], key, agent, events, name, vrpc)
              }
            }
          } else {
            await this._registerProxy(obj[key], key, agent, events, className, vrpc)
          }
        }
      }
    }
    this.setState({ ...obj, __global__: { vrpc, vrpcIsLoading: false } })
  }

  async componentWillUnmount () {
    const { backends } = this.props
    for (const [key, value] of Object.entries(backends)) {
      const { events = [] } = value
      if (events.length === 0) break
      const proxies = this.props[key]
      if (Array.isArray(proxies)) {
        for (const proxy of proxies) {
          for (const event of events) {
            await proxy.removeListener(event)
          }
        }
      } else {
        for (const event of events) {
          await proxies.removeListener(event)
        }
      }
    }
  }

  async _registerProxy (obj, key, agent, events, className, vrpc) {
    const instances = await vrpc.getAvailableInstances(className, agent)
    for (const instance of instances) {
      const proxy = await vrpc.getInstance({ agent, className, instance })
      proxy._className = className
      this._registerEvents(obj, key, proxy, events)
      obj[key].push(proxy)
    }
    vrpc.on('class', async (info) => {
      if (info.agent !== agent || info.className !== className) return
      const currentIds = this.state[key][key].map(x => x._targetId)
      const removed = currentIds.filter(x => !info.instances.includes(x))
      const added = info.instances.filter(x => !currentIds.includes(x))
      const current = this.state[key][key]
      const updated = current.filter(proxy => {
        return !removed.includes(proxy._targetId)
      })
      for (const instance of added) {
        const proxy = await vrpc.getInstance({
          agent,
          className: info.className,
          instance
        })
        proxy._className = info.className
        this._registerEvents(obj, key, proxy, events)
        updated.push(proxy)
      }
      this.setState({ [key]: { [key]: updated } })
    })
  }

  _registerEvents (obj, key, proxy, events) {
    for (const event of events) {
      proxy[event] = null
      proxy.on(event, async (...args) => {
        obj[key] = obj[key].filter(({ _targetId }) => proxy._targetId !== _targetId)
        switch (args.length) {
          case 0:
            obj[key].push({ ...proxy, [event]: undefined })
            break
          case 1:
            obj[key].push({ ...proxy, [event]: args[0] })
            break
          default:
            obj[key].push({ ...proxy, [event]: args })
        }
        this.setState({ [key]: { ...obj } })
      })
    }
  }

  _renderProviders (children, index = 0) {
    const Context = vrpcContexts[index]
    const Provider = Context.Provider
    if (index === 0) {
      return (
        <vrpcGlobalContext.Provider value={this.state.__global__}>
          <Provider value={this.state[Context.displayName]}>
            {this._renderProviders(children, index + 1)}
          </Provider>
        </vrpcGlobalContext.Provider>
      )
    }
    if (index < vrpcContexts.length - 1) {
      return (
        <Provider value={this.state[Context.displayName]}>
          {this._renderProviders(children, index + 1)}
        </Provider>
      )
    }
    return (
      <Provider value={this.state[Context.displayName]}>
        {children}
      </Provider>
    )
  }

  render () {
    const { loading } = this.props
    const { vrpcIsLoading } = this.state.__global__
    if (vrpcIsLoading) return loading || false
    const { children } = this.props
    return this._renderProviders(children)
  }
}

export function withVrpc (
  backendsOrPassedComponent,
  PassedComponent
) {
  let backends
  if (typeof backendsOrPassedComponent === 'string') {
    backends = [backendsOrPassedComponent]
  } else if (Array.isArray(backendsOrPassedComponent)) {
    backends = backendsOrPassedComponent
  } else {
    backends = vrpcContexts.map(x => x.displayName)
    PassedComponent = backendsOrPassedComponent
  }

  return class ComponentWithVrpc extends Component {
    _renderConsumers (PassedComponent, backends, props, index = 0) {
      const Context = vrpcContexts.find(x => x.displayName === backends[index])
      if (!Context) return <PassedComponent {...props} />
      const Consumer = Context.Consumer
      if (index === 0) {
        return (
          <vrpcGlobalContext.Consumer>
            {globalProps => (
              <Consumer>
                {vrpcProps => (
                  this._renderConsumers(
                    PassedComponent,
                    backends,
                    { ...props, ...globalProps, ...vrpcProps },
                    index + 1
                  )
                )}
              </Consumer>
            )}
          </vrpcGlobalContext.Consumer>
        )
      }
      if (index < backends.length - 1) {
        return (
          <Consumer>
            {vrpcProps => (
              this._renderConsumers(
                PassedComponent,
                backends,
                { ...props, ...vrpcProps },
                index + 1
              )
            )}
          </Consumer>
        )
      }
      return (
        <Consumer>
          {vrpcProps => <PassedComponent {...props} {...vrpcProps} />}
        </Consumer>
      )
    }

    render () {
      return this._renderConsumers(PassedComponent, backends, this.props)
    }
  }
}
