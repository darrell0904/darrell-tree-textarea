// https://www.cnblogs.com/tugenhua0707/p/8179686.html
// https://segmentfault.com/a/1190000007543178
// https://zhuanlan.zhihu.com/p/34218678

import path from 'path'
import rollupTypescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

import external from 'rollup-plugin-peer-deps-external'

import babel from 'rollup-plugin-babel'
import { DEFAULT_EXTENSIONS } from '@babel/core'

import pkg from './package.json'

const isDev = process.env.NODE_ENV === 'development'

const paths = {
  input: path.join(__dirname, '/src/index.tsx'),
  output: path.join(__dirname, '/lib')
}

// rollup 配置项
const rollupConfig = {
  input: paths.input,
  output: [
    // 输出 es 规范的代码
    {
      file: path.join(paths.output, 'index.js'),
      format: 'umd', // 五种输出格式：amd /  es6 / iife / umd / cjs
      name: pkg.name, // 当format为iife和umd时必须提供，将作为全局变量挂在window(浏览器环境)下：window.A=...
      sourcemap: true,
      plugins: [terser()],
      globals: {
        'react-dom': 'ReactDOM',
        react: 'React'
      }
    }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    external(),

    postcss({
      modules: true, // 增加 css-module 功能
      extensions: ['.less', '.css'],
      plugins: [
        autoprefixer(),
        cssnano()
      ],
    }),

    // 验证导入的文件
    // eslint({
    //   throwOnError: true, // lint 结果有错误将会抛出异常
    //   throwOnWarning: true,
    //   include: ['src/**/*.ts', 'src/**/*.tsx'],
    //   exclude: ['node_modules/**', 'lib/**']
    // }),
    resolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    rollupTypescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      tsconfig: "./tsconfig.json",
    }),
    babel({
      extensions: [
        ...DEFAULT_EXTENSIONS,
        '.ts',
        '.tsx'
      ]
    }),
    // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
    // 配合 commnjs 解析第三方模块
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react-is/index.js': ['isValidElementType']
      }
    }),
    serve({
      // open: true, // 是否打开浏览器
      contentBase: './lib', // 入口html的文件位置
      historyApiFallback: true, // Set to true to return index.html instead of 404
      host: 'localhost',
      port: 8889,
    }),

    livereload({
      watch: './lib'
    })
  ]
}

export default rollupConfig
