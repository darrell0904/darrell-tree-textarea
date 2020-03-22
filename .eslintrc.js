// .eslintrc.js
const eslintrc = {
  parser: 'babel-eslint',
  extends: [
    "standard",
    "standard-react",
    'plugin:jest/recommended',
  ],
  env: {
      browser: true,
      node: true,
      es6: true,
      jest: true,
  },
  plugins: [
    "react",
    'jest',
  ],
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    "indent": 0,
    "no-tabs": 0,
    "react/jsx-indent": 0
  }, // 自定义
}

module.exports = eslintrc