module.exports = {const tailwindcss = require('tailwindcss');module.exports = {

  plugins: {

    'postcss-import': {},const autoprefixer = require('autoprefixer');  plugins: ['tailwindcss', 'autoprefixer']

    'tailwindcss/nesting': {},

    tailwindcss: {},}

    autoprefixer: {}

  }module.exports = {

}  plugins: [
    'postcss-import',
    'tailwindcss/nesting',
    tailwindcss,
    autoprefixer,
  ],
}