// example/backend/agent.js
const { VrpcAgent, VrpcAdapter } = require('vrpc')
const TodoList = require('./TodoList')

// Register the class so VRPC can serve it
VrpcAdapter.register(TodoList)

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
