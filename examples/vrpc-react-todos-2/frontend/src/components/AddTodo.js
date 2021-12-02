import React from 'react'
import { useBackend } from 'react-vrpc'

export default function AddTodo () {
  const [todos] = useBackend('todos')

  function handleSubmit (e) {
    e.preventDefault()
    const { value } = input
    input.value = ''
    if (!value.trim()) return
    const id = Date.now().toString()
    todos.create(id, { args: [value] })
  }

  let input
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input ref={node => (input = node)} />
        <button type='submit'>Add Todo</button>
      </form>
    </div>
  )
}
