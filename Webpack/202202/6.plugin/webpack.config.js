const path = require('path');
const DonePlugin = require('./plugins/done-plugin');
const AssetPlugin = require('./plugins/assets-plugin');
const ArchivePlugin = require('./plugins/archive-plugin');
const AutoExternalPlugin = require('./plugins/auto-external-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  // externals: {
  //   // key为lodash是要require或import的模块名, 值为_是一个全局变量名window._
  //   'lodash': '_'
  // },
  plugins: [
    new DonePlugin({ name: 'DonePlugin' }),
    new AssetPlugin(),
    new ArchivePlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new AutoExternalPlugin({
      lodash: {
        globalVariable: '_',
        url: 'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js'
      }
    })
  ]
}