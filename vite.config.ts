
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  // Fixed the 'Property cwd does not exist on type Process' error using a type assertion.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
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
