# API Reference

`vrpc-react` connects your React frontend to VRPC backends. The whole API is one factory call and the artifacts it returns:

- [`createVrpc(config)`](#createvrpcconfig) - define your VRPC topology; returns the provider and the hooks bound to it
- [`<VrpcProvider>`](#vrpcprovider-component) - supplies credentials and error handling; owns the connection
- [`useBackend(name, id?)`](#usebackendname-id) - access a configured backend from any component
- [`useClient()`](#useclient) - reactive access to the raw VRPC client
- [`VrpcError`](#error-model) - every error carries a machine-readable `code`

---

## `createVrpc(config)`

A factory that registers your backends and returns `{ VrpcProvider, useBackend, useClient }`, all bound to this configuration. Call it once at module level and export the result:

```ts
import { createVrpc } from 'vrpc-react'

export const { VrpcProvider, useBackend, useClient } = createVrpc({
  domain: 'my-app-domain',
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  backends: {
    todos: { agent: 'todo-agent', className: 'TodoList', instance: 'shared-todos' }
  }
})
```

Each factory is fully isolated: you can create several (even with identical backend key names) and mount their providers anywhere in the tree, including on child components.

For TypeScript users the backend keys are inferred, so `useBackend('todoz')` is a compile error.

### Options

| Property         | Type                            | Default                | Description                                                          |
| :--------------- | :------------------------------ | :--------------------- | :------------------------------------------------------------------- |
| `domain`         | `string`                        | `'vrpc'`               | The VRPC domain your agents are operating in.                        |
| `broker`         | `string`                        | `'wss://vrpc.io/mqtt'` | WebSocket URL of your MQTT broker.                                   |
| `backends`       | `Record<string, BackendConfig>` | `{}`                   | Declarative mapping of the backend instances your app depends on.    |
| `identity`       | `string`                        | auto-generated         | Custom identity announced to the VRPC system.                        |
| `mqttClientId`   | `string`                        | auto-generated         | Explicit MQTT client id.                                             |
| `bestEffort`     | `boolean`                       | `true`                 | Use MQTT QoS 0 (fire-and-forget) messaging.                          |
| `requiresSchema` | `boolean`                       | `false`                | Only accept backend instances that publish a schema.                 |
| `timeout`        | `number`                        | `12000`                | RPC and connect timeout in milliseconds.                             |
| `keepalive`      | `number`                        | `30`                   | MQTT keepalive in seconds.                                           |
| `log`            | `'console' \| Logger`           | `'console'`            | Logger passthrough to the underlying vrpc client.                    |
| `debug`          | `boolean`                       | `false`                | Verbose console logging of connection and instance lifecycle events. |

### `BackendConfig`

| Property      | Type                        | Required | Description                                                                                 |
| :------------ | :-------------------------- | :------- | :------------------------------------------------------------------------------------------ |
| `agent`       | `string`                    | yes      | Name of the agent that serves the class.                                                    |
| `className`   | `string`                    | yes      | Name of the remotely registered class.                                                      |
| `instance`    | `string`                    | no       | Named instance to use (see architectures below).                                            |
| `args`        | `unknown[]`                 | no       | Constructor arguments; providing this makes the backend active (it creates the instance).   |
| `healthCheck` | `boolean \| { intervalMs }` | no       | Periodic poll of the agent's static `Health.check()` (see [Health checks](#health-checks)). |

**The four backend architectures** - which properties you provide determines how the backend is managed:

1. **Create an anonymous instance:**
   - Provide: `agent`, `className`, `args`
2. **Create (if not exists) and use a named instance:** (Active)
   - Provide: `agent`, `className`, `instance`, `args`
3. **Use an existing named instance (never create):** (Passive)
   - Provide: `agent`, `className`, `instance`
4. **Manage all named instances of a class:** (Multi-instance)
   - Provide: `agent`, `className` (omit `instance` and `args`)
   - `useBackend` then returns a [manager object](#multi-instance-backends).

---

## `<VrpcProvider>` component

The component returned by `createVrpc`. It owns the MQTT connection (one fresh client per mount and per credential set) and always renders its children immediately - connection progress flows through the hooks' `status`.

### Props

| Prop       | Type                         | Default         | Description                                                    |
| :--------- | :--------------------------- | :-------------- | :------------------------------------------------------------- |
| `username` | `string`                     | -               | MQTT username, if your broker requires authentication.         |
| `password` | `string`                     | -               | MQTT password.                                                 |
| `token`    | `string`                     | -               | Token-based authentication (alternative to username/password). |
| `onError`  | `(error: VrpcError) => void` | `console.error` | Called for connection problems and backend lifecycle errors.   |

```jsx
root.render(
  <VrpcProvider username='app-user' password='super-secret'>
    <App />
  </VrpcProvider>
)
```

Notes:

- `onError` is consumed through a ref: passing an inline arrow function is safe and never affects the connection.
- Changing `token`, `username`, or `password` cleanly replaces the connection.
- `<React.StrictMode>` is fully supported.

---

## `useBackend(name, id?)`

The primary hook. Returns the state of a backend you declared in the `backends` configuration.

### Parameters

- `name` **(string)**: the key you used in the `backends` object. Unknown keys throw a `VrpcError` (`UNKNOWN_BACKEND`); for TypeScript users they are already a compile error.
- `id` **(string, optional)**: for multi-instance backends only - resolve the proxy of one managed instance.

### Returns

An object `{ backend, error, status }`:

| Field     | Type                                              | Description                                                           |
| :-------- | :------------------------------------------------ | :-------------------------------------------------------------------- |
| `backend` | `Proxied<T> \| null`                              | Proxy of the remote instance; `null` while connecting or unavailable. |
| `error`   | `VrpcError \| null`                               | Cause of an `offline` or `error` status; `null` when healthy.         |
| `status`  | `'connecting' \| 'ready' \| 'offline' \| 'error'` | Current backend state (see table below).                              |

For multi-instance backends the result additionally contains `ids` (a reactive, immutable `readonly string[]`), and `backend` is the always-present [manager object](#multi-instance-backends).

### Status semantics

| Status       | Meaning                                                                                                                                 |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `connecting` | Initial state: broker connection, agent, or instance not yet available. Also entered briefly during automatic recovery.                 |
| `ready`      | The proxy is resolved and callable (managers: the agent is online).                                                                     |
| `offline`    | Recoverable unavailability: broker connection lost, agent offline, or passive instance gone. `error.code` names the reason. Self-heals. |
| `error`      | An operation failed (creation, attach, health check, connect). Also self-heals when the underlying condition passes.                    |

One documented exception: a failing health check sets `status: 'error'` but **retains** the proxy in `backend`, so an already-working UI keeps functioning during the investigation.

### Typing the proxy

Pass an interface describing your remote class; every method becomes Promise-returning:

```ts
interface TodoListApi {
  addTodo (text: string): Todo
  getTodos (): Todo[]
}

const { backend, status } = useBackend<TodoListApi>('todos')
// backend?.addTodo returns Promise<Todo>
```

### Example

```jsx
import { useBackend } from './vrpc'

export function TodoApp () {
  const { backend: todos, error, status } = useBackend('todos')
  const [list, setList] = useState([])

  useEffect(() => {
    if (!todos) return
    todos.getTodos().then(setList)
    const handleUpdate = all => setList(all)
    todos.on('update', handleUpdate)
    return () => todos.off('update', handleUpdate)
  }, [todos])

  if (status === 'connecting') return <p>Connecting...</p>
  if (error) return <p>Backend problem ({error.code}): {error.message}</p>
  return <ul>{list.map(t => <li key={t.id}>{t.text}</li>)}</ul>
}
```

### Multi-instance backends

If a backend was configured **without** `instance` and `args` (architecture number 4), `useBackend(name)` returns a *manager*. The manager object is referentially stable for the provider's lifetime and always non-null:

| Member                              | Description                                                                                                                      |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `create(id, options?)`              | Create a new named instance. `options`: `{ args, className, agent }` (all optional). Resolves to a proxy.                        |
| `get(id)`                           | Obtain a proxy to an existing instance.                                                                                          |
| `delete(id)`                        | Delete a remote instance.                                                                                                        |
| `callStatic(functionName, ...args)` | Call a static function on the configured class. Also accepts a single options object `{ functionName, args, className, agent }`. |
| `callAll(functionName, ...args)`    | Call a member function on all instances; resolves to `Array<{ id, val, err }>`. Same calling conventions as `callStatic`.        |
| `ids`                               | Read-only, immutable array of the currently existing instance ids (also on the hook result, reactively updated).                 |

While the client is disconnected, manager methods reject with a `VrpcError` (`CLIENT_OFFLINE`).

**Targeting a specific instance:** pass the instance id as the second hook argument:

```jsx
const { backend, error, status } = useBackend('myManager', 'my-dynamic-id')
```

If the id does not exist (yet), `status` is `'error'` with code `INSTANCE_NOT_FOUND`; the hook resolves automatically as soon as the instance appears.

---

## `useClient()`

Reactive access to the raw underlying `VrpcClient` for advanced use cases: agent/class discovery, static calls outside any configured backend, low-level events.

### Client result

| Field    | Type                                                  | Description                                                        |
| :------- | :---------------------------------------------------- | :----------------------------------------------------------------- |
| `client` | `VrpcClient \| null`                                  | The client instance; `null` only before the provider's effect ran. |
| `status` | `'connecting' \| 'connected' \| 'offline' \| 'error'` | Live MQTT connection state.                                        |
| `error`  | `VrpcError \| null`                                   | Last connection-level error (e.g. `NETWORK_ERROR`).                |

### Static call example

```jsx
import { useClient } from './vrpc'

export function AdminPanel () {
  const { client, status } = useClient()

  const reboot = async () => {
    await client.callStatic({
      agent: 'my-agent',
      className: 'System',
      functionName: 'reboot'
    })
  }

  return <button disabled={status !== 'connected'} onClick={reboot}>Reboot</button>
}
```

For the full client API (`callStatic`, `callAll`, `getInstance`, discovery getters, events) see the [vrpc-js documentation](https://github.com/heisenware/vrpc-js).

---

## Error model

Every error surfaced by the library - in hook results and in `onError` - is an instance of the exported `VrpcError` class:

```ts
class VrpcError extends Error {
  code: VrpcErrorCode
  backendKey?: string // which backend was affected, when applicable
  agent?: string // which agent was involved, when applicable
}
```

| Code                       | Meaning                                                                    |
| :------------------------- | :------------------------------------------------------------------------- |
| `CONNECTION_FAILED`        | The initial `connect()` was rejected (timeout, authentication refusal).    |
| `CLIENT_OFFLINE`           | The MQTT connection was lost (also used by manager methods while offline). |
| `NETWORK_ERROR`            | The underlying MQTT client reported an error.                              |
| `AGENT_OFFLINE`            | A required agent went offline.                                             |
| `INSTANCE_GONE`            | A passive backend's instance disappeared.                                  |
| `INSTANCE_CREATION_FAILED` | Creating an active/anonymous instance failed.                              |
| `INSTANCE_ATTACH_FAILED`   | Attaching to a passive instance failed.                                    |
| `INSTANCE_NOT_FOUND`       | `useBackend(name, id)`: the id is not among the manager's ids.             |
| `HEALTH_CHECK_FAILED`      | A `healthCheck` poll rejected (the proxy is retained).                     |
| `UNKNOWN_BACKEND`          | Thrown: the key is not present in the factory configuration.               |
| `MISSING_PROVIDER`         | Thrown: a hook was used outside its factory's provider.                    |

`offline`-flavored conditions (`CLIENT_OFFLINE`, `AGENT_OFFLINE`, `INSTANCE_GONE`) recover automatically: when the broker connection, agent, or instance returns, the affected backends transition back to `ready` on their own.

---

## Health checks

Setting `healthCheck` on a backend makes the client call the static function `check` on a class named `Health` of that backend's agent (default every 30000 ms):

```ts
backends: {
  todos: {
    agent: 'todo-agent',
    className: 'TodoList',
    healthCheck: { intervalMs: 30000 } // or simply: true
  }
}
```

Your agent must register such a class:

```js
class Health {
  static check () {
    return true
  }
}
VrpcAdapter.register(Health)
```

A failing poll sets the backend to `status: 'error'` with code `HEALTH_CHECK_FAILED` (proxy retained) and calls `onError`; the next successful poll restores the previous state. Health polling complements the built-in agent online/offline tracking (MQTT last-will) with true end-to-end RPC liveness.
