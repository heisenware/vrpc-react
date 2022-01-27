const { VrpcAdapter, VrpcAgent } = require('vrpc')
// Adapts the code and makes it remotely callable
VrpcAdapter.register('./src/Todo')

const broker = process.env.REACT_APP_BROKER_HOST
  ? `mqtt://${process.env.REACT_APP_BROKER_HOST}:1883`
  : 'mqtts://vrpc.io:8883'

async function main () {
  try {
    const vrpcAgent = new VrpcAgent({
      broker,
      agent: 'example-todos-agent',
      domain: 'vrpc'
    })
    await vrpcAgent.serve()
  } catch (err) {
    console.log('VRPC triggered an unexpected error', err)
  }
}

// Start the agent
main()
