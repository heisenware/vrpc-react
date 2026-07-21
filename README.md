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
- **Self-Healing:** Broker disconnects and vanishing agents are detected, surfaced as statuses, and recovered from automatically - including re-established event subscriptions.

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
  // You can provide MQTT credentials (username/password) here
  <React.StrictMode>
    <VrpcProvider username='app-user' password='super-secret'>
      <App />
    </VrpcProvider>
  </React.StrictMode>
)
```

### Runtime connection parameters

Backend topology is usually static, but connection parameters often are not: the VRPC `domain` may be a tenant or workspace selected at login, `identity` the authenticated user, `mqttClientId` a per-session id. For these cases the provider accepts optional overrides - keep `createVrpc` at module level (so the typed hooks stay importable everywhere) and pass the runtime values as props:

```javascript
// vrpc.js - module level, static topology, no connection specifics needed
export const { VrpcProvider, useBackend, useClient } = createVrpc({
  backends: {
    workspace: { agent: 'workspace-agent', className: 'Workspace' }
  }
})

// App.jsx - the provider may stay mounted the whole time: it remains
// dormant (no connection) until domain AND broker are available
function App() {
  const session = useSession()

  return (
    <VrpcProvider
      domain={session?.tenantDomain}
      broker={session?.brokerUrl}
      identity={session?.email}
      username={session?.mqttUser}
      password={session?.mqttPassword}
    >
      {session ? <Workspace /> : <LoginScreen />}
    </VrpcProvider>
  )
}
```

Each override falls back to the `createVrpc` config value when omitted. `domain` and `broker` are special: they have **no defaults**, and the provider stays dormant - no client, no network traffic, hooks report `connecting` - until both are defined. You can therefore keep the provider mounted through your whole login flow without any risk of a connection to an unintended broker or domain; the first connection attempt starts exactly when both values become available.

Changing any override (or the credentials) tears the connection down and reconnects with the new values - several changes in one render cause a single reconnect. Hooks used outside their provider throw `MISSING_PROVIDER`. If you supply `mqttClientId`, keeping it stable across reconnects is your responsibility.

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
In case the backend class you are using is an event emitter (in C++, Node, or Python), you can subscribe and unsubscribe to those events on your proxy object just as usual! Always pair the subscription with an initial state fetch **in the same effect**, keyed on the proxy:

```javascript
useEffect(() => {
  if (!backend) return

  // 1. resync the current state on every (re)connect
  backend.getState().then(setState)

  // 2. subscribe to changes
  const handleUpdate = state => setState(state)
  backend.on('update', handleUpdate)

  return () => backend.off('update', handleUpdate) // cleanup
}, [backend])
```

VRPC handles the remote subscription over MQTT for you automatically. Event subscriptions are the highly recommended way to realize front-end notifications whenever something on the backend changes.

**Connection behavior & recovery:**
The MQTT keepalive (30 s by default) detects dead connections within about a minute - including background tabs that browsers throttle. The client then reconnects automatically, agents and instances re-announce themselves through retained MQTT messages, and every backend recovers to `ready` on its own; remote event subscriptions are re-established too. One consequence of MQTT's non-persistent sessions: messages published while you were disconnected are **not** delivered afterwards. The fetch-and-subscribe pattern above closes that gap - after every recovery the proxy object is replaced, your effect re-runs, and the state resyncs. Details in the [API reference](docs/api.md#reconnection-and-message-delivery).

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
