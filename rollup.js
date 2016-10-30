import buble from 'rollup-plugin-buble'


export default {
  entry: 'index.js',
  dest: 'lib/f-validator.js',
  plugins: [
    buble({ transforms: { dangerousForOf: true } })
  ],
  format: 'cjs'
}
