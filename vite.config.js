import { defineConfig } from 'vite';

// Try to import the node polyfills plugin with a better fallback
let nodePolyfillsPlugin = [];
try {
  // First, try dynamic import
  const nodePolyfillsModule = await import('vite-plugin-node-polyfills').catch(() => null);

  if (nodePolyfillsModule && nodePolyfillsModule.nodePolyfills) {
    nodePolyfillsPlugin.push(
      nodePolyfillsModule.nodePolyfills({
        protocolImports: true,
      })
    );
  } else {
    // If dynamic import fails, try CommonJS require
    try {
      const commonJsModule = require('vite-plugin-node-polyfills');
      if (commonJsModule && commonJsModule.nodePolyfills) {
        nodePolyfillsPlugin.push(
          commonJsModule.nodePolyfills({
            protocolImports: true,
          })
        );
      }
    } catch (e) {
      // Both methods failed, provide warning
      console.warn("Warning: vite-plugin-node-polyfills is not installed. Some features may not work correctly.");
      console.warn("Install it with: npm install vite-plugin-node-polyfills --save-dev");
    }
  }
} catch (e) {
  console.warn("Warning: Error loading vite-plugin-node-polyfills:", e.message);
  console.warn("Some features may not work correctly. Try installing it with: npm install vite-plugin-node-polyfills --save-dev");
}

export default defineConfig({
  plugins: nodePolyfillsPlugin,
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
