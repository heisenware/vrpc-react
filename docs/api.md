# Reference Documentation

The documentation explains the API in steps. When creating a new React
project you will have to follow those steps in order to successfully integrate
VRPC.

## Creating a VrpcProvider

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

Optionally, you may provide the `identity` property to give your VRPC client
a custom identity.

You can use any number of backends with VRPC by adding several objects under
the `backends` property. Refer to them later simply by their name
(here: `myBackend`).

Think of `myBackend` as if it was a remotely available
instance of the class you specified in the `className` property.

Depending on your backend architecture _react-vrpc_ allows you to:

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

## Wrap components and provide credentials

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
> you can connect anonymously and skip username and password.

## Give a component access to backend functionality

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

| Property  | Type            | Description                                                    |
| --------- | --------------- | -------------------------------------------------------------- |
| `backend` | _proxy object_  | reflects the actual backend instance (is `null` while loading) |
| `error`   | _error object_  | any network or client issues                                   |
| `refresh` | _function_      | triggers a re-render of all components using specified backend |

## Access an individual instance belonging to a managing backend

If you defined a backend in the way as shown [here](#managingBackend) it allows
you to `create`, `get`, and `delete` instances using the functions:

```javascript
backend.create(id, { args, className })
```

- `id` \<string>: id of the managed instance
- `args` \<array>: constructor arguments (optional)
- `className` \<string>: name of the class (optional)

```javascript
backend.get(id)
```

- `id` \<string>: id of the managed instance

```javascript
backend.delete(id)
```

- `id` \<string>: id of the managed instance

Often you will want access a specific managed instance in a component. This
can be accomplished by using the hook function:

```javascript
useBackend('myManagingBackend', id)
```

## Access the VRPC client in your component

When calling static or global functions, or when interested in availabilities
of agents, classes, etc. it can be useful to directly access the VRPC client.

You can do so using the hook `useClient` which provides the properties:

| Property | Type            | Description                                           |
| -------- | --------------- | ----------------------------------------------------- |
| `client` | _client object_ | instance of the VRPC client (is `null` while loading) |
| `error`  | _error object_ | any network or client issues                          |

## Good to know

In case the backend you are using is an event emitter, you can subscribe and
unsubscribe to those events in your proxy object just as usual. VRPC will handle
everything for you.

Event subscriptions are the recommended way to realize front-end notifications
whenever something on the backend changes.
