import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { createVrpcProvider } from 'react-vrpc'

const broker = process.env.REACT_APP_BROKER_HOST
  ? `ws://${process.env.REACT_APP_BROKER_HOST}:8080/mqtt`
  : 'wss://vrpc.io/mqtt'

const VrpcProvider = createVrpcProvider({
  broker,
  domain: 'public.vrpc',
  backends: {
    todo: {
      agent: 'example-todos-agent',
      className: 'Todo',
      instance: 'react-todo',
      args: []
    }
  }
})

ReactDOM.render(
  <React.StrictMode>
    <VrpcProvider>
      <App />
    </VrpcProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
