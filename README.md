# VRPC Client (React)

## Introduction

The react vrpc client is a complete solution for backend-frontend communication.
Unlike other libraries it allows to communicate with an arbitrary number
of potentially distributed backends at the same time.

The react vrpc client integrates seamlessly in a non-opinionated way into modern
react architectures. Built on top of the [VRPC](https://github.com/bheisen/vrpc)
library it allows to call backend code directly, obsoleting the need to define
any wrappers, schemas, resolvers or adapters.

## Getting started

Maybe the easiest way to get started is by following these two examples:

- [Simple React Todos App](examples/vrpc-react-todos-1/README.md)
- [Advanced React Todos App](examples/vrpc-react-todos-2/README.md)

## Documentation

### Create a VrpcProvider

In the `index.js` of your react app add something like:

```javascript
import { createVrpcProvider } from 'react-vrpc'

const VrpcProvider = createVrpcProvider({
  domain: '<domain>',
  broker: 'wss://vrpc.io/mqtt',
  backends: {
    myBackend: {
      agent: '<agentName>',
      className: '<className>',
      instance: '<instanceName>',
      args: ['<constructorArg1>', '<constructorArg2>', ...]
    }
  },
})
```

You can use any number of backends with VRPC by adding several objects under
the `backends` property. Refer to them later simply by their name
(here: `myBackend`).

Think of `myBackend` as if it was a remotely available
instance of the class you specified in the `className` property.

Depending on your backend architecture *react-vrpc* allows you to:

1. Create an (anonymous) instance of a class:

    > define parameters: `agent`, `className`, `args`

2. Create (if not exists) and use a named instance of class:

    > define parameters: `agent`, `className`, `instance`, `args`

3. Use (never create) an existing named instance of a class:

    > define parameters: `agent`, `className`, `instance`

4. <a name="managingBackend"></a> Manage all named instances of a class:

    > define parameters: `agent`, `className`

    In this case your backend object is a manager for all instances of the
    defined `className`.

    You may also combine instances of different classes by using
    a regular expression in the `className` property.

### Wrap components and provide credentials

Wrap all components that require backend access using the `<VrpcProvider>`

```javascript
ReactDOM.render(
  <VrpcProvider username='test' password='secret'>
    <Router>
      <Switch>
        <Route exact path='/myComponent' component={MyComponent} />
      </Switch>
    </Router>
  </VrpcProvider>
  document.getElementById('root')
```

> **NOTE**
>
> If working with `https://vrpc.io` as broker solution
> use `token` instead of `username` and `password`.

### Give a component access to backend functionality

A component can use a single backend, any sub-set or all backends.

React's hook API allows injecting backends one by one:

```javascript
import React from 'react'
import { useBackend } from 'react-vrpc'

function MyComponent () {
  const [myBackend, error] = useBackend('myBackend')

  useEffect(() => {
    if (!myBackend) return
    myBackend.myBackendFunction('test').then(ret => console.log(ret))
  }, [myBackend])

  if (error) return `Error! ${error.message}`

  [...]
}
export default MyComponent
```

As you can see from the code snippets, your backend gets injected as an
array which provides the following properties:

| Property | Type            | Description
|----------|-----------------|-----------------------------------------------------------------|
| `backend`| *proxy object*  | reflects the actual backend instance (is `null` while loading)
| `error`  | *error message* | any network or client issues
| `refresh`| *function*      | triggers a re-render of all components using specified backend

### Access an individual instance belonging to a managing backend

If you defined a backend in the way as shown [here](#managingBackend) it allows
you to `create`, `get`, and `delete` instances using the functions:

```javascript
backend.create(id, { args, className })
```

* `id` \<string>: id of the managed instance
* `args` \<array>: constructor arguments (optional)
* `className` \<string>: name of the class (optional)

```javascript
backend.get(id)
```

* `id` \<string>: id of the managed instance

```javascript
backend.delete(id)
```

* `id` \<string>: id of the managed instance

Often you will want access a specific managed instance in a component. This
can be accomplished by using the hook function:

```javascript
useBackend('myManagingBackend', id)
```

### Access the VRPC client in your component

When calling static or global functions, or when interested in availabilities
of agents, classes, etc. it can be useful to directly access the VRPC client.

You can do so using the hook `useClient` which provides the properties:

| Property | Type            | Description
|----------|-----------------|-------------------------------------------------------|
| `client` |*client object*  | instance of the VRPC client (is `null` while loading)
| `error`  | *error message* | any network or client issues

### Good to know

In case the backend you are using is an event emitter, you can subscribe and
unsubscribe to those events in your proxy object just as usual. VRPC will handle
everything for you.

Event subscriptions are the recommended way to realize front-end notifications
whenever something on the backend changes.
