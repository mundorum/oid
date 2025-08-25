import { defineConfig } from 'vite'
import path from 'path'

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

export default defineConfig({
  plugins: [htmlAliasPlugin()]
})
