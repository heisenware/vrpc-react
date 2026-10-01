export type VrpcErrorCode =
  | 'CONNECTION_FAILED' // initial connect() rejected (timeout / auth refusal)
  | 'CLIENT_OFFLINE' // MQTT connection lost; also used by manager methods while disconnected
  | 'NETWORK_ERROR' // the underlying MQTT client reported an error
  | 'CREDENTIALS_REFUSED' // the broker refused the credentials (CONNACK 4/5/134/135)
  | 'AGENT_OFFLINE' // a required agent went offline
  | 'INSTANCE_GONE' // a passive backend's instance disappeared
  | 'INSTANCE_CREATION_FAILED' // active/anonymous create() failed
  | 'INSTANCE_ATTACH_FAILED' // passive getInstance() failed
  | 'INSTANCE_NOT_FOUND' // useBackend(name, id): id not among the manager's ids
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

// CONNACK reason codes of a refused credential: MQTT 3.1.1 says 4 (bad
// user name or password) or 5 (not authorized), MQTT 5 says 134 or 135
const REFUSED_CODES = new Set([4, 5, 134, 135])
const REFUSED_MESSAGE =
  /Connection refused: (Not authorized|Bad User ?Name or Password)/i

/**
 * Whether an mqtt error (or anything in its cause chain) is the broker
 * refusing the credentials: by reason code, or by message for an mqtt
 * build without reason codes.
 */
export function isRefusedCredential (error: unknown): boolean {
  let e: any = error
  for (let depth = 0; e && depth < 5; depth++, e = e.cause) {
    if (typeof e.code === 'number' && REFUSED_CODES.has(e.code)) return true
    if (typeof e.message === 'string' && REFUSED_MESSAGE.test(e.message)) {
      return true
    }
  }
  return false
}
