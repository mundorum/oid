const path = require('path')

module.exports = {
  entry: './src/assembly/full.js',
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