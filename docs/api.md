# `vrpc-react` API Reference

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
| `backends` | `Record<string, any>` | `{}` | An object defining the specific backend classes and instances you expect to interact with. |
| `token` | `string` | `undefined` | Optional authentication token if your MQTT broker requires access management. |
| `debug` | `boolean` | `false` | When true, enables verbose logging of incoming and outgoing VRPC messages in the console. |

### Returns

Returns a React Component (`VrpcProvider`) that must wrap your application (or the portion of your app that requires VRPC access).

### Example

```jsx
import { createVrpcProvider } from 'vrpc-react'

export const VrpcProvider = createVrpcProvider({
  domain: 'my-app-domain',
  broker: 'wss://[broker.hivemq.com:8884/mqtt](https://broker.hivemq.com:8884/mqtt)',
  backends: {},
  debug: process.env.NODE_ENV === 'development'
})

// In App.jsx:
// <VrpcProvider> <App /> </VrpcProvider>
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
      // Update local state based on dynamic agents joining/leaving
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
