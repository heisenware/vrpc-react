import React, { useState } from 'react'
import { useBackend } from 'react-vrpc'
import TodoItem from './TodoItem'
import Filter from './Filter'

export default function ShowTodos () {
  const [filter, setFilter] = useState('all')
  const [{ ids }] = useBackend('todos')
  return (
    <div>
      <ul>
        {ids.map(id => (
          <TodoItem key={id} id={id} filter={filter} />
        ))}
      </ul>
      <Filter onClick={setFilter} filter={filter} />
    </div>
  )
}
