
import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The empty string as third argument loads all envs regardless of VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Reverted to default minifier (esbuild) to avoid extra dependency requirements
    },
    server: {
      port: 3000
    }
  };
});
