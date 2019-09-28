import React, { Component } from 'react'
import { VrpcRemote } from 'vrpc'

const VrpcContext = React.createContext()

export function createVrpcProvider ({ broker, token, backends }) {
  const vrpc = new VrpcRemote({ broker, token })
  return function VrpcProvider ({ children }) {
    return (
      <VrpcBackendMaker vrpc={vrpc} backends={backends}>
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
    const obj = {}
    for (const [key, value] of Object.entries(backends)) {
      const { domain, agent, className, args } = value
      obj[key] = await vrpc.create({ domain, agent, className, args })
    }
    this.setState({ vrpc, ...obj, vrpcIsLoading: false })
  }

  render () {
    const { vrpcIsLoading } = this.state
    if (vrpcIsLoading) return false
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
