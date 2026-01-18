
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Add setupFiles if needed, but for now aliases are key
  },
});
