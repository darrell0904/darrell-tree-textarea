// .eslintrc.js
const eslintrc = {
  parser: 'babel-eslint',
  extends: [
    "standard",
    "standard-react",
    "plugin:jest/recommended",
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
    "react-hooks",
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
    "react/jsx-indent": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "semi": 0,
    "comma-dangle": 0
  }, // 自定义
}

module.exports = eslintrc