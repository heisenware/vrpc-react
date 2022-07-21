import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { createVrpcProvider } from 'react-vrpc'

const broker = process.env.REACT_APP_BROKER_HOST
  ? `ws://${process.env.REACT_APP_BROKER_HOST}:8080/mqtt`
  : 'wss://vrpc.io/mqtt'

const VrpcProvider = createVrpcProvider({
  broker,
  domain: 'vrpc',
  backends: {
    todos: {
      agent: 'example-advanced-todos-agent',
      className: 'Todo'
    }
  }
})

const root = createRoot(document.getElementById('root'))
root.render(
  <VrpcProvider>
    <App />
  </VrpcProvider>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
