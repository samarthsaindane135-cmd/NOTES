
import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory
  // Fix for: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      // Inject API_KEY as a global constant
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      minify: 'esbuild', // Faster and built-in
      sourcemap: false
    },
    server: {
      port: 3000
    }
  };
});
