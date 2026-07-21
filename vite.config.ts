import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VrpcReact',
      formats: ['es', 'cjs'],
      // .mjs/.cjs so Node treats each file's module format correctly
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'vrpc',
        'use-sync-external-store',
        'use-sync-external-store/shim',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          vrpc: 'Vrpc',
        },
      },
    },
  },
})
