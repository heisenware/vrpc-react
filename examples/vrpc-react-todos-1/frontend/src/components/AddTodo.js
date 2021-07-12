import React from 'react'
import { useBackend } from 'react-vrpc'

export default function AddTodo () {
  const [todo, , refresh] = useBackend('todo')

  async function handleSubmit (e) {
    e.preventDefault()
    const { value } = input
    input.value = ''
    if (!value.trim()) return
    await todo.addTodo(value)
    refresh()
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
