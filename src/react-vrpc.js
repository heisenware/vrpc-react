import React, { Component } from 'react'
import { VrpcRemote } from 'vrpc'
import { lowerFirstChar } from './utils'

const VrpcContext = React.createContext()

export function createVrpcProvider ({
  topicPrefix,
  brokerUrl
} = {}) {
  const vrpc = new VrpcRemote({ topicPrefix, brokerUrl })
  return function VrpcProvider ({ children }) {
    return (
      <VrpcContext.Provider value={vrpc}>
        {children}
      </VrpcContext.Provider>
    )
  }
}

class VrpcInstanceMaker extends Component {
  constructor () {
    super()
    this.state = {}
  }

  async componentDidMount () {
    const {
      vrpc,
      agentId,
      className,
      instanceName
    } = this.props
    this.setState({
      [instanceName]: await vrpc.create(agentId, className)
    })
  }

  render () {
    const { instanceName, oldProps, PassedComponent } = this.props
    if (!this.state[instanceName]) return false
    return (
      <PassedComponent
        {...oldProps}
        {...{[instanceName]: this.state[instanceName]}}
      />
    )
  }
}

export function connectVrpc (agentId, className) {
  return function withVrpc (PassedComponent) {
    return class ComponentWithVrpc extends Component {
      render () {
        return (
          <VrpcContext.Consumer>
            {vrpc => (
              <VrpcInstanceMaker
                oldProps={this.props}
                PassedComponent={PassedComponent}
                vrpc={vrpc}
                agentId={agentId}
                className={className}
                instanceName={lowerFirstChar(className)}
              />
            )}
          </VrpcContext.Consumer>
        )
      }
    }
  }
}
