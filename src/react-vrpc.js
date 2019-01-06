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
      instanceName,
      args
    } = this.props
    if (agentId) {
      this.setState({
        [instanceName]: await vrpc.create(agentId, className, args)
      })
    }
  }

  render () {
    const {
      vrpc,
      agentId,
      instanceName,
      oldProps,
      PassedComponent
    } = this.props
    if (agentId && !this.state[instanceName]) return false
    if (agentId) {
      return (
        <PassedComponent
          {...oldProps}
          vrpc={vrpc}
          {...{[instanceName]: this.state[instanceName]}}
        />
      )
    }
    return <PassedComponent {...oldProps} vrpc={vrpc} />
  }
}

export function withVrpc (agentId, className, ...args) {
  // TODO Error handling of having defined agentId but not className
  return function _withVrpc (PassedComponent) {
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
                args={args}
                instanceName={lowerFirstChar(className)}
              />
            )}
          </VrpcContext.Consumer>
        )
      }
    }
  }
}
