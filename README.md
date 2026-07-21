# VRPC React

[![npm version](https://img.shields.io/npm/v/vrpc-react.svg?style=flat-square)](https://www.npmjs.com/package/vrpc-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**Stop writing API boilerplate.** VRPC (Variadic Remote Procedure Calls) allows you to call Node.js, C++, Python, and Arduino classes across any network as if they were local objects. Perfect for microservices, IoT edge devices, and directly driving React frontends - without the need for REST, GraphQL, or WebSocket boilerplate.

**`vrpc-react`** provides the official, fully-typed React bindings for the [VRPC](https://vrpc.io/) ecosystem.

Imagine a world where you don't need to write route definitions, API resolvers, or manage WebSocket payloads just to trigger a function on your server. With `vrpc-react`, your remote C++, Node.js, or Python instances become fully reactive, local-feeling objects right inside your React component tree.

## Why VRPC for React?

- **Zero API Boilerplate:** Call remote backend functions as if they were local JavaScript methods. Promises are handled natively!
- **Truly Reactive:** Built completely on React Hooks (`useBackend`, `useClient`) and Context. As backend instances come online, go offline, or change state, your UI updates automatically.
- **Type-Safe:** First-class TypeScript support out of the box.
- **Seamless Connectivity:** Abstracts away all MQTT broker connections, reconnection logic, and NAT traversal. No CORS headaches, no complex reverse proxies.
- **Auto-Health Checks:** Built-in polling to monitor the health and uptime of your remote distributed agents.

---

## Installation

Install `vrpc-react` alongside its peer dependency, the core `vrpc` library:

```bash
npm install vrpc-react vrpc
# or
yarn add vrpc-react vrpc
```

*Note: Requires React 16.8+ for Hooks support.*

---

## Step-by-Step Integration

The documentation explains the API in steps. When creating a new React project you will have to follow those steps in order to successfully integrate VRPC.

### 1. Define your topology with createVrpc

In the initialization file of your React app, define your VRPC topology using `createVrpc`. The factory returns the provider **and** the hooks, bound to your configuration - for TypeScript users the backend names are compile-time checked.

```javascript
// vrpc.js
import { createVrpc } from 'vrpc-react'

export const { VrpcProvider, useBackend, useClient } = createVrpc({
  domain: 'my-app-domain',
  // Using the free public HiveMQ broker for testing
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  backends: {
    myBackend: {
      agent: 'my-agent-name',
      className: 'MyRemoteClass',
      instance: 'my-instance-name',
      args: ['constructorArg1', 'constructorArg2']
    }
  }
})
```

**Understanding Backend Architectures:**

You can use any number of backends with VRPC by adding several objects under the `backends` property. Think of `myBackend` as a remotely available instance of the class you specified in the `className` property.

Depending on your backend architecture, `vrpc-react` allows you to manage instances in 4 distinct ways by simply omitting or including specific properties:

1. **Create an anonymous instance:**
   - Provide: `agent`, `className`, `args`
2. **Create (if not exists) and use a named instance:** (Active)
   - Provide: `agent`, `className`, `instance`, `args`
3. **Use an existing named instance (never create):** (Passive)
   - Provide: `agent`, `className`, `instance`
4. **Manage all named instances of a class:** (Multi-instance)
   - Provide: `agent`, `className` (omit `instance` and `args`)
   - *In this case, your backend object acts as a manager for all instances of the defined `className`.*

### 2. Wrap components and provide credentials

Wrap all components that require backend access using the generated `<VrpcProvider>`. Your app renders immediately - connection progress is reported through the hooks, and React StrictMode is fully supported.

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { VrpcProvider } from './vrpc'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  // You can provide token, username, or password here
  <React.StrictMode>
    <VrpcProvider username='app-user' password='super-secret'>
      <App />
    </VrpcProvider>
  </React.StrictMode>
)
```

### 3. Give a component access to backend functionality

A component can use a single backend, any subset, or all backends. Import the hook from your own `vrpc.js` (it is bound to your configuration) and inject backends by their key (e.g. `'myBackend'`).

```javascript
import React, { useEffect, useState } from 'react'
import { useBackend } from './vrpc'

export default function MyComponent() {
  const { backend, error, status } = useBackend('myBackend')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!backend) return
    // Call the remote function seamlessly!
    backend.myBackendFunction('test').then(setData).catch(console.error)
  }, [backend])

  if (status === 'connecting') return <div>Connecting to backend...</div>
  if (error) return <div>Error ({error.code}): {error.message}</div>

  return <div>Backend responded with: {data}</div>
}
```

The `useBackend` hook returns an object containing:

| Field     | Type           | Description                                                                                   |
| :-------- | :------------- | :-------------------------------------------------------------------------------------------- |
| `backend` | *proxy object* | Reflects the actual backend instance (is `null` while loading/offline)                        |
| `error`   | `VrpcError`    | Reflects any network, instantiation, or client issue (is `null` if healthy); carries a `code` |
| `status`  | *string*       | `'connecting' \| 'ready' \| 'offline' \| 'error'` - offline states self-heal automatically    |

**TypeScript bonus:** pass an interface of your remote class and get a fully typed, Promise-returning proxy: `useBackend<MyRemoteClass>('myBackend')`.

### 4. Manage Multi-Instance Backends

If you defined a backend as a "Manager" (Architecture #4 above - no `instance` or `args` provided), `useBackend('managerName')` returns a stable manager object plus a reactive `ids` array:

```javascript
const { backend, ids, error, status } = useBackend('managerName')

// Create a new remote instance dynamically
backend.create(id, { args, className })

// Get a proxy to an existing instance
backend.get(id)

// Delete a remote instance
backend.delete(id)

// ids: a reactive, immutable array of all currently available instance IDs
ids.map(id => ...)
```

**Targeting a specific instance:**
Often you will want to access a specific managed instance directly inside a sub-component. You can accomplish this by passing the `id` as the second argument to the hook:

```javascript
// Automatically fetches and manages the proxy for 'my-dynamic-id'
const { backend, error, status } = useBackend('myManagingBackend', 'my-dynamic-id')
```

### 5. Access the raw VRPC client

When calling static/global functions, or when you are interested in the raw availability events of agents and classes, you can directly access the underlying VRPC client.

```javascript
import { useClient } from './vrpc'

export default function AdminPanel() {
  // Reactive: status is 'connecting' | 'connected' | 'offline' | 'error'
  const { client, status } = useClient()

  const triggerStatic = async () => {
    await client.callStatic({
      agent: 'my-agent',
      className: 'System',
      functionName: 'reboot'
    })
  }

  // ...
}
```

---

## Good to know

**Event Subscriptions:**
In case the backend class you are using is an event emitter (in C++, Node, or Python), you can subscribe and unsubscribe to those events on your proxy object just as usual!

```javascript
useEffect(() => {
  if (!proxy) return

  const handleUpdate = data => console.log('Received data:', data)
  proxy.on('update', handleUpdate)

  return () => proxy.off('update', handleUpdate) // cleanup
}, [proxy])
```

VRPC will handle the remote subscription over MQTT for you automatically. Event subscriptions are the highly recommended way to realize front-end notifications whenever something on the backend changes.

**Health Checks:**
Set `healthCheck: true` (or `healthCheck: { intervalMs }`) on a backend configuration to let the client poll the corresponding agent periodically. The agent must register a class named `Health` exposing a static `check()` function. Failures surface in the backend's `error`/`status` and via `onError`. See the [API reference](docs/api.md#health-checks) for details.

**Resilience:**
Broker disconnects, vanishing agents, and lost instances degrade the affected backends to `status: 'offline'` and recover automatically when they return - no reloads, no manual re-subscription.

---

## The VRPC Ecosystem

Write your performance-critical code in **C++**, your data-science scripts in **Python**, your business logic in **Node.js**, and your IoT firmware on **Arduino**. Call them all identically.

- [VRPC for Node.js / Browser](https://github.com/heisenware/vrpc-js)
- [VRPC for Python](https://github.com/heisenware/vrpc-py)
- [VRPC for C++](https://github.com/heisenware/vrpc-cpp)
- [VRPC for Arduino / ESP32](https://github.com/heisenware/vrpc-arduino)

## Documentation

The full API reference for this library lives in **[docs/api.md](docs/api.md)**. Upgrading from 0.1.x? See the **[migration guide](docs/migration.md)**. For advanced schema validation and architecture overviews of the wider ecosystem, please visit our official documentation at **[vrpc.io/docs](https://vrpc.io/docs)**.

## Contributing

Contributions are welcome! Whether it's reporting a bug, proposing a new feature, or submitting a pull request, we'd love your help to make VRPC even better. Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## License

`vrpc-react` is released under the [MIT License](LICENSE).
