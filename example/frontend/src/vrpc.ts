// example/frontend/src/vrpc.ts
import { createVrpcProvider } from 'vrpc-react';

export const VrpcProvider = createVrpcProvider({
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
      checkHealth: true
    }
  },
  debug: true
});
