// example/frontend/src/ConnectionBadge.tsx
import { useClient } from './vrpc'

const COLORS: Record<string, string> = {
  connecting: '#f0ad4e',
  connected: '#5cb85c',
  offline: '#d9534f',
  error: '#d9534f'
}

/**
 * Small always-visible indicator of the MQTT connection state.
 * Demonstrates the reactive useClient() hook: the app shell renders
 * immediately and this badge updates as the connection evolves.
 */
export default function ConnectionBadge () {
  const { status } = useClient()
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontFamily: 'sans-serif',
        color: 'white',
        background: COLORS[status]
      }}
    >
      {status}
    </div>
  )
}
