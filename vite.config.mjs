import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Create different configs based on command (build vs serve)
export default defineConfig(({ command, mode }) => {
  if (mode === 'development') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/assembly/full.js'),
          name: 'oidlib',
          fileName: () => 'oidlib-dev.js', // function avoids .es
          formats: ['es']  // ES module format
        },
        minify: false,
        sourcemap: true,
        outDir: 'lib/foundation',
        emptyOutDir: false // avoid cleaning the output directory
      }
    }
  }
  // Production config (UMD build)
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/assembly/full.js'),
        name: 'oidlib',
        fileName: () => 'oidlib.js', // function avoids .umd
        formats: ['umd']
      },
      minify: true,
      outDir: 'lib/foundation',
      emptyOutDir: false,
      rollupOptions: {
        output: {
          globals: {
            // Add any external dependencies here if needed
            // e.g. 'react': 'React'
          }
        }
      }
    }
  }
})
