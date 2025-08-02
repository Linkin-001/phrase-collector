import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import { copyFileSync } from 'fs';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    {
      name: 'copy-database',
      writeBundle() {
        const srcPath = path.resolve('src/database.js');
        const destPath = path.resolve('.vite/build/database.js');
        copyFileSync(srcPath, destPath);
      }
    }
  ],
  build: {
    lib: {
      entry: 'src/main.js',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
      output: {
        entryFileNames: 'main.js',
      },
    },
    outDir: '.vite/build',
    emptyOutDir: false,
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});