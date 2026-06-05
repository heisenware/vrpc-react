// example/backend/TodoList.js
const EventEmitter = require('events')

class TodoList extends EventEmitter {
  constructor () {
    super()
    this.todos = []
    this.idCounter = 0
  }

  addTodo (text) {
    const todo = { id: ++this.idCounter, text, completed: false }
    this.todos.push(todo)
    // Emitting this event will magically trigger the React hook!
    this.emit('update', this.todos)
    return todo
  }

  toggleTodo (id) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.emit('update', this.todos)
    }
    return todo
  }

  removeTodo (id) {
    this.todos = this.todos.filter(t => t.id !== id)
    this.emit('update', this.todos)
  }

  // Get the initial state when a client first connects
  getTodos () {
    return this.todos
  }
}

module.exports = TodoList
