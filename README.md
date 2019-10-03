# react-vrpc
React wrapper around the [vrpc](https://github.com/bheisen/vrpc) library


## Usage

In the *index.js* of your react app add something like:

```javascript
import { createVrpcProvider } from 'react-vrpc'

const VrpcProvider = createVrpcProvider({
  domain: '<domain>',
  broker: 'wss://vrpc.io/mqtt',
  token: '<proxyToken>',
  backends: {
    myBackend: {
      agent: '<agentName>',
      className: '<className>',
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

**TIP 1**

For the token you can use an environmental variable to not expose it into
your repository, i.e.:

```
token: process.env.REACT_APP_PROXY_TOKEN
```

If you are using your own broker you can use `username` and
`password` instead of `token`.

---

**TIP 2**

For testing you can type:

```javascript
const VrpcProvider = createVrpcProvider({
  domain: 'public.vrpc',
  broker: 'wss://vrpc.io/mqtt',
  backends: {
    myBackend: {
      agent: '<agentName>',
      className: '<className>',
      args: ['<constructorArgs>']
    }
  },
})
```

i.e. use VRPC's free `public.vrpc` domain which works without
authentication.

---

In the components you need to access the backend use:

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
**NOTE 1**

Optionally, you can use the `vrpc` object which reflects the remote proxy
instance.

---
**NOTE 2**

Always use `await` as all VRPC calls need to travel the network and are
asynchronous by default. If the backend function you are calling is
`async` itself, simply add a second `await`, like so:

```javascript
const ret = await await myBackend.anAsyncBackendFunction('test')
```

You can use simple `try/catch` statements, VRPC forwards potential exceptions
on the backend for you.

---

For all details, please visit: https://vrpc.io, or
https://github.com/bheisen/vrpc
