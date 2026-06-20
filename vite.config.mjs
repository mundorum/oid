import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const collectionsSrc = resolve(__dirname, '../collections/src')
const collectionsDist = resolve(__dirname, '../collections/dist')

function htmlAliasPlugin() {
  return {
    name: 'html-alias',
    transformIndexHtml(html) {
      // oid serves itself from /dist
      const stage1 = html.replace(
        /https:\/\/cdn\.jsdelivr\.net\/npm\/@mundorum\/oid\/([^"'\s]*)/g,
        '/dist/$1'
      )
      // bare @mundorum/oid CDN shortcut (auto-redirected, no trailing slash)
      const stage2 = stage1.replace(
        /https:\/\/cdn\.jsdelivr\.net\/npm\/@mundorum\/oid(?!\/)/g,
        '/dist/oid.min.js'
      )
      // collections CDN → local collections dist via /@fs/ (requires server.fs.allow)
      const stage3 = stage2.replace(
        /https:\/\/cdn\.jsdelivr\.net\/npm\/@mundorum\/collections\/([^"'\s]*)/g,
        `/@fs${collectionsDist}/$1`
      )
      // remaining CDN paths → local node_modules
      return stage3.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\//g, '/node_modules/')
    }
  }
}

// Create different configs based on command (build vs serve)
export default defineConfig(({ command, mode }) => {
  // If running dev server (serve command), use the server configuration
  if (command === 'serve') {
    return {
      plugins: [htmlAliasPlugin()],
      resolve: {
        preserveSymlinks: true,
        alias: {
          '@mundorum/oid/oid.js':             resolve(__dirname, 'src/assembly.js'),
          '@mundorum/oid/oid.css':            resolve(__dirname, 'src/style/oid.css'),
          '@mundorum/collections/full.js':    resolve(collectionsSrc, 'full/assembly.js'),
          '@mundorum/collections/fiction.js': resolve(collectionsSrc, 'fiction/assembly.js'),
          '@mundorum/collections/graph.js':   resolve(collectionsSrc, 'graph/assembly.js'),
          '@mundorum/collections/blockly.js': resolve(collectionsSrc, 'blockly/assembly.js'),
        }
      },
      server: {
        fs: {
          allow: [__dirname, resolve(__dirname, '../collections')]
        }
      }
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
