import React, { useState, useEffect } from 'react'
import { useBackend } from 'react-vrpc'
import VisibleTodoList from './VisibleTodoList'
import Filter from './Filter'

export default function ShowTodos () {
  const [filter, setFilter] = useState('all')
  const [data, setData] = useState([])
  const [todo, , refresh] = useBackend('todo')

  useEffect(() => {
    if (!todo) return
    todo.getTodos(filter).then(data => setData(data))
  }, [todo, filter])

  async function handleClick (index) {
    try {
      await todo.toggleTodo(index)
      refresh()
    } catch (err) {
      console.warn(
        `Could not toggle todo ${index + 1}, because: ${err.message}`
      )
    }
  }

  return (
    <div>
      <VisibleTodoList data={data} onClick={handleClick} />
      <Filter filter={filter} onClick={setFilter} />
    </div>
  )
}
