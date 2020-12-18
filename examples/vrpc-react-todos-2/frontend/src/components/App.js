import React from 'react'
import AddTodo from './AddTodo'
import ShowTodos from './ShowTodos'
import { useBackend } from 'react-vrpc'

function App () {
  const { loading, error } = useBackend('todos')

  if (loading) return 'Loading...'
  if (error) return `Error! ${error.message}`

  return (
    <>
      <h1>Todo List</h1>
      <AddTodo />
      <ShowTodos />
    </>
  )
}

export default App
