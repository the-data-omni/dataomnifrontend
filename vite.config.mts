import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

// Polyfill plugins
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://github.com/vitejs/vite/issues/15012#issuecomment-1825035992
function muteWarningsPlugin(warningsToIgnore: string[][]): Plugin {
  const mutedMessages = new Set();

  return {
    name: 'mute-warnings',
    enforce: 'pre',
    config: (userConfig) => ({
      build: {
        rollupOptions: {
          onwarn(warning, defaultHandler) {
            if (warning.code) {
              const muted = warningsToIgnore.find(
                ([code, message]) => code == warning.code && warning.message.includes(message)
              );

              if (muted) {
                mutedMessages.add(muted.join());
                return;
              }
            }

            if (userConfig.build?.rollupOptions?.onwarn) {
              userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
            } else {
              defaultHandler(warning);
            }
          },
        },
      },
    }),
    closeBundle() {
      const diff = warningsToIgnore.filter((x) => !mutedMessages.has(x.join()));
      if (diff.length > 0) {
        this.warn('Some of your muted warnings never appeared during the build process:');
        diff.forEach((m) => this.warn(`- ${m.join(': ')}`));
      }
    },
  };
}

const warningsToIgnore = [
  ['SOURCEMAP_ERROR', "Can't resolve original location of error"],
  ['INVALID_ANNOTATION', 'contains an annotation that Rollup cannot interpret'],
];

// -----------------------------------
// VITE CONFIG
// -----------------------------------
export default defineConfig({
  plugins: [
    react(),
    muteWarningsPlugin(warningsToIgnore)
  ],

  // The crucial part for Buffer:
  optimizeDeps: {
    esbuildOptions: {
      // Enable global polyfills
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },

  resolve: {
    alias: [
      // Vite tries to avoid Node built-ins by default, so we alias 'buffer' -> the installed 'buffer' pkg
      { find: 'buffer', replacement: 'buffer' },

      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^@\/(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },

  server: {
    port: 3000,
    proxy: {
      '/api/generate_sql': {
        target: 'https://schema-scoring-api-2420.us-central1.run.app',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
});
