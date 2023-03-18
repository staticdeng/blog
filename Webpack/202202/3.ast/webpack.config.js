/**
 * 使用按需加载的babel插件
 */

const path = require("path");
module.exports = {
  mode: "development",
  devtool: false,
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              // 使用babel-plugin-import插件
              // ['import', { libraryName: 'lodash', libraryDirectory: ''}],

              // 实现babel-plugin-import类似按需导入lodash的功能
              [
                path.resolve(__dirname, 'plugins/babel-plugin-import.js'),
                {
                  // 指定按需加载的模块
                  libraryName: 'lodash',
                  // 按需加载的目录
                  libraryDirectory: ''
                }
              ]
            ]
          }
        }
      },
    ],
  },
};