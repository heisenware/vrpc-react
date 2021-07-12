import React from 'react'

export default function VisibleTodoList ({ data, onClick }) {
  return (
    <ul>
      {data.map(({ text, completed }, i) => (
        <li
          key={`todo-${i}`}
          onClick={() => onClick(i)}
          style={{ textDecoration: completed ? 'line-through' : 'none' }}
        >
          {text}
        </li>
      ))}
    </ul>
  )
}
