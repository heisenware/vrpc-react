import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // vrpc-react is consumed via a file:../.. symlink, so imports from
    // inside it would otherwise resolve against the library's OWN
    // node_modules - yielding a second React copy and the infamous
    // "Cannot read properties of null (reading 'useSyncExternalStore')".
    // Deduping pins everything to this app's copies.
    dedupe: ['react', 'react-dom']
  }
})
