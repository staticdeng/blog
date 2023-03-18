
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AssetPlugin = require('./asset-plugin');
//const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const PreloadWebpackPlugin = require('./preload-webpack-plugin');
const path = require('path');
module.exports = {
    mode: 'development',
    devtool: false,
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        //初始（initial）chunk 文件的名称
        filename: '[name].[chunkhash].js',
        //此选项决定了非初始（non-initial）chunk 文件的名称
        chunkFilename: '[name].[chunkhash].js',
    },
    optimization: {
        splitChunks: {
            //all=async+initial 表示哪些代码块需要分割，默认是async异步 all等于同步的initial加异步的async
            chunks: 'all',
            //生成 chunk 的最小体积（以 bytes 为单位） 分割出去的代码最小的体积是多少 0就是不限制
            minSize: 0,
            //拆分前必须共享模块的最小 chunks 数,,比如module1被3个代码块引用， module2被 2个代码块引入
            minChunks: 1,
            cacheGroups: {
                defaultVendors: false,
                default: false,
                commons: {
                    minChunks: 1,
                    reuseExistingChunk: true
                }
            }
            //缓存组可以继承和/或覆盖来自 splitChunks.* 的任何选项
            //缓存组是用来指定代码块分割的条件，哪些模块应该被 提取哪些代码块中
            /* cacheGroups: {
                //默认第三方缓存组
                defaultVendors: {
                    //控制此缓存组选择的模块。省略它会选择所有模块
                    //它可以匹配绝对模块资源路径
                    //如果某个模块资源的绝对路径匹配此正则的话，那么这个模块就可以被提供到此代码块中
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    //指定拆分前模块被 多少个代码块共享 的话才会提取到此代码块中
                    minChunks: 2,
                    //一个模块可以属于多个缓存组 jquery
                    //优化将优先考虑具有更高 priority（优先级）的缓存组
                    //默认组的优先级为负，以允许自定义组获得更高的优先级（自定义组的默认值为 0）
                    priority: -20
                }
                //defaultVendors: false,
                //default: false,
                 module2CacheGroup: {
                    //test可以写一个正则表达式用来匹配模块绝对路径
                    //也可以写一个自定义的函数进行匹配，返回true匹配上的，返回false就是没匹配上
                    test(module) {
                        // `module.resource`包含此文件的硬盘上的绝地路径
                        //为了跨平台兼容 ，尽量使用/而非\
                        return (
                            module.resource &&//绝对路径存在
                            module.resource.endsWith('module2.js')
                        );
                    },
                    // cacheGroupKey here is `commons` as the key of the cacheGroup
                    name(module, chunks, cacheGroupKey) {
                        const moduleFileName = module
                            .identifier()
                            .split(/[\\/]/)
                            .reduceRight((item) => item);
                        const allChunksNames = chunks.map((item) => item.name).join('~');
                        return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
                    },
                    priority: -200
                } 
            }, */

        },
        //将 optimization.runtimeChunk 设置为 true 或 'multiple'，会为每个入口添加一个只含有 runtime 的额外 chunk
        //正常来说如果只有page1.js,如果page1.js内容改变了，整个文件都会失效，重新加载
        //entrypoint其实就是入口代码块 page1 page2 page3
        /*  runtimeChunk: {
             name: (entrypoint) => `runtime~${entrypoint.name}`,
         }, */
        //realContentHash: false
    },
    plugins: [
        new PreloadWebpackPlugin({
            rel: 'prefetch',
            include: 'asyncChunks',
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        /*   new HtmlWebpackPlugin({
              template: './src/index.html',
              filename: 'page1.html',
              chunks: ['page1']
          }),
          new HtmlWebpackPlugin({
              template: './src/index.html',
              filename: 'page2.html',
              chunks: ['page2']
          }),
          new HtmlWebpackPlugin({
              template: './src/index.html',
              filename: 'page3.html',
              chunks: ['page3']
          }), */
        new AssetPlugin()
    ]
}