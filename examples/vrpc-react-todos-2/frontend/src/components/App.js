import React from 'react'
import AddTodo from './AddTodo'
import ShowTodos from './ShowTodos'
import { useBackend } from 'react-vrpc'

export default function App () {
  const [, error] = useBackend('todos')

  if (error) return `Error! ${error.message}`

  return (
    <>
      <h1>Todo List</h1>
      <AddTodo />
      <ShowTodos />
    </>
  )
}
