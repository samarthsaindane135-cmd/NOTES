
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // loadEnv searches for environment variables in the project root
  // Fix: Use '.' instead of process.cwd() to avoid the "Property 'cwd' does not exist on type 'Process'" TypeScript error
  const env = loadEnv(mode, '.', '');
  
  return {
    define: {
      // Ensure the key is always a string literal in the final bundle
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      // Explicitly use esbuild (default) which is already included in Vite
      minify: 'esbuild',
      sourcemap: false
    }
  };
});
