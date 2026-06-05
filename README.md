<div align="center">
  <h1>⚡ vrpc-react</h1>
  <p><strong>Stop writing API boilerplate. Call your backend directly from React.</strong></p>

[![npm version](https://img.shields.io/npm/v/vrpc-react.svg?style=flat-square)](https://www.npmjs.com/package/vrpc-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

**`vrpc-react`** provides the official, fully-typed React bindings for the [VRPC (Virtual Remote Procedure Call)](https://vrpc.io/) ecosystem.

Imagine a world where you don't need to write REST endpoints, GraphQL resolvers, or manage WebSocket payloads just to trigger a function on your server. With `vrpc-react`, your remote C++, Node.js, or Python instances become fully reactive, local-feeling objects right inside your React component tree.

## Why `vrpc-react`?

- **🚀 Zero API Boilerplate:** Call remote backend functions as if they were local JavaScript methods.
- **🔄 Truly Reactive:** Built completely on React Hooks (`useBackend`, `useClient`) and Context. As backend instances come online, go offline, or change state, your UI updates automatically.
- **🛡️ Type-Safe:** First-class TypeScript support out of the box.
- **🔌 Seamless Connectivity:** Abstracts away all MQTT broker connections, reconnection logic, and session management.
- **🩺 Auto-Health Checks:** Built-in polling to monitor the health and uptime of your remote agents.

---

## Installation

Install `vrpc-react` alongside its peer dependency, the core `vrpc` library:

```bash
npm install vrpc-react vrpc
```

_Note: Requires React 16.8+ for Hooks support._

---

## Step-by-Step Integration

The documentation explains the API in steps. When creating a new React project you will have to follow those steps in order to successfully integrate VRPC.

### 1. Creating a VrpcProvider

In the initialization file of your React app, define your VRPC topology using `createVrpcProvider`.

```javascript
import { createVrpcProvider } from 'vrpc-react'

export const VrpcProvider = createVrpcProvider({
  domain: 'my-app-domain',
  // Using the free public HiveMQ broker for testing
  broker:
    'wss://[broker.hivemq.com:8084/mqtt](https://broker.hivemq.com:8084/mqtt)',
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
   - _In this case, your backend object acts as a manager for all instances of the defined `className`._

### 2. Wrap components and provide credentials

Wrap all components that require backend access using the generated `<VrpcProvider>`. This provides the MQTT context to the rest of your app.

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { VrpcProvider } from './vrpc'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  // You can provide token, username, or password here
  <VrpcProvider username='app-user' password='super-secret'>
    <App />
  </VrpcProvider>
)
```

### 3. Give a component access to backend functionality

A component can use a single backend, any subset, or all backends. React's hook API allows injecting backends one by one using the injection key (e.g., `'myBackend'`).

```javascript
import React, { useEffect, useState } from 'react'
import { useBackend } from 'vrpc-react'

export default function MyComponent() {
  const [myBackend, error] = useBackend('myBackend')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!myBackend) return
    // Call the remote function seamlessly!
    myBackend.myBackendFunction('test').then(setData).catch(console.error)
  }, [myBackend])

  if (error) return <div>Error! {error.message}</div>
  if (!myBackend) return <div>Connecting to backend...</div>

  return <div>Backend responded with: {data}</div>
}
```

The `useBackend` hook returns an array containing:

| Index | Type           | Description                                                                  |
| :---- | :------------- | :--------------------------------------------------------------------------- |
| `[0]` | _proxy object_ | Reflects the actual backend instance (is `null` while loading/offline)       |
| `[1]` | _error object_ | Reflects any network, instantiation, or client issues (is `null` if healthy) |

### 4. Manage Multi-Instance Backends

If you defined a backend as a "Manager" (Architecture #4 above—no `instance` or `args` provided), the proxy returned by `useBackend('managerName')` exposes special lifecycle functions:

```javascript
// Create a new remote instance dynamically
backend.create(id, { args, className })

// Get a proxy to an existing instance
backend.get(id)

// Delete a remote instance
backend.delete(id)

// A reactive array of all currently available instance IDs
backend.ids
```

**Targeting a specific instance:**
Often you will want to access a specific managed instance directly inside a sub-component. You can accomplish this by passing the `id` as the second argument to the hook:

```javascript
// Automatically fetches and manages the proxy for 'my-dynamic-id'
const [instanceProxy, error] = useBackend('myManagingBackend', 'my-dynamic-id')
```

### 5. Access the raw VRPC client

When calling static/global functions, or when you are interested in the raw availability events of agents and classes, you can directly access the underlying VRPC client.

```javascript
import { useClient } from 'vrpc-react'

export default function AdminPanel() {
  const [client] = useClient('my-app-domain')

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

## 💡 Good to know

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

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
