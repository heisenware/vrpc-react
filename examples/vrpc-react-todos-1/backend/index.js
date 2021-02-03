const { VrpcAdapter, VrpcAgent } = require('vrpc')
// Adapts the code and makes it remotely callable
VrpcAdapter.register('./src/Todos')

async function main () {
  try {
    const vrpcAgent = new VrpcAgent({
      agent: 'example-todos-agent',
      domain: 'public.vrpc',
      broker: 'mqtt://vrpc.io:1883'
    })
    await vrpcAgent.serve()
  } catch (err) {
    console.log('VRPC triggered an unexpected error', err)
  }
}

// Start the agent
main()
