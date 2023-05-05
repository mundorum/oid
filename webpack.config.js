const path = require('path')

module.exports = {
  entry: './src/lib/index.js',
  output: {
    filename: 'oidlib.js',
    path: path.resolve(__dirname, 'lib'),
    globalObject: 'self',
    library: {
      name: 'oidlib',
      type: 'umd'
    }
  },
  mode: 'production'
}