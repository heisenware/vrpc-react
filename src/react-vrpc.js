import React, { Component } from 'react'
import { VrpcRemote } from 'vrpc'

const VrpcContext = React.createContext()

export function createVrpcProvider ({
  domain,
  broker,
  token,
  username,
  password,
  backends,
  loading
}) {
  const vrpc = new VrpcRemote({ broker, token, domain, username, password })
  return function VrpcProvider ({ children }) {
    return (
      <VrpcBackendMaker vrpc={vrpc} backends={backends} loading={loading}>
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
    const { vrpc, backends } = this.props
    await vrpc.connected()
    const obj = {}
    for (const [key, value] of Object.entries(backends)) {
      const { agent, className, instance, args } = value
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
          const instances = vrpc.getAvailableInstances(className, agent)
          for (const instance of instances) {
            const proxy = await vrpc.getInstance({ agent, className, instance })
            obj[key].push(proxy)
          }
          vrpc.on('class', async (info) => {
            if (info.agent !== agent || info.className !== className) return
            const removed = instances.filter(x => !info.instances.includes(x))
            const added = info.instances.filter(x => !instances.includes(x))
            const current = this.state[key]
            const updated = current.filter(proxy => {
              return removed.includes(proxy._targetId)
            })
            for (const instance of added) {
              const proxy = await vrpc.getInstance({
                agent,
                className,
                instance
              })
              updated.push(proxy)
            }
            this.setState({ [key]: updated })
          })
        }
      }
    }
    this.setState({ vrpc, ...obj, vrpcIsLoading: false })
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
