const path = require('path')

module.exports = {
  entry: './src/lib/index.js',
  output: {
    filename: 'oidlib.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'self',
    library: {
      name: 'oidlib',
      type: 'umd'
    }
  },
  mode: 'production'
}