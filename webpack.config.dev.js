const path = require('path')

module.exports = {
  entry: './src/lib/index.js',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'oidlib-dev.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module'
    }
  },
  mode: 'development'
}