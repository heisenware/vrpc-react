// example/frontend/src/App.tsx
import { useEffect, useState, FormEvent } from 'react'
import { useBackend } from 'vrpc-react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function App () {
  const [todoBackend, error] = useBackend('todos')
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    if (!todoBackend) return

    // 1. Fetch the current state when we first connect
    todoBackend.getTodos().then(setTodos)

    // 2. Subscribe to remote events!
    // Whenever ANY user modifies the list, the backend emits 'update'
    // and this callback automatically fires in EVERY browser.
    const handleUpdate = (updatedTodos: Todo[]) => setTodos(updatedTodos)
    todoBackend.on('update', handleUpdate)

    // 3. Cleanup subscription on unmount
    return () => {
      todoBackend.off('update', handleUpdate)
    }
  }, [todoBackend])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Call the backend function seamlessly
    await todoBackend.addTodo(inputText)
    setInputText('')
  }

  if (error) {
    return <h2 style={{ color: 'red' }}>Connection Error: {error.message}</h2>
  }

  if (!todoBackend) {
    return <h2>Connecting to VRPC Todo Agent... ⏳</h2>
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '40px auto',
        fontFamily: 'sans-serif'
      }}
    >
      <h2>🌍 Global VRPC Todos</h2>

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
          onChange={e => setInputText(e.target.value)}
          placeholder='What needs to be done remotely?'
          style={{ flex: 1, padding: '8px' }}
        />
        <button type='submit' style={{ padding: '8px 16px' }}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
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
              onClick={() => todoBackend.toggleTodo(todo.id)}
              style={{
                cursor: 'pointer',
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => todoBackend.removeTodo(todo.id)}
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
      {todos.length === 0 && (
        <p style={{ color: '#888' }}>No todos yet. Add one!</p>
      )}
    </div>
  )
}
