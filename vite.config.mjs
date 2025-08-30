import { defineConfig } from 'vite'
import { resolve } from 'node:path'

function htmlAliasPlugin() {
  return {
    name: 'html-alias',
    transformIndexHtml(html) {
      // replace automatically redirected CDN link
      const stage1 = html.replace(
        /https:\/\/cdn\.jsdelivr\.net\/npm\/@mundorum\/oid(?!\/)/g,
        '/node_modules/@mundorum/oid/oid.min.js'
      )
      // replace remaining CDN paths with local paths
      return stage1.replace(/https:\/\/cdn.jsdelivr.net\/npm\//g, '/node_modules/')
    }
  }
}

// Create different configs based on command (build vs serve)
export default defineConfig(({ command, mode }) => {
  // If running dev server (serve command), use the server configuration
  if (command === 'serve') {
    return {
      plugins: [htmlAliasPlugin()]
    }
  }

  if (mode === 'development') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/assembly.js'),
          name: 'oidlib',
          fileName: () => 'oid.js', // function avoids .es
          formats: ['es']  // ES module format
        },
        minify: false,
        sourcemap: true,
        outDir: 'dist',
        emptyOutDir: false, // avoid cleaning the output directory
        rollupOptions: {
          external: [],
          output: {
            globals: {}
          }
        }
      }
    }
  }
  // Production config (UMD build)
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/assembly.js'),
        name: 'oidlib',
        fileName: () => 'oid.min.js', // function avoids .umd
        formats: ['umd']
      },
      minify: true,
      outDir: 'dist',
      emptyOutDir: false,
      cssMinify: true,
      rollupOptions: {
        external: [],
        output: {
          globals: {}
        }
      }
    }
  }
})
