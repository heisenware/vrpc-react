import { vi } from 'vitest'

type Listener = (...args: any[]) => void

/** Minimal EventEmitter (avoids a node typings dependency in tests) */
class MiniEmitter {
  private readonly listeners = new Map<string, Set<Listener>>()

  on (event: string, listener: Listener) {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener)
    return this
  }

  once (event: string, listener: Listener) {
    const wrapper: Listener = (...args) => {
      this.removeListener(event, wrapper)
      listener(...args)
    }
    return this.on(event, wrapper)
  }

  off (event: string, listener: Listener) {
    return this.removeListener(event, listener)
  }

  removeListener (event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  removeAllListeners () {
    this.listeners.clear()
    return this
  }

  listenerCount (event: string): number {
    return this.listeners.get(event)?.size ?? 0
  }

  emit (event: string, ...args: any[]): boolean {
    const set = this.listeners.get(event)
    if (!set || set.size === 0) return false
    for (const listener of [...set]) listener(...args)
    return true
  }
}

export interface Deferred<T = void> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

export function deferred<T = void> (): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  // avoid unhandled rejection noise when a test rejects an unawaited connect
  promise.catch(() => {})
  return { promise, resolve, reject }
}

export function makeProxy (id: string) {
  return {
    vrpcInstanceId: id,
    ping: vi.fn(async () => `pong from ${id}`)
  }
}

/**
 * Mimics the VrpcClient surface and event contract of vrpc 3.7.0
 * (event names and payload shapes verified against the real source).
 */
export class MockVrpcClient extends MiniEmitter {
  static instances: MockVrpcClient[] = []

  static reset () {
    MockVrpcClient.instances = []
  }

  static get last (): MockVrpcClient {
    const instance = MockVrpcClient.instances.at(-1)
    if (!instance) throw new Error('No MockVrpcClient constructed yet')
    return instance
  }

  options: any
  connectDeferred = deferred()
  connected = false

  connect = vi.fn(() => this.connectDeferred.promise)
  end = vi.fn(async () => {
    this.connected = false
    // the real end() also wipes all listeners
    this.removeAllListeners()
  })

  create = vi.fn(async (options: { instance?: string }) =>
    makeProxy(options.instance ?? '<anonymous>')
  )

  getInstance = vi.fn(async (id: string) => makeProxy(id))
  delete = vi.fn(async () => true)
  callStatic = vi.fn(async () => true)
  callAll = vi.fn(async () => [])

  constructor (options: any) {
    super()
    this.options = options
    MockVrpcClient.instances.push(this)
  }

  // ------ test drivers (mirror real emission shapes) ------

  connack () {
    this.connected = true
    this.connectDeferred.resolve()
    this.emit('connect')
  }

  failConnect (reason: Error) {
    this.connectDeferred.reject(reason)
  }

  goOffline () {
    this.connected = false
    this.emit('offline')
  }

  agentOnline (agent: string) {
    this.emit('agent', { domain: 'test', agent, status: 'online' })
  }

  agentOffline (agent: string) {
    this.emit('agent', { domain: 'test', agent, status: 'offline' })
  }

  instanceNew (added: string[], info: { className: string, agent: string }) {
    this.emit('instanceNew', added, { domain: 'test', ...info })
  }

  instanceGone (gone: string[], info: { className: string, agent: string }) {
    this.emit('instanceGone', gone, { domain: 'test', ...info })
  }

  networkError (error: Error) {
    this.emit('error', error)
  }
}

export const flush = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}
