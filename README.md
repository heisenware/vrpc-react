# react-vrpc

React wrapper around the [vrpc](https://github.com/bheisen/vrpc) library

## Step 1 - Create VrpcProvider

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
instance of the class you chose in the `className` property.

Depending on your backend architecture *react-vrpc* allows you to:

1. Create an (anonymous) instance of a class

    > define parameters: `agent`, `className`, `args`

2. Create (if not exists) and use a named instance of class

    > define parameters: `agent`, `className`, `instance`, `args`

3. Use (never create) an existing named instance of a class

    > define parameters: `agent`, `className`, `instance`

4. Use all named instances of a class

    > define parameters: `agent`, `className`

    In this case your backend object reflects an array of proxy instances, and
    you can access their id using `<proxy>._id` member variable.

    You may also combine instances of different classes by using
    a regular expression in the `className` property. The class name of each
    instances is accessible via the `<proxy>._className` member variable.

> **TIP**
>
> If your backend instance is capable to emit events you can automatically
> subscribe to those by configuring an additional `events` property:
>
> ```javascript
> const VrpcProvider = createVrpcProvider({
>   backends: {
>     myInstances: {
>       agent: '<agentName>',
>       className: '<className>',
>       events: ['<eventName1>', '<eventName2>', ...]
>     }
>   },
> })
> ```
>
> Corresponding notifications will result in a component update (see below) and
> the event payload is accessible via the `<proxy>.<eventName>` property.
>

## Step 2 - Use the VrpcProvider

At a top-level position of your component hierarchy add the `<VrpcProvider>`

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

## Step 3 - Give a component access to backend functions

```javascript
import React from 'react'
import { withVrpc } from 'react-vrpc'

class MyComponent extends React.Component {

  async componentDidMount () {
    const { myBackend, vrpc } = this.props
    const ret = await myBackend.aBackendFunction('test')
  }
}

export default withVrpc(MyComponent)
```

> **NOTE**
>
> You can restrict the backends available on your component (and hence the
> amount of re-renders when they change) by specifying and individual one:
>
> ```javascript
> export default withVrpc(myBackend, MyComponent)
> ```
>
> or any subset of backends using and array notation:
>
> ```javascript
> export default withVrpc([myBackend1, myBackend3], MyComponent)
> ```

No matter what you do, the property `vrpc` reflecting the remote client
is always available (and e.g. needed for static calls).

## Step 4 - Update component upon backend changes

This step is optional and typically only needed if you configured your
backend to reflect an array of instances (see point 4 of potential usages).

There are two reasons why such an update may be triggered:

1. The number of instances changed (reduced or increased)
2. An event was emitted by one of the instances and the corresponding
    value of the `<proxy>.<eventName>` member changed.

For both cases you can use the `componentDidUpdate(prevProps)` life-cycle
method of react:

```javascript
async componentDidUpdate(prevProps) {
  // myInstances reflects a backend with multiple instances
  const { myInstances } = this.props
  const prevInstances = prevProps.myInstances
  if (prevInstances.length !== myInstances.length) {
    // update needed, i.e. call setState in this component
  } else {
    // let 'state' be a subscribed event
    const changed = prevInstances.filter(({ state }, index) => (
      state !== myInstances[index].state
    ))
    if (changed.length > 0) {
      // updated needed, at least on state change detected
    }
  }
}
```
