import React, { Component } from 'react'
import { VrpcRemote } from 'vrpc'

const VrpcContext = React.createContext()

export function createVrpcProvider ({
  domain = 'public.vrpc',
  broker = 'wss://vrpc.io/mqtt',
  backends
}) {
  return function VrpcProvider ({ children, username, password, token }) {
    return (
      <VrpcBackendMaker
        backends={backends}
        broker={broker}
        token={token}
        domain={domain}
        username={username}
        password={password}
      >
        {children}
      </VrpcBackendMaker>
    )
  }
}

class VrpcBackendMaker extends Component {
  constructor () {
    super()
    this.state = { vrpcIsLoading: true }
  }

  async componentDidMount () {
    const {
      backends,
      broker,
      token,
      domain,
      username,
      password
    } = this.props

    const vrpc = new VrpcRemote({ broker, token, domain, username, password })

    await vrpc.connected()
    const obj = {}
    for (const [key, value] of Object.entries(backends)) {
      const { agent, className, instance, args, events = [] } = value
      if (instance) {
        if (args) { // use specific instance and create if not exists
          obj[key] = await vrpc.create({ agent, className, instance, args })
        } else { // use specific instance
          obj[key] = await vrpc.getInstance({ agent, className, instance })
        }
      } else {
        if (args) { // create anonymous/private instance
          obj[key] = await vrpc.create({ agent, className, args })
        } else { // observe an array of existing instances
          obj[key] = []
          if (typeof className === 'object') {
            const classNames = await vrpc.getAvailableClasses(agent)
            for (const name of classNames) {
              if (name.match(className)) {
                await this._registerProxy(obj, key, agent, events, name, vrpc)
              }
            }
          } else {
            await this._registerProxy(obj, key, agent, events, className, vrpc)
          }
        }
      }
    }
    this.setState({ vrpc, ...obj, vrpcIsLoading: false })
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
      const currentIds = this.state[key].map(x => x._targetId)
      const removed = currentIds.filter(x => !info.instances.includes(x))
      const added = info.instances.filter(x => !currentIds.includes(x))
      const current = this.state[key]
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
      this.setState({ [key]: updated })
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
        this.setState({ [key]: obj[key] })
      })
    }
  }

  render () {
    const { loading } = this.props
    const { vrpcIsLoading } = this.state
    if (vrpcIsLoading) return loading || false
    const { children } = this.props
    return (
      <VrpcContext.Provider value={this.state}>
        {children}
      </VrpcContext.Provider>
    )
  }
}

export function withVrpc (PassedComponent) {
  return class ComponentWithVrpc extends Component {
    render () {
      return (
        <VrpcContext.Consumer>
          {vrpcInfo => (
            <PassedComponent {...this.props} {...vrpcInfo} />
          )}
        </VrpcContext.Consumer>
      )
    }
  }
}
