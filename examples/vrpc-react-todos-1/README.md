# Simple React Todos App

This example shows how easily you can implement a single-page-application that
loads its data from a backend asynchronously. The idea is to end up with the
same user-experience as is demonstrated in the [redux
example](https://redux.js.org/basics/example), but - of course - using VRPC and
introducing real backend communication.

Let's start from scratch with a new directory, e.g. `vrpc-react-todos-1`. Once
created, cd into it and you are good to go.

## STEP 1: Implementation of the backend

Setup the project's file structure like so:

```bash
mkdir backend
cd backend
npm init -f -y
npm install vrpc
mkdir src
```

The backend should simply organize our todos, this is quickly done by writing
down a class like that:

*src/Todo.js*

```javascript
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
```

Now, we expose this class to be remotely available through VRPC:

*index.js*

```javascript
const { VrpcAdapter, VrpcAgent } = require('vrpc')
// Register class "Todos" to be remotely callable
VrpcAdapter.register(require('./src/Todo'))

async function main () {
  try {
    const vrpcAgent = new VrpcAgent({
      agent: 'example-todos-agent',
      domain: 'vrpc'
    })
    await vrpcAgent.serve()
  } catch (err) {
    console.log('VRPC triggered an unexpected error', err)
  }
}

main()
```

> **IMPORTANT**
>
> As we are using VRPC's free but public domain, we have to make sure that
> our agent name is unique. Modify the name to something that's unique to you.
>

That's already it for the backend!

Once started,

```bash
node index.js
```

you can immediately test your backend with [VRPC Live](https://live.vrpc.io).
Simply select `vrpc` as domain and see your backend online.

## STEP 2: Implementation of the frontend

Next let's setup the **frontend**. Make sure you are back in the root directory
(i.e. `vrpc-react-todos-1`), then run:

```bash
npx create-react-app frontend
cd frontend
npm install vrpc
npm install react-vrpc
mkdir -p src/components
```

This creates a lot of files, we will go through the ones needed one by one.
All other files can afterwards be deleted, but don't also harm.

*src/index.js*

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { createVrpcProvider } from 'react-vrpc'

const VrpcProvider = createVrpcProvider({
  domain: 'vrpc',
  backends: {
    todos: {
      agent: 'example-todos-agent',
      className: 'Todo',
      instance: 'react-todo',
      args: []
    }
  }
})

ReactDOM.render(
  <React.StrictMode>
    <VrpcProvider>
      <App />
    </VrpcProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
```

In this file we are defining the available backends, here it's just one -
a single instance of our `Todo` class. In this case, the fronted creates a
new instance of the `Todo` class with the explicit name `react-todo`. If
an instance with that name existed before, VRPC will just attach to and not
re-create it.

The `VrpcProvider` component manages the state of all backends and provides the
`useBackend` hook to inject backend-proxy objects into components that need it.

*src/components/App.js*

```javascript
import React from 'react'
import AddTodo from './AddTodo'
import ShowTodos from './ShowTodos'
import { useBackend } from 'react-vrpc'

export default function App () {
  const [, error] = useBackend('todo')

  if (error) return `Error! ${error.message}`

  return (
    <>
      <h1>Todo List</h1>
      <AddTodo />
      <ShowTodos />
    </>
  )
}
```

This file defines the main `App` component that was included in the
`ReactDOM.render` method of the `index.js` file. It wraps two other components:

* `AddTodo` - renders the form allowing to submit a new todo item
* `ShowTodos` - renders the list of todos and the filtering buttons

Before those components are rendered we check that our required backend is
available without errors.

*src/components/AddTodo.js*

```javascript
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
```

This component adds a new todo item to the list. It accomplishes
that by directly calling the corresponding function on the backend.

The backend proxy-instance got injected through the `useBackend` hook and
is available under the `todo` variable.

You can see how simple it is to call the backend if you look at the
implementation of the form submit handler:

```javascript
await todo.addTodo(value)
```

Just remember that all backend calls return a promise, as
a network is involved that inherently makes all functions asynchronous.

Also note the call to

```javascript
refresh()
```

which instructs all other components using the `todo` backend to update
(re-render). This is important, as we mutated the backend object and hence need
to synchronize the frontend state again.

*src/components/ShowTodos.js*

```javascript
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
```

This component does two things with the backend:

1. Retrieves a list of todos from the backend

    ```javascript
    await todo.getTodos(filter)
    ```

2. Toggles the `completed` state of a todo item (upon click)

    ```javascript
    await todo.toggleTodo(index)
    ```

Again, note the `refresh()` call after having changed the backend by toggling
the todo item's completed state.

To finally render the todos, the stateless component `<VisibleTodoList>` is
utilized.

*src/components/VisibleTodoList.js*

```javascript
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
```

The `<Filter>` component forwards the user's interaction w.r.t. the current
filtering value.

*src/components/Filter.js*

```javascript
import React from 'react'

export default function Filter ({ onClick, filter }) {
  return (
    <div>
      <span>Show: </span>
      <button
        onClick={() => onClick('all')}
        disabled={filter === 'all'}
        style={{ marginLeft: '4px' }}
      >
        All
      </button>
      <button
        onClick={() => onClick('active')}
        disabled={filter === 'active'}
        style={{ marginLeft: '4px' }}
      >
        Active
      </button>
      <button
        onClick={() => onClick('completed')}
        disabled={filter === 'completed'}
        style={{ marginLeft: '4px' }}
      >
        Completed
      </button>
    </div>
  )
}
```

Well, and that's already it!

Your todos app is fully functional and you can play with it.

> **NOTE**
>
> This example shows only basic features of react-vrpc. You can find
> more documentation [here](https://vrpc.io/docs/react) and use
> this example as a starting point to build more complex interactions.

## Optional steps to make your communication private

Using the services from [Heisenware GmbH](https://heisenware.com) you can make
your communication private by obtaining an exclusive and access controlled
domain.

### STEP A: Create a Heisenware account

If you already have an account, simply skip this step.

If not, quickly create a new one
[here](https://admin.heisenware.cloud/#/createAccount). It takes less than a
minute and the only thing required is your name and a valid email address.

### STEP B: Get a domain

If you already have a domain, simply skip this step.

If not, navigate to the `Domains` tab in the [Admin
Tool](https://admin.heisenware.cloud) and click *ADD DOMAIN*, choose a free
domain and hit *Start 30 days trial* button.

### STEP C: Test connectivity

For any agent to work, you must provide it with a valid domain and access
token. You get an access token from your [Admin
Tool](https://admin.heisenware.cloud) using the *Access Control* tab.

Simply copy the default *Agent Token* or create a new one and use this.

With that you are ready to make the communication between frontend and backend
private.

In the backend use:

```javascript
const vrpcAgent = new VrpcAgent({
  domain: '<yourDomain>',
  agent: '<yourAgent>',
  token: '<yourToken>',
  broker: 'wss://heisenware.cloud'
})
```

And adapt the *index.js* file in the frontend to:

```javascript
const VrpcProvider = createVrpcProvider({
  domain: '<yourDomain>',
  broker: 'wss://heisenware.cloud'
  // [...]
})

// [...]

<VrpcProvider token=<yourToken> >
```

 **IMPORTANT**
>
> Use `heisenware.cloud` as broker host when working with professional
> Heisenware accounts.
>
