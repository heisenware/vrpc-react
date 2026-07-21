import { describe, expect, expectTypeOf, it } from 'vitest'
import { createVrpc } from '../src/index'
import type {
  Proxied,
  UseBackendResult,
  UseManagerResult,
  VrpcClient,
  VrpcError,
  VrpcManager,
  VrpcProxy
} from '../src/index'

interface TodoApi {
  addTodo: (text: string) => { id: number, text: string }
  getTodos: () => Array<{ id: number, text: string }>
  count: number // non-function members are stripped by Proxied
}

// Compile-time assertions; the hook-shaped function is exported, never executed.
export function useTypeChecks () {
  const { useBackend, useClient } = createVrpc({
    domain: 'test',
    backends: {
      todos: { agent: 'a1', className: 'TodoList', instance: 't1', args: [] },
      passive: { agent: 'a1', className: 'TodoList', instance: 't2' },
      things: { agent: 'a2', className: 'Thing' }
    }
  })

  // instance backends resolve to UseBackendResult
  const todos = useBackend('todos')
  expectTypeOf(todos).toEqualTypeOf<UseBackendResult<Proxied<VrpcProxy>>>()
  const passive = useBackend<TodoApi>('passive')
  expectTypeOf(passive.backend).toEqualTypeOf<Proxied<TodoApi> | null>()

  // manager backends resolve to UseManagerResult with ids
  const things = useBackend('things')
  expectTypeOf(things).toEqualTypeOf<UseManagerResult<VrpcProxy>>()
  expectTypeOf(things.backend).toEqualTypeOf<VrpcManager<VrpcProxy>>()
  expectTypeOf(things.ids).toEqualTypeOf<readonly string[]>()

  // manager + id resolves to a single proxy result
  const thing = useBackend<TodoApi>('things', 't-42')
  expectTypeOf(thing.backend).toEqualTypeOf<Proxied<TodoApi> | null>()

  // unknown keys are compile errors
  // @ts-expect-error - 'nope' is not a configured backend
  useBackend('nope')

  // client hook shape
  const { client, status, error } = useClient()
  expectTypeOf(status).toEqualTypeOf<
    'connecting' | 'connected' | 'offline' | 'error'
  >()
  expectTypeOf(error).toEqualTypeOf<VrpcError | null>()
  expectTypeOf(client).toEqualTypeOf<VrpcClient | null>()
}

describe('type-level API', () => {
  it('maps class methods to promisified proxies', () => {
    type Mapped = Proxied<TodoApi>
    expectTypeOf<Mapped['addTodo']>().toEqualTypeOf<
      (text: string) => Promise<{ id: number, text: string }>
    >()
    expectTypeOf<Mapped['getTodos']>().toEqualTypeOf<
      () => Promise<Array<{ id: number, text: string }>>
    >()
    // @ts-expect-error - non-function members are not part of the proxy
    expectTypeOf<Mapped['count']>()
    expect(true).toBe(true)
  })
})
