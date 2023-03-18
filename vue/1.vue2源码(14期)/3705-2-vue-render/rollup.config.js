/**
 * 配置打包手写vue2，让浏览器可以访问
 */

import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import path from 'path'

export default {
  // input: './src/core/index.js', // 入口
  input: './src/platforms/web/entry-runtime-with-compiler.js', // 入口
  output: {
    file: './dist/vue.js', // 出口
    name: 'Vue', // 打包global的全局变量名为Vue
    format: 'umd', // esm es6模块  commonjs模块  iife自执行函数  umd （commonjs amd）
    sourcemap: true, // 希望可以调试源代码
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // 排除node_modules所有文件
    }),
    // 别名
    alias({
      entries: {
        core: path.resolve(__dirname, 'src/core'),
        compiler: path.resolve(__dirname,'src/compiler'),
      },
    }),
    // 自动处理文件名后缀
    resolve()
  ]
}
