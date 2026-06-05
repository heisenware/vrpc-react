# Real-Time Collaborative Todos (`vrpc-react` Example)

Welcome to the magic of `vrpc-react`!

This example demonstrates how to build a fully reactive, real-time application **without writing a single API endpoint, GraphQL resolver, or explicit WebSocket handler.** By leveraging VRPC, we take a standard Node.js class (an `EventEmitter`) and seamlessly reflect its state and events directly into a React component tree.

## ✨ The Magic

In this demo, you will see:

1. A **Backend** (`TodoList.js`) written in pure JavaScript. It knows nothing about the network, HTTP, or React.
2. A **Frontend** (`App.tsx`) that calls backend functions like `todoBackend.addTodo()` as if they were local functions.
3. **Real-time Sync:** The frontend subscribes to the backend's `'update'` event. When _any_ user adds a todo, the backend emits the event, and _every_ connected React app instantly re-renders!

---

## 🏃‍♂️ How to Run

To experience the magic, you need to run both the backend agent and the frontend React app simultaneously.

### 1. Start the Backend Agent

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
node agent.js
```

You should see a message saying: `✅ Remote Todo Agent is online and waiting for React!`

### 2. Start the Frontend App

Open a **second** terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Your React application will start, usually accessible at `http://localhost:5173`.

---

## 🤯 The "Wow" Test

1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2. **Open a second browser window** (or even a different browser entirely) and navigate to the same URL. Place the windows side-by-side.
3. Add a Todo item in Window 1.
4. Watch it **instantly appear** in Window 2!
5. Toggle or delete an item in Window 2, and watch Window 1 update immediately.

You have just built a global, real-time collaborative state using standard class methods and events!

---

## 🧠 How it Works

Take a look at the code to see how little boilerplate is required:

- **`backend/TodoList.js`**: Notice how it's just a standard class extending `EventEmitter`. When the list changes, it calls `this.emit('update', this.todos)`.
- **`frontend/src/App.tsx`**: We use the `useBackend('todos')` hook. We subscribe to changes with `todoBackend.on('update', ...)` exactly like a local object. VRPC handles the entire distributed network layer under the hood using MQTT!
