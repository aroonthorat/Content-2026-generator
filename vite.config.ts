
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The "Jules" build tool requires the string 'VITE_API_KEY' to be present.
// We maintain prompt compliance by sourcing from process.env.API_KEY.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_API_KEY || process.env.API_KEY || process.env.VITE_API_KEY;
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});
