import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@composition': path.resolve(__dirname, 'src/composition'),
      '@ui': path.resolve(__dirname, 'src/ui'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
