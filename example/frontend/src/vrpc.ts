// example/frontend/src/vrpc.ts
import { createVrpc } from 'vrpc-react'

// The factory returns the provider AND the hooks, bound to this config.
// Backend keys ('todos') are compile-time checked in useBackend calls.
export const { VrpcProvider, useBackend, useClient } = createVrpc({
  domain: 'vrpc-react-demo',
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  backends: {
    todos: {
      className: 'TodoList',
      agent: 'todo-agent',
      // By specifying an instance name, VRPC ensures all users
      // connect to the EXACT SAME shared TodoList object!
      instance: 'shared-global-todos',
      args: [], // constructor arguments
      // Polls the agent's static Health.check() (see backend/agent.js)
      healthCheck: { intervalMs: 30000 }
    }
  },
  debug: true
})
