import { defineConfig } from 'vite';
import path from 'path';

function htmlAliasPlugin() {
  return {
    name: 'html-alias',
    transformIndexHtml(html) {
      return html.replace(/@mundorum\/oid/g, '/node_modules/@mundorum/oid')
    }
  }
}

export default defineConfig({
  plugins: [htmlAliasPlugin()]
})
