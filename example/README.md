# Real-Time Collaborative Todos (`vrpc-react` Example)

Welcome to the magic of `vrpc-react`!

This example demonstrates how to build a fully reactive, real-time application **without writing a single API endpoint, GraphQL resolver, or explicit WebSocket handler.** By leveraging VRPC, we take a standard Node.js class (an `EventEmitter`) and seamlessly reflect its state and events directly into a React component tree.

## What you will see

1. A **Backend** (`backend/TodoList.js`) written in pure JavaScript. It knows nothing about the network, HTTP, or React.
2. A **Frontend** (`frontend/src/App.tsx`) that calls backend functions like `todos.addTodo()` as if they were local functions - fully typed via `useBackend<TodoListApi>('todos')`.
3. **Real-time sync:** the frontend subscribes to the backend's `'update'` event. When _any_ user adds a todo, the backend emits the event, and _every_ connected React app instantly re-renders.
4. **Connection awareness:** a status badge driven by `useClient()`, and a UI that renders distinct states for `connecting`, `ready`, `offline`, and `error` - the app shell is visible immediately, even before the broker connection exists.
5. **Resilience:** agents and connections can come and go; the UI degrades and self-heals automatically.

---

## How to Run

To experience the magic, you need to run both the backend agent and the frontend React app simultaneously.

### 1. Start the Backend Agent

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
npm start
```

You should see a message saying: `✅ Remote Todo Agent is online and waiting for React!`

### 2. Start the Frontend App

Open a **second** terminal window and navigate to the `frontend` directory (requires Node.js >= 20.19):

```bash
cd frontend
npm install
npm run dev
```

Your React application will start, usually accessible at `http://localhost:5173`.

---

## The "Wow" Test

1. Open your browser and navigate to the frontend URL (e.g. `http://localhost:5173`).
2. **Open a second browser window** (or even a different browser entirely) and navigate to the same URL. Place the windows side-by-side.
3. Add a Todo item in Window 1.
4. Watch it **instantly appear** in Window 2!
5. Toggle or delete an item in Window 2, and watch Window 1 update immediately.

You have just built a global, real-time collaborative state using standard class methods and events!

## The Resilience Test

The example is also a live demo of the failure semantics:

1. **Kill the agent** (Ctrl+C in the backend terminal). Within moments every browser shows the `offline` state (`AGENT_OFFLINE`) - the app keeps rendering.
2. **Restart the agent** (`npm start`). The UI recovers to `ready` automatically; no reload needed.
3. **Cut the broker connection** (in the browser dev tools, switch the network to "Offline"). The badge turns `offline` (`CLIENT_OFFLINE`).
4. **Restore the network.** The MQTT client reconnects, retained events replay, and the todos come back on their own.

---

## How it Works

Take a look at the code to see how little boilerplate is required:

- **`backend/TodoList.js`**: a standard class extending `EventEmitter`. When the list changes, it calls `this.emit('update', this.todos)`.
- **`backend/agent.js`**: registers `TodoList` plus a tiny `Health` class (`static check ()`) that the frontend's `healthCheck` option polls.
- **`frontend/src/vrpc.ts`**: one `createVrpc` call defines the topology and exports the bound `VrpcProvider`, `useBackend`, and `useClient`.
- **`frontend/src/App.tsx`**: `useBackend<TodoListApi>('todos')` returns `{ backend, error, status }`; subscriptions work like on a local `EventEmitter`. VRPC handles the entire distributed network layer under the hood using MQTT.
- **`frontend/src/main.tsx`**: runs under `<React.StrictMode>` - the library is fully StrictMode-safe.
