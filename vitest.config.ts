import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.spec.ts',
      'src/services/__tests__/auth.service.test.ts',
    ],
  },
})
