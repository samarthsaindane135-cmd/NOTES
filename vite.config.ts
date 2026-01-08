
import { defineConfig, loadEnv } from 'vite';
// Import process from node:process to resolve the TypeScript error: Property 'cwd' does not exist on type 'Process'
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The empty string as third argument loads all envs regardless of VITE_ prefix.
  // Fix: Explicitly import process to ensure the 'cwd' method is correctly typed in the Vite configuration context.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
    },
    server: {
      port: 3000
    }
  };
});
