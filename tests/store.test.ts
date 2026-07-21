import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVrpcStore, type ResolvedConfig } from '../src/store'
import { VrpcError } from '../src/errors'
import { MockVrpcClient, deferred, flush, makeProxy } from './mock-vrpc'

function makeConfig (
  backends: ResolvedConfig['backends'],
  overrides: Partial<ResolvedConfig> = {}
): ResolvedConfig {
  return {
    domain: 'test',
    broker: 'wss://broker.test/mqtt',
    backends,
    bestEffort: true,
    requiresSchema: false,
    keepalive: 30,
    debug: false,
    ...overrides
  }
}

const BACKENDS: ResolvedConfig['backends'] = {
  active: { agent: 'a1', className: 'Active', instance: 'active-1', args: [1] },
  passive: { agent: 'a1', className: 'Passive', instance: 'passive-1' },
  manager: { agent: 'a2', className: 'Thing' }
}

describe('createVrpcStore', () => {
  let onError: ReturnType<typeof vi.fn<(error: VrpcError) => void>>
  let client: MockVrpcClient

  beforeEach(() => {
    MockVrpcClient.reset()
    onError = vi.fn<(error: VrpcError) => void>()
    client = new MockVrpcClient({})
  })

  const attach = (backends = BACKENDS, overrides = {}) => {
    const store = createVrpcStore(makeConfig(backends, overrides), onError)
    const detach = store.attach(client as any)
    return { store, detach }
  }

  it('seeds entries as connecting; manager backend is non-null and stable', () => {
    const { store } = attach()
    expect(store.getClient().status).toBe('connecting')
    expect(store.getBackend('active')).toMatchObject({
      backend: null,
      error: null,
      status: 'connecting'
    })
    const manager = store.getBackend('manager').backend
    expect(manager).not.toBeNull()
    expect(store.getBackend('manager').ids).toEqual([])
    client.connack()
    expect(store.getBackend('manager').backend).toBe(manager)
  })

  it('throws UNKNOWN_BACKEND for unconfigured keys', () => {
    const { store } = attach()
    expect(() => store.getBackend('nope')).toThrowError(VrpcError)
    try {
      store.getBackend('nope')
    } catch (error) {
      expect((error as VrpcError).code).toBe('UNKNOWN_BACKEND')
    }
  })

  it('reflects CONNACK on the client entry', () => {
    const { store } = attach()
    client.connack()
    expect(store.getClient().status).toBe('connected')
    expect(store.getClient().client).toBe(client)
  })

  it('creates active instances when their agent comes online', async () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    await flush()
    expect(client.create).toHaveBeenCalledWith({
      agent: 'a1',
      className: 'Active',
      instance: 'active-1',
      args: [1],
      cacheProxy: true
    })
    const entry = store.getBackend('active')
    expect(entry.status).toBe('ready')
    expect(entry.backend.vrpcInstanceId).toBe('active-1')
  })

  it('reports INSTANCE_CREATION_FAILED when create rejects', async () => {
    client.create.mockRejectedValueOnce(new Error('boom'))
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    await flush()
    const entry = store.getBackend('active')
    expect(entry.status).toBe('error')
    expect(entry.error?.code).toBe('INSTANCE_CREATION_FAILED')
    expect(entry.error?.message).toContain('boom')
    expect(onError).toHaveBeenCalledWith(entry.error)
  })

  it('attaches passive backends only when THEIR instance appears', async () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    await flush()
    client.getInstance.mockClear()

    client.instanceNew(['other-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(client.getInstance).not.toHaveBeenCalled()
    expect(store.getBackend('passive').status).toBe('connecting')

    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(client.getInstance).toHaveBeenCalledWith('passive-1', {
      className: 'Passive',
      agent: 'a1'
    })
    expect(store.getBackend('passive').status).toBe('ready')
  })

  it('handles instanceGone and recovers on re-appearance', async () => {
    const { store } = attach()
    client.connack()
    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(store.getBackend('passive').status).toBe('ready')

    client.instanceGone(['passive-1'], { className: 'Passive', agent: 'a1' })
    const entry = store.getBackend('passive')
    expect(entry.status).toBe('offline')
    expect(entry.error?.code).toBe('INSTANCE_GONE')
    expect(entry.backend).toBeNull()
    expect(onError).toHaveBeenCalledWith(entry.error)

    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(store.getBackend('passive').status).toBe('ready')
    expect(store.getBackend('passive').error).toBeNull()
  })

  it('agent offline empties manager ids with a NEW frozen array', () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a2')
    client.instanceNew(['t1', 't2'], { className: 'Thing', agent: 'a2' })
    const before = store.getBackend('manager').ids!
    expect(before).toEqual(['t1', 't2'])
    expect(Object.isFrozen(before)).toBe(true)

    client.agentOffline('a2')
    const entry = store.getBackend('manager')
    expect(entry.status).toBe('offline')
    expect(entry.error?.code).toBe('AGENT_OFFLINE')
    expect(entry.ids).toEqual([])
    expect(entry.ids).not.toBe(before)
    expect(before).toEqual(['t1', 't2']) // old snapshot untouched
  })

  it('filters manager ids on instanceGone', () => {
    const { store } = attach()
    client.connack()
    client.instanceNew(['t1', 't2', 't3'], { className: 'Thing', agent: 'a2' })
    client.instanceGone(['t2'], { className: 'Thing', agent: 'a2' })
    expect(store.getBackend('manager').ids).toEqual(['t1', 't3'])
  })

  it('broker offline degrades everything and recovery is event-driven', async () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    client.instanceNew(['t1'], { className: 'Thing', agent: 'a2' })
    await flush()
    expect(store.getBackend('active').status).toBe('ready')

    client.goOffline()
    expect(store.getClient().status).toBe('offline')
    for (const key of ['active', 'passive', 'manager']) {
      const entry = store.getBackend(key)
      expect(entry.status).toBe('offline')
      expect(entry.error?.code).toBe('CLIENT_OFFLINE')
    }
    expect(store.getBackend('active').backend).toBeNull()
    expect(store.getBackend('manager').ids).toEqual([])

    // reconnect: retained events replay, same pipeline as startup
    client.connack()
    expect(store.getClient().status).toBe('connected')
    expect(store.getBackend('active').status).toBe('connecting')
    client.agentOnline('a1')
    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    client.instanceNew(['t1'], { className: 'Thing', agent: 'a2' })
    await flush()
    expect(store.getBackend('active').status).toBe('ready')
    expect(store.getBackend('passive').status).toBe('ready')
    expect(store.getBackend('manager').ids).toEqual(['t1'])
  })

  it('discards in-flight resolutions from a previous epoch', async () => {
    const gate = deferred<any>()
    client.create.mockImplementationOnce(() => gate.promise)
    const { store } = attach()
    client.connack()
    client.agentOnline('a1') // create hangs on the gate
    client.goOffline() // epoch moves
    gate.resolve(makeProxy('late'))
    await flush()
    const entry = store.getBackend('active')
    expect(entry.status).toBe('offline') // stale proxy discarded
    expect(entry.backend).toBeNull()
  })

  it('manager methods reject with CLIENT_OFFLINE while disconnected', async () => {
    const { store } = attach()
    const manager = store.getBackend('manager').backend
    await expect(manager.create('x')).rejects.toMatchObject({
      code: 'CLIENT_OFFLINE'
    })
    client.connack()
    await expect(manager.create('x')).resolves.toMatchObject({
      vrpcInstanceId: 'x'
    })
  })

  it('manager callStatic supports both calling conventions', async () => {
    const { store } = attach()
    client.connack()
    const manager = store.getBackend('manager').backend
    await manager.callStatic('doIt', 1, 2)
    expect(client.callStatic).toHaveBeenCalledWith({
      functionName: 'doIt',
      args: [1, 2],
      className: 'Thing',
      agent: 'a2'
    })
    await manager.callStatic({ functionName: 'other', className: 'X', agent: 'a9' })
    expect(client.callStatic).toHaveBeenCalledWith({
      functionName: 'other',
      className: 'X',
      agent: 'a9'
    })
  })

  it('wraps mqtt errors as NETWORK_ERROR on the client entry', () => {
    const { store } = attach()
    client.connack()
    client.networkError(new Error('socket closed'))
    const entry = store.getClient()
    expect(entry.status).toBe('connected') // status untouched; 'offline' owns disconnects
    expect(entry.error?.code).toBe('NETWORK_ERROR')
    expect(onError).toHaveBeenCalledWith(entry.error)
  })

  it('connectFailed marks client and all backends as error', () => {
    const { store } = attach()
    const error = new VrpcError('CONNECTION_FAILED', 'nope')
    store.connectFailed(error)
    expect(store.getClient().status).toBe('error')
    expect(store.getBackend('active').status).toBe('error')
    expect(store.getBackend('active').error).toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('reseeds manager ids from the client cache after an agent bounce', () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a2')
    client.instanceNew(['t1', 't2'], { className: 'Thing', agent: 'a2' })
    expect(store.getBackend('manager').ids).toEqual(['t1', 't2'])

    client.agentOffline('a2')
    expect(store.getBackend('manager').ids).toEqual([])

    // vrpc does NOT re-emit instanceNew after an agent bounce; the
    // client cache is the only source of truth
    client.getAvailableInstances.mockReturnValue(['t1', 't2'])
    client.agentOnline('a2')
    const entry = store.getBackend('manager')
    expect(entry.status).toBe('ready')
    expect(entry.ids).toEqual(['t1', 't2'])
    expect(entry.error).toBeNull()
  })

  it('reattaches passive backends from the client cache after an agent bounce', async () => {
    const { store } = attach()
    client.connack()
    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(store.getBackend('passive').status).toBe('ready')

    client.agentOffline('a1')
    expect(store.getBackend('passive').status).toBe('offline')

    client.getInstance.mockClear()
    client.getAvailableInstances.mockReturnValue(['passive-1'])
    client.agentOnline('a1')
    await flush()
    expect(client.getInstance).toHaveBeenCalledWith('passive-1', {
      className: 'Passive',
      agent: 'a1'
    })
    expect(store.getBackend('passive').status).toBe('ready')
  })

  it('ignores a repeated agent-online for ready backends', async () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    client.instanceNew(['passive-1'], { className: 'Passive', agent: 'a1' })
    await flush()
    expect(store.getBackend('passive').status).toBe('ready')
    const proxy = store.getBackend('passive').backend
    client.getInstance.mockClear()
    client.create.mockClear()

    // agents republish retained agentInfo on every broker reconnect
    client.agentOnline('a1')
    await flush()
    expect(store.getBackend('passive').status).toBe('ready')
    expect(store.getBackend('passive').backend).toBe(proxy)
    expect(client.getInstance).not.toHaveBeenCalled()
    expect(client.create).not.toHaveBeenCalled()
  })

  it('re-creates active instances when their instance disappears', async () => {
    const { store } = attach()
    client.connack()
    client.agentOnline('a1')
    await flush()
    expect(store.getBackend('active').status).toBe('ready')
    client.create.mockClear()

    client.instanceGone(['active-1'], { className: 'Active', agent: 'a1' })
    await flush()
    expect(client.create).toHaveBeenCalledTimes(1)
    const entry = store.getBackend('active')
    expect(entry.status).toBe('ready')
    expect(entry.error).toBeNull()
    // active backends self-heal: INSTANCE_GONE is not reported as error
    expect(onError).not.toHaveBeenCalled()
  })

  it('late create resolutions do not overwrite AGENT_OFFLINE', async () => {
    const gate = deferred<any>()
    client.create.mockImplementationOnce(() => gate.promise)
    const { store } = attach()
    client.connack()
    client.agentOnline('a1') // create hangs on the gate
    client.agentOffline('a1') // per-key generation moves
    gate.resolve(makeProxy('late'))
    await flush()
    const entry = store.getBackend('active')
    expect(entry.status).toBe('offline')
    expect(entry.error?.code).toBe('AGENT_OFFLINE')
    expect(entry.backend).toBeNull()
  })

  it('manager get and delete scope calls to their class', async () => {
    const { store } = attach()
    client.connack()
    const manager = store.getBackend('manager').backend
    await manager.get('t1')
    expect(client.getInstance).toHaveBeenCalledWith('t1', {
      className: 'Thing',
      agent: 'a2',
      noWait: true
    })
    await manager.delete('t1')
    expect(client.delete).toHaveBeenCalledWith('t1', {
      className: 'Thing',
      agent: 'a2'
    })
  })

  it('object-form callStatic inherits the backend defaults', async () => {
    const { store } = attach()
    client.connack()
    const manager = store.getBackend('manager').backend
    await manager.callStatic({ functionName: 'doIt' })
    expect(client.callStatic).toHaveBeenCalledWith({
      functionName: 'doIt',
      className: 'Thing',
      agent: 'a2'
    })
  })

  it('detach removes all listeners and stops reacting', () => {
    const { store, detach } = attach()
    client.connack()
    detach()
    expect(client.listenerCount('agent')).toBe(0)
    expect(client.listenerCount('connect')).toBe(0)
    client.agentOnline('a1')
    expect(client.create).not.toHaveBeenCalled()
    expect(store.getBackend('active').status).toBe('connecting')
  })
})
