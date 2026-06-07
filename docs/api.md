# API Reference

The `vrpc-react` library provides seamless integration between your React frontend and your VRPC backend. It is built around a Context Provider and a set of custom hooks to manage connections, agent discovery, and remote function execution effortlessly.

---

## `createVrpcProvider(options)`

A factory function that initializes the VRPC connection and generates a React Context Provider configured for your specific MQTT broker and domains.

### Parameters

Takes a single configuration object with the following properties:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `domain` | `string` | **Required** | The global VRPC domain your agents are operating in. |
| `broker` | `string` | **Required** | The WebSocket URL of your MQTT broker (e.g., `wss://broker.hivemq.com:8884/mqtt`). |
| `backends` | `Record<string, BackendConfig>` | `{}` | A declarative mapping of backend class instances your app depends on. |
| `token` | `string` | `undefined` | Optional authentication token if your MQTT broker requires access management. |
| `debug` | `boolean` | `false` | When true, enables verbose logging of incoming and outgoing VRPC messages in the console. |

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

#### Example Configuration

```jsx
import { createVrpcProvider } from 'vrpc-react'

export const VrpcProvider = createVrpcProvider({
  domain: 'my-app-domain',
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  backends: {
    // A shared Todo list instance
    todos: {
      agent: 'todo-agent',
      className: 'TodoList',
      instance: 'shared-todos'
    },
    // A specific user's profile, passing arguments to the constructor if it needs to be created
    userProfile: {
      agent: 'database-agent',
      className: 'UserProfile',
      instance: 'user-1234',
      args: ['1234', { loadPreferences: true }]
    }
  }
})
```

---

## `useBackend(backendId)`

This is the primary hook you will use in your components. It consumes the aliases you defined in your `backends` configuration and returns a fully strongly-typed proxy of your remote class.

### Parameters

* `backendId` **(string)**: The alias key you defined in the `backends` object (e.g., `'todos'` or `'userProfile'`).

### Returns

Returns an array (tuple) containing the remote class instance and its initialization status:

* `[backend, status]`
  * `backend` **(Proxy | null)**: The remote object proxy. You can call methods directly on this object (e.g., `await backend.addTodo('Buy milk')`).
  * `status` **('connecting' | 'ready' | 'offline' | 'error')**: The current state of this specific backend instance.

### Example

```jsx
import React, { useState, useEffect } from 'react'
import { useBackend } from 'vrpc-react'

export function TodoApp() {
  const [todos, status] = useBackend('todos')
  const [list, setList] = useState([])

  // Fetch initial data when the backend is ready
  useEffect(() => {
    if (status !== 'ready') return
    todos.getTodos().then(setList)

    // Subscribe to backend events!
    const handleAdd = (newTodo) => setList(prev => [...prev, newTodo])
    todos.on('todoAdded', handleAdd)

    return () => todos.off('todoAdded', handleAdd)
  }, [todos, status])

  const handleAddClick = async () => {
    // Call the remote Node.js/C++ function directly
    await todos.addTodo('Learn VRPC')
  }

  if (status === 'connecting') return <p>Connecting to backend...</p>
  if (status === 'offline') return <p>The backend agent is offline.</p>

  return (
    <div>
      <ul>{list.map(t => <li key={t.id}>{t.text}</li>)}</ul>
      <button onClick={handleAddClick}>Add Todo</button>
    </div>
  )
}
```

---

## `useClient(domain)`

A React hook that provides direct access to the raw VRPC client instance for a specific domain. This is primarily used for advanced use cases like dynamic agent discovery, global event listening, or calling static methods before an instance is fully initialized.

### Parameters

* `domain` **(string)**: The domain you want to connect to. This must match the domain provided to your `VrpcProvider`.

### Returns

Returns an array (tuple) containing the client instance and its current connection status:

* `[client, status]`
  * `client` **(VrpcClient | null)**: The raw VRPC client. Will be `null` while initializing.
  * `status` **('connecting' | 'online' | 'offline' | 'error')**: The current connection state of the MQTT transport layer.

### Example

```jsx
import { useEffect, useState } from 'react'
import { useClient } from 'vrpc-react'

export function GlobalRadar() {
  const [client, status] = useClient('my-app-domain')
  const [agents, setAgents] = useState([])

  useEffect(() => {
    if (!client) return

    const handleAgent = ({ agent, status }) => {
      console.log(`Agent ${agent} went ${status}`)
    }

    client.on('agent', handleAgent)
    return () => client.off('agent', handleAgent)
  }, [client])

  if (status !== 'online') return <p>Connecting...</p>

  return <div>Radar Active.</div>
}
```

---

## Raw Client API (`client.*`)

When you access the raw client via `useClient`, it exposes the core VRPC JavaScript API methods for low-level control.

### `client.callStatic(options)`

Executes a static function on a specific class within a specific agent.

* **`options.agent`** *(string)*: The name of the target agent.
* **`options.className`** *(string)*: The registered class name on the backend.
* **`options.functionName`** *(string)*: The name of the static method to call.
* **`options.args`** *(Array)*: An array of arguments to pass to the function.

### `client.on(event, callback)`

Subscribes to global VRPC events (e.g., `agent` discovery, `class` discovery, or custom emitted events).

### `client.off(event, callback)`

Removes an active event listener to prevent memory leaks. Always call this in your `useEffect` cleanup function.
