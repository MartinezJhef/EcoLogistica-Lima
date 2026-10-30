
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],

    coverage: {
      provider: 'v8',

      reporter: [
        'text',
        'lcov',
        'json',
        'html'
      ],

      reportsDirectory: './coverage',

      include: [
        'src/**/*.{ts,tsx}'
      ],

      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**'
      ]
    }
  }
});
