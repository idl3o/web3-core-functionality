import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  define: {
    // Fix for crypto: provide empty object for browser crypto
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Handle potential crypto dependencies
      crypto: 'crypto-js',
    },
  },
  build: {
    // Improve error reporting
    minify: false,
    sourcemap: true,
    rollupOptions: {
      // External packages that shouldn't be bundled
      external: [
        // Add any problematic modules here
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
