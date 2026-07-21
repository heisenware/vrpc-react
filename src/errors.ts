export type VrpcErrorCode =
  | 'CONNECTION_FAILED' // initial connect() rejected (timeout / auth refusal)
  | 'CLIENT_OFFLINE' // MQTT connection lost; also used by manager methods while disconnected
  | 'NETWORK_ERROR' // the underlying MQTT client reported an error
  | 'AGENT_OFFLINE' // a required agent went offline
  | 'INSTANCE_GONE' // a passive backend's instance disappeared
  | 'INSTANCE_CREATION_FAILED' // active/anonymous create() failed
  | 'INSTANCE_ATTACH_FAILED' // passive getInstance() failed
  | 'INSTANCE_NOT_FOUND' // useBackend(name, id): id not among the manager's ids
  | 'HEALTH_CHECK_FAILED' // a healthCheck poll rejected
  | 'UNKNOWN_BACKEND' // backend key not present in the factory config
  | 'MISSING_PROVIDER' // hook used outside its factory's provider

export interface VrpcErrorOptions {
  cause?: unknown
  backendKey?: string
  agent?: string
}

export class VrpcError extends Error {
  readonly code: VrpcErrorCode
  readonly backendKey?: string
  readonly agent?: string

  constructor (code: VrpcErrorCode, message: string, options: VrpcErrorOptions = {}) {
    const causeMessage =
      options.cause instanceof Error ? options.cause.message : undefined
    super(
      causeMessage ? `${message}, because: ${causeMessage}` : message,
      options.cause !== undefined ? { cause: options.cause } : undefined
    )
    this.name = 'VrpcError'
    this.code = code
    this.backendKey = options.backendKey
    this.agent = options.agent
  }
}
