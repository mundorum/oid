import { defineConfig } from 'vite'
import path from 'path'

const useLocal = process.env.USE_LOCAL_OID === 'true'

export default defineConfig({
  root: __dirname,
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html') // só usa esse
    }
  },
  resolve: {
    alias: {
      '@dvsmedeiros/oid': useLocal
        ? path.resolve(__dirname, '../src') // apontando direto para a pasta src
        : '@dvsmedeiros/oid'
    }
  },
  server: {
    port: 3000
  }
})