# VRPC Client (React)

## Introduction

The react vrpc client is a complete solution for backend-frontend communication.
Unlike other libraries it allows to communicate with an arbitrary number
of potentially distributed backends at the same time.

The react vrpc client integrates seamlessly in an non-opinionated way
into modern react architectures. Built on top of the
[VRPC](https://github.com/bheisen/vrpc) library it allows to call backend code
directly, obsoleting the need to define any wrappers, schemas, resolvers or adapters.

## Getting started

Maybe the easiest way to get started is by following [this example](https://vrpc.io/examples/react-app).

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

4. Manage all named instances of a class:

    > define parameters: `agent`, `className`

    In this case your backend object is a manager for all instances of the
    defined `className`.

    You may also combine instances of different classes by using
    a regular expression in the `className` property.

### Wrap components and provide credentials

Wrap all components that require backend access into the `<VrpcProvider>`

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
> If working with `https://vrpc.io` as broker solution you may also
> use `token` instead of `username` and `password`.

### Give a component access to backend functionality

A component can use a single backend, any sub-set or all backends.

We highly recommend the new hook API for injecting backends one by one:

```javascript
import React from 'react'
import { useBackend } from 'react-vrpc'

function MyComponent () {
  const { backend, loading, error } = useBackend('myBackend')

  useEffect(() => {
    const ret = await backend.myBackendFunction('test')
  }, [backend])

  if (loading) return 'Loading...'
  if (error) return `Error! ${error.message}`

  [...]
}
export default MyComponent
```

but we support class components as well.

In this case backends are injected as regular props when using the
`withBackend` component-wrapper function:

```javascript
import React from 'react'
import { withBackend } from 'react-vrpc'

class MyComponent extends React.Component {

  async componentDidMount () {
    const { backend, loading, error } = this.props.myBackend
    const ret = await backend.myBackendFunction('test')
  }
}

export default withBackend('myBackend', MyComponent)
```

As you can see from the code snippets, your backend gets injected as an
object which provides the following properties:

| Property | Type           | Description
|----------|----------------|-----------------------------------------------------------------|
| `backend`| *proxy object* | reflects the actual backend instance
| `loading`| *boolean*      | indicates asynchronous activity
| `error`  | *error object* | any network or client issues
| `refresh`| *function*     | triggers a re-render of all components using specified backend

> **NOTE**
>
> You can restrict the backends available on your component and hence reduce
> the amount of re-renders when they change.
>
> Use a single backend by writing:
>
> ```javascript
> export default withBackend('myBackend', MyComponent)
> ```
>
> or any subset of backends utilizing an array:
>
> ```javascript
> export default withBackend(['myBackend1', 'myBackend3'], MyComponent)
> ```
>
> or load all available backends by omitting the argument:
>
> ```javascript
> export default withBackend(MyComponent)
> ```

### Access the VRPC client in your component

When calling static or global functions, or when interested in availabilities
of agents, classes, etc. it can be useful to directly access the VRPC client.

You can do so using the hook `useClient` which provides the properties:

| Property | Type           | Description
|----------|----------------|-----------------------------------------------------------------|
| `client` |*client object* | instance of the VRPC client
| `loading`| *boolean*      | indicates asynchronous activity
| `error`  | *error object* | any network or client issues

Or access the property `vrpc` that is always injected by the `withBackend` function
providing the same properties as described above.

### Good to know

In case the backend you are using is an event emitter, you can subscribe and
unsubscribe to those events in your proxy object just as usual. VRPC will handle
everything for you.

Event subscriptions are the recommended way to realize front-end notifications
whenever something on the backend changes.
