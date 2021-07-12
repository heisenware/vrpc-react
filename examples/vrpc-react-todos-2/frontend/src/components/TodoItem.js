import React, { useEffect, useState } from 'react'
import { useBackend } from 'react-vrpc'

export default function TodoItem ({ id, filter }) {
  const [todo] = useBackend('todos', id)
  const [data, setData] = useState({ text: '', completed: false })

  useEffect(() => {
    if (!todo) return
    todo.getData().then(data => setData(data))
    const handleUpdate = data => setData(data)
    todo.on('update', handleUpdate)
    return () => {
      todo.off('update', handleUpdate).catch(() => {})
    }
  }, [todo])

  function handleClick () {
    todo.toggleCompleted()
  }

  if (filter === 'completed' && !data.completed) return null
  if (filter === 'active' && data.completed) return null

  return (
    <li
      onClick={handleClick}
      style={{ textDecoration: data.completed ? 'line-through' : 'none' }}
    >
      {data.text}
    </li>
  )
}
