import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react'; // If we have it, otherwise might need to skip

// We might not have @vitejs/plugin-react installed.
// Given the dependencies in package.json (vitest, but no @vitejs/plugin-react),
// we should probably avoid using plugins if we can, or just path resolution.

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true, // We used describe, it, etc without import in some projects, but here we imported them.
                   // But expect might need globals if we used it without import (we imported it).
    environment: 'node', // Using node environment as we are testing API routes.
  },
});
