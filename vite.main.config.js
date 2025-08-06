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
        const destPath = path.resolve('dist/database.js');
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
      // 在生产构建时排除热重载模块
      plugins: [
        {
          name: 'exclude-hot-reload',
          resolveId(id) {
            if (id.includes('hot-reload') && process.env.NODE_ENV === 'production') {
              return { id: 'virtual:hot-reload', external: false };
            }
          },
          load(id) {
            if (id === 'virtual:hot-reload') {
              return 'module.exports = class HotReload { constructor() {} init() {} destroy() {} };';
            }
          }
        }
      ]
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});