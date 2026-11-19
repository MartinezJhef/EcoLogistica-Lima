
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Los módulos pesados se separan para que el paquete inicial solo traiga el login.
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, '/');
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(path)) return 'react';
          if (path.includes('/node_modules/leaflet/')) return 'mapas';
        }
      }
    }
  },

  server: {
    port: 5173,
    host: true
  },

  test: {
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
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
      thresholds: { lines: 80, statements: 80 },

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
