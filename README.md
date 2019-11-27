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
      args: ['<constructorArgs>']
    }
  },
})
```

You can use any number of backends with VRPC by adding several objects under
the `backends` property. Refer to them later simply by their name
(here: `myBackend`).

Think of `myBackend` as if it was a remotely available
instance of the class you chose in the `className` property.

---

> **TIP**
>
> For testing you can simply type:
>
> ```javascript
> const VrpcProvider = createVrpcProvider({
>   backends: {
>     myBackend: {
>       agent: '<agentName>',
>       className: '<className>',
>       args: ['<constructorArgs>']
>     }
>   },
> })
> ```
> this will use the broker hosted by https://vrpc.io and the `public.vrpc` domain
> which works without authentication.


---

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

class YourComponent extends React.Component {

  async componentDidMount () {
    const { myBackend, vrpc } = this.props
    const ret = await myBackend.aBackendFunction('test')
  }
}

export default withVrpc(YourComponent)
```

---
> **NOTE 1**
>
> Optionally, you can use the `vrpc` object which reflects the remote proxy
> instance.

> **NOTE 2**
>
> Always use `await` as all VRPC calls need to travel the network and are
> asynchronous by default. If the backend function you are calling is
> `async` itself, simply add a second `await`, like so:
>
> `const ret = await await myBackend.anAsyncBackendFunction('test')`
>
> You can use simple `try/catch` statements, VRPC forwards potential exceptions
> on the backend for you.

---

For all details, please visit: https://vrpc.io, or
https://github.com/bheisen/vrpc
