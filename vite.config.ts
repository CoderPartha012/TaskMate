import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-motion':  ['framer-motion'],
          'vendor-charts':  ['recharts'],
          'vendor-heatmap': ['react-calendar-heatmap'],
          'vendor-dnd':     ['react-beautiful-dnd'],
          'vendor-zustand': ['zustand'],
          'vendor-datefns': ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
