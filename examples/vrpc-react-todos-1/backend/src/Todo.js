/**
 * The Todo class manages all todo items
 */
class Todo {
  constructor () {
    this._todos = []
  }

  /**
   * Adds a todo item
   * @param {string} text The todo text
   */
  addTodo (text) {
    const todo = { text, completed: false }
    this._todos.push(todo)
  }

  /**
   * Toggles a todo item
   * @param {integer} index Index of the item to be toggled
   */
  toggleTodo (index) {
    const { completed } = this._todos[index]
    this._todos[index].completed = !completed
  }

  /**
   * Provides a filtered list of todo items
   * @param {string} filter Filters todo items: 'all', 'active' and 'completed'
   * are the allowed values
   * @returns {Object[]} An array of todo objects
   */
  getTodos (filter) {
    switch (filter) {
      case 'all': return this._todos
      case 'active': return this._todos.filter(x => !x.completed)
      case 'completed': return this._todos.filter(x => x.completed)
      default: throw new Error(`Invalid filter: ${filter}`)
    }
  }
}

module.exports = Todo
