import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { cpSync, existsSync } from 'fs'

function copyExtrasToLib() {
  const folders = ['components', 'base', 'infra']
  for (const folder of folders) {
    const src = resolve(__dirname, 'src', folder)
    const dest = resolve(__dirname, 'lib/foundation', folder)
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true })
      console.log(`Copied src/${folder} to lib/foundation/${folder}`)
    }
  }

  const cssSrc = resolve(__dirname, 'oiddefault.css')
  const cssDest = resolve(__dirname, 'lib/foundation/oiddefault.css')
  if (existsSync(cssSrc)) {
    cpSync(cssSrc, cssDest)
    console.log('Copied oiddefault.css to lib/foundation/')
  }
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/assembly.js'),
        name: 'oidlib',
        fileName: () => isDev ? 'oidlib-dev.js' : 'oidlib.js',
        formats: isDev ? ['es'] : ['umd']
      },
      minify: !isDev,
      sourcemap: isDev,
      outDir: 'lib/foundation',
      emptyOutDir: false,
      rollupOptions: {
        output: {
          globals: {}
        }
      }
    },
    plugins: [{
      name: 'copy-extras',
      closeBundle: copyExtrasToLib
    }]
  }
})