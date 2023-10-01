import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json' assert { type: 'json' };
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        restClient: resolve(__dirname, 'src/restClient.ts'),
      },
      formats: ['es'],
      name: 'NovuRestJS',
      fileName: (format, name) => {
        if (format === 'es') {
          return `${name}.js`;
        }
        return `${name}.${format}`;
      },
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies), // don't bundle dependencies
        /^node:.*/, // don't bundle built-in Node.js modules (use protocol imports!)
      ],
    },
    target: 'es6', // transpile as little as possible
  },
  plugins: [dts()], // emit TS declaration files
});
