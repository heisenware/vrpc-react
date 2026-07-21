// example/backend/agent.js
const { VrpcAgent, VrpcAdapter } = require('vrpc')
const TodoList = require('./TodoList')

// The frontend enables healthCheck for this agent: vrpc-react then
// periodically calls the static check() of a class named 'Health'.
class Health {
  static check () {
    return true
  }
}

// Register the classes so VRPC can serve them
VrpcAdapter.register(TodoList)
VrpcAdapter.register(Health)

async function main () {
  const agent = new VrpcAgent({
    domain: 'vrpc-react-demo',
    agent: 'todo-agent',
    broker: 'mqtts://broker.hivemq.com:8883' // Free public broker
  })

  await agent.serve()
  console.log('✅ Remote Todo Agent is online and waiting for React!')
}

main().catch(console.error)
