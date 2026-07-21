// example/frontend/src/App.tsx
import { useEffect, useState, type SubmitEvent } from 'react'
import { useBackend } from './vrpc'
import ConnectionBadge from './ConnectionBadge'
import type { Todo, TodoListApi } from './TodoListApi'

export default function App () {
  // Typed proxy: every TodoListApi method returns a Promise remotely
  const { backend: todos, error, status } = useBackend<TodoListApi>('todos')
  const [items, setItems] = useState<Todo[]>([])
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    if (!todos) return

    // 1. Fetch the current state once the proxy is available
    todos.getTodos().then(setItems).catch(console.error)

    // 2. Subscribe to remote events: whenever ANY user modifies the
    //    list, the backend emits 'update' in EVERY connected browser.
    const handleUpdate = (updated: Todo[]) => setItems(updated)
    todos.on('update', handleUpdate)

    // 3. Cleanup the subscription
    return () => {
      todos.off('update', handleUpdate)
    }
  }, [todos])

  const handleAdd = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!todos || !inputText.trim()) return
    await todos.addTodo(inputText)
    setInputText('')
  }

  // The app shell always renders; the hook's status drives the body.
  let body
  if (status === 'connecting') {
    body = <p>Connecting to the VRPC todo agent... ⏳</p>
  } else if (status === 'offline') {
    body = (
      <p style={{ color: '#a66' }}>
        Backend unavailable ({error?.code}). It reconnects automatically -
        try restarting the agent.
      </p>
    )
  } else if (status === 'error') {
    body = (
      <p style={{ color: 'red' }}>
        Error ({error?.code}): {error?.message}
      </p>
    )
  } else {
    body = (
      <>
        <form
          onSubmit={handleAdd}
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            marginBottom: '20px'
          }}
        >
          <input
            value={inputText}
            onChange={event => setInputText(event.target.value)}
            placeholder='What needs to be done remotely?'
            style={{ flex: 1, padding: '8px' }}
          />
          <button type='submit' style={{ padding: '8px 16px' }}>
            Add
          </button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map(todo => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                borderBottom: '1px solid #eee'
              }}
            >
              <span
                onClick={() => todos?.toggleTodo(todo.id)}
                style={{
                  cursor: 'pointer',
                  textDecoration: todo.completed ? 'line-through' : 'none'
                }}
              >
                {todo.text}
              </span>
              <button
                onClick={() => todos?.removeTodo(todo.id)}
                style={{
                  color: 'red',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p style={{ color: '#888' }}>No todos yet. Add one!</p>
        )}
      </>
    )
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '40px auto',
        fontFamily: 'sans-serif'
      }}
    >
      <ConnectionBadge />
      <h2>🗺️ Global VRPC Todos</h2>
      {body}
    </div>
  )
}
