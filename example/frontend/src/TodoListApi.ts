// example/frontend/src/TodoListApi.ts
//
// Mirrors the remote class in example/backend/TodoList.js. Passing this
// interface to useBackend<TodoListApi>('todos') gives you a fully typed
// proxy: every method returns a Promise of the remote return value.

export interface Todo {
  id: number
  text: string
  completed: boolean
}

export interface TodoListApi {
  addTodo: (text: string) => Todo
  toggleTodo: (id: number) => Todo | undefined
  removeTodo: (id: number) => void
  getTodos: () => Todo[]
  // EventEmitter members become remote subscriptions
  on: (event: 'update', listener: (todos: Todo[]) => void) => void
  off: (event: 'update', listener: (todos: Todo[]) => void) => void
}
