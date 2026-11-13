
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
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mapas: ['leaflet']
        }
      }
    }
  },

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
