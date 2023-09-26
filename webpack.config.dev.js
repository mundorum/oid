const path = require('path')

module.exports = {
  entry: './src/assembly/full.js',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'oidlib-dev.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      type: 'module'
    }
  },
  mode: 'development'
}