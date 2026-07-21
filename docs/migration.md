# Migrating from 0.1.x to 1.0

Version 1.0 is a deliberate breaking release: the underlying idea (declarative backends, a provider, hooks that surface remote instances) is unchanged, but the API surface was reworked for correctness, type safety, and predictability. This page lists every breaking change and its migration.

## 1. The factory returns the hooks

`createVrpcProvider` is now `createVrpc`, and it returns the provider AND the hooks, bound to your configuration. `useBackend` / `useClient` are no longer importable from `'vrpc-react'`.

Before:

```js
// vrpc.js
export const VrpcProvider = createVrpcProvider({ ... })

// Component.jsx
import { useBackend } from 'vrpc-react'
const [todos, error] = useBackend('todos')
```

After:

```js
// vrpc.js
export const { VrpcProvider, useBackend, useClient } = createVrpc({ ... })

// Component.jsx
import { useBackend } from './vrpc'
const { backend: todos, error, status } = useBackend('todos')
```

Benefits: backend keys are compile-time checked for TypeScript users, several independent providers can coexist without any key collisions, and hooks fail with a clear error when used outside their provider.

## 2. `useBackend` returns a named object

The `[proxy, error]` tuple is replaced by `{ backend, error, status }` with `status: 'connecting' | 'ready' | 'offline' | 'error'`. There is no more guessing what two `null`s mean.

Multi-instance (manager) backends additionally expose `ids` on the result, and `backend.ids` is now a read-only, immutable array.

## 3. `useClient` is bound and reactive

`useClient(domain)` becomes `useClient()` (no argument; the domain is known to the factory). It returns `{ client, status, error }` and updates reactively as the connection state changes. Previously it returned `[client]` from a global registry and never triggered a re-render.

## 4. Errors carry codes instead of name strings

All errors are instances of the exported `VrpcError` class with a `code` property (e.g. `'AGENT_OFFLINE'`, `'INSTANCE_GONE'`, `'CLIENT_OFFLINE'`). Checking `error.name === 'NetworkError'` no longer works; use:

```js
import { VrpcError } from 'vrpc-react'

if (error instanceof VrpcError && error.code === 'NETWORK_ERROR') { ... }
```

Programmer errors now throw synchronously instead of being returned: an unknown backend key throws `UNKNOWN_BACKEND`, using a hook outside its provider throws `MISSING_PROVIDER`.

## 5. The provider always renders children

Previously the entire subtree was hidden (`null`) until the first broker connection. Now children render immediately and the hooks report `status: 'connecting'`. If you relied on "my component only renders when connected", gate on the status instead:

```jsx
const { backend, status } = useBackend('todos')
if (status === 'connecting') return <Spinner />
```

## 6. `checkHealth` is now `healthCheck`

```js
// before
todos: { agent: 'a1', className: 'TodoList', checkHealth: true }

// after (interval configurable, default 30000 ms)
todos: { agent: 'a1', className: 'TodoList', healthCheck: { intervalMs: 30000 } }
```

Health failures now set the backend's `error`/`status` (code `HEALTH_CHECK_FAILED`, the proxy is retained) and call `onError`; previously they were only logged to the console. The agent must still register a class named `Health` with a static `check()` function.

## 7. Connection behavior changes

- The MQTT `keepalive` now defaults to 30 seconds (vrpc's default). It was previously hardcoded to 3 hours. `keepalive`, `timeout`, and `log` are new passthrough options of `createVrpc`.
- Changing the `onError` prop identity no longer tears down the connection. Passing inline arrow functions is safe.
- Changing `token`, `username`, or `password` performs a clean reconnect with a fresh client.
- Broker-level connection loss is now handled: all backends report `offline` (`CLIENT_OFFLINE`) and recover automatically when the connection returns. Previously dead proxies were kept silently.
- React `StrictMode` is fully supported.

## 8. Packaging

- New runtime dependency: `use-sync-external-store` (the official React shim, ~1 kB).
- React peer range widened to `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`.
- `vrpc >= 3.7.0` remains the peer requirement.
