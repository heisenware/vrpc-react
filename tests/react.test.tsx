import React, { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MockVrpcClient, flush } from './mock-vrpc'
import { createVrpc, VrpcError } from '../src/index'

vi.mock('vrpc', async () => {
  const { MockVrpcClient } = await import('./mock-vrpc')
  return { default: { VrpcClient: MockVrpcClient } }
})

const makeFactory = () =>
  createVrpc({
    domain: 'test',
    broker: 'wss://broker.test/mqtt',
    backends: {
      todos: { agent: 'a1', className: 'TodoList', instance: 'todos-1', args: [] },
      things: { agent: 'a2', className: 'Thing' }
    }
  })

class Boundary extends React.Component<
  { children: React.ReactNode, onCatch: (error: Error) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError () {
    return { failed: true }
  }

  componentDidCatch (error: Error) {
    this.props.onCatch(error)
  }

  render () {
    return this.state.failed ? <div>boundary</div> : this.props.children
  }
}

beforeEach(() => {
  MockVrpcClient.reset()
})

describe('VrpcProvider & hooks', () => {
  it('renders children immediately and reports statuses reactively', async () => {
    const { VrpcProvider, useBackend, useClient } = makeFactory()

    function Probe () {
      const { status: clientStatus } = useClient()
      const { backend, status } = useBackend('todos')
      return (
        <div>
          <span data-testid='client'>{clientStatus}</span>
          <span data-testid='todos'>{status}</span>
          <span data-testid='proxy'>{backend ? 'proxy' : 'none'}</span>
        </div>
      )
    }

    render(
      <VrpcProvider>
        <Probe />
      </VrpcProvider>
    )

    // children are visible before any connection exists
    expect(screen.getByTestId('client').textContent).toBe('connecting')
    expect(screen.getByTestId('todos').textContent).toBe('connecting')

    const client = MockVrpcClient.last
    await act(async () => client.connack())
    expect(screen.getByTestId('client').textContent).toBe('connected')

    await act(async () => {
      client.agentOnline('a1')
      await flush()
    })
    expect(screen.getByTestId('todos').textContent).toBe('ready')
    expect(screen.getByTestId('proxy').textContent).toBe('proxy')

    await act(async () => client.agentOffline('a1'))
    expect(screen.getByTestId('todos').textContent).toBe('offline')
    expect(screen.getByTestId('proxy').textContent).toBe('none')
  })

  it('does NOT reconnect when an inline onError changes identity', async () => {
    const { VrpcProvider, useBackend } = makeFactory()

    function Probe () {
      const { status } = useBackend('todos')
      return <span>{status}</span>
    }

    function Root ({ tick }: { tick: number }) {
      return (
        <VrpcProvider onError={() => console.log('tick', tick)}>
          <Probe />
        </VrpcProvider>
      )
    }

    const view = render(<Root tick={0} />)
    await act(async () => MockVrpcClient.last.connack())

    for (let i = 1; i <= 10; i++) {
      view.rerender(<Root tick={i} />)
    }
    await flush()

    expect(MockVrpcClient.instances).toHaveLength(1)
    expect(MockVrpcClient.last.end).not.toHaveBeenCalled()
  })

  it('survives StrictMode double-mounting', async () => {
    const { VrpcProvider, useBackend } = makeFactory()

    function Probe () {
      const { status } = useBackend('todos')
      return <span data-testid='status'>{status}</span>
    }

    render(
      <StrictMode>
        <VrpcProvider>
          <Probe />
        </VrpcProvider>
      </StrictMode>
    )

    // StrictMode: mount -> cleanup -> mount = two clients
    expect(MockVrpcClient.instances).toHaveLength(2)
    const [first, second] = MockVrpcClient.instances

    // the surviving client drives the app
    await act(async () => {
      second.connack()
      second.agentOnline('a1')
      await flush()
    })
    expect(screen.getByTestId('status').textContent).toBe('ready')

    // the abandoned client is ended once its connect settles, and its
    // late events do not disturb the app
    await act(async () => {
      first.connack()
      await flush()
    })
    expect(first.end).toHaveBeenCalledTimes(1)
    expect(second.end).not.toHaveBeenCalled()
    await act(async () => first.agentOffline('a1'))
    expect(screen.getByTestId('status').textContent).toBe('ready')
  })

  it('resolves managed instances by id and reports INSTANCE_NOT_FOUND', async () => {
    const { VrpcProvider, useBackend } = makeFactory()

    function Probe ({ id }: { id: string }) {
      const { backend, error, status } = useBackend('things', id)
      return (
        <div>
          <span data-testid='status'>{status}</span>
          <span data-testid='code'>{error?.code ?? 'none'}</span>
          <span data-testid='proxy'>
            {backend ? String((backend as any).vrpcInstanceId) : 'none'}
          </span>
        </div>
      )
    }

    const view = render(
      <VrpcProvider>
        <Probe id='t1' />
      </VrpcProvider>
    )

    const client = MockVrpcClient.last
    await act(async () => {
      client.connack()
      client.agentOnline('a2')
      client.instanceNew(['t1'], { className: 'Thing', agent: 'a2' })
      await flush()
    })
    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.getByTestId('proxy').textContent).toBe('t1')

    view.rerender(
      <VrpcProvider>
        <Probe id='t2' />
      </VrpcProvider>
    )
    await flush()
    expect(screen.getByTestId('status').textContent).toBe('error')
    expect(screen.getByTestId('code').textContent).toBe('INSTANCE_NOT_FOUND')

    // appears later -> auto-resolves
    await act(async () => {
      client.instanceNew(['t2'], { className: 'Thing', agent: 'a2' })
      await flush()
    })
    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.getByTestId('proxy').textContent).toBe('t2')
  })

  it('isolates two factories sharing a backend key', async () => {
    const factoryA = makeFactory()
    const factoryB = makeFactory()

    function ProbeA () {
      const { status } = factoryA.useBackend('todos')
      return <span data-testid='a'>{status}</span>
    }
    function ProbeB () {
      const { status } = factoryB.useBackend('todos')
      return <span data-testid='b'>{status}</span>
    }

    render(
      <factoryA.VrpcProvider>
        <factoryB.VrpcProvider>
          <ProbeA />
          <ProbeB />
        </factoryB.VrpcProvider>
      </factoryA.VrpcProvider>
    )

    expect(MockVrpcClient.instances).toHaveLength(2)
    // React runs child effects first: the INNER provider (factoryB)
    // constructs its client before the outer one (factoryA)
    const [clientB, clientA] = MockVrpcClient.instances

    await act(async () => {
      clientA.connack()
      clientA.agentOnline('a1')
      await flush()
    })
    expect(screen.getByTestId('a').textContent).toBe('ready')
    expect(screen.getByTestId('b').textContent).toBe('connecting')

    await act(async () => {
      clientB.connack()
      clientB.agentOnline('a1')
      await flush()
    })
    expect(screen.getByTestId('b').textContent).toBe('ready')
    expect(clientA.create).toHaveBeenCalledTimes(1)
    expect(clientB.create).toHaveBeenCalledTimes(1)
  })

  it('throws UNKNOWN_BACKEND and MISSING_PROVIDER for programmer errors', () => {
    const { VrpcProvider, useBackend } = makeFactory()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      let caught: Error | null = null
      function Bad () {
        // @ts-expect-error - unknown key must be rejected by types too
        useBackend('nope')
        return null
      }
      render(
        <Boundary onCatch={error => { caught = error }}>
          <VrpcProvider>
            <Bad />
          </VrpcProvider>
        </Boundary>
      )
      expect(caught).toBeInstanceOf(VrpcError)
      expect((caught as unknown as VrpcError).code).toBe('UNKNOWN_BACKEND')

      let caughtOutside: Error | null = null
      function Orphan () {
        useBackend('todos')
        return null
      }
      render(
        <Boundary onCatch={error => { caughtOutside = error }}>
          <Orphan />
        </Boundary>
      )
      expect(caughtOutside).toBeInstanceOf(VrpcError)
      expect((caughtOutside as unknown as VrpcError).code).toBe('MISSING_PROVIDER')
    } finally {
      spy.mockRestore()
    }
  })

  it('re-renders only consumers of the changed backend', async () => {
    const { VrpcProvider, useBackend } = makeFactory()
    let todosRenders = 0
    let thingsRenders = 0

    function Todos () {
      todosRenders++
      const { status } = useBackend('todos')
      return <span>{status}</span>
    }
    function Things () {
      thingsRenders++
      const { ids } = useBackend('things')
      return <span>{ids.length}</span>
    }

    render(
      <VrpcProvider>
        <Todos />
        <Things />
      </VrpcProvider>
    )
    const client = MockVrpcClient.last
    await act(async () => client.connack())

    const todosBefore = todosRenders
    const thingsBefore = thingsRenders
    await act(async () => {
      client.instanceNew(['t1'], { className: 'Thing', agent: 'a2' })
      await flush()
    })
    expect(thingsRenders).toBeGreaterThan(thingsBefore)
    expect(todosRenders).toBe(todosBefore)
  })

  it('replaces the client on token change', async () => {
    const { VrpcProvider, useClient } = makeFactory()

    function Probe () {
      const { status } = useClient()
      return <span data-testid='status'>{status}</span>
    }

    const view = render(
      <VrpcProvider token='token-1'>
        <Probe />
      </VrpcProvider>
    )
    await act(async () => MockVrpcClient.last.connack())
    expect(MockVrpcClient.instances).toHaveLength(1)
    const first = MockVrpcClient.last
    expect(first.options.token).toBe('token-1')

    view.rerender(
      <VrpcProvider token='token-2'>
        <Probe />
      </VrpcProvider>
    )
    await flush()
    expect(MockVrpcClient.instances).toHaveLength(2)
    expect(first.end).toHaveBeenCalledTimes(1)
    const second = MockVrpcClient.last
    expect(second.options.token).toBe('token-2')
    expect(screen.getByTestId('status').textContent).toBe('connecting')
    await act(async () => second.connack())
    expect(screen.getByTestId('status').textContent).toBe('connected')
  })

  it('reports CONNECTION_FAILED when the initial connect rejects', async () => {
    const { VrpcProvider, useBackend } = makeFactory()
    const onError = vi.fn()

    function Probe () {
      const { error, status } = useBackend('todos')
      return (
        <div>
          <span data-testid='status'>{status}</span>
          <span data-testid='code'>{error?.code ?? 'none'}</span>
        </div>
      )
    }

    render(
      <VrpcProvider onError={onError}>
        <Probe />
      </VrpcProvider>
    )
    await act(async () => {
      MockVrpcClient.last.failConnect(new Error('Connection trial timed out'))
      await flush()
    })
    expect(screen.getByTestId('status').textContent).toBe('error')
    expect(screen.getByTestId('code').textContent).toBe('CONNECTION_FAILED')
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0].message).toContain('Connection trial timed out')
  })
})
