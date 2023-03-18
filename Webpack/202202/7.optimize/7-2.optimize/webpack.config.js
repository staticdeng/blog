const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const bootstrap = path.resolve(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.css');
const webpack = require('webpack');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const PurgecssPlugin = require("purgecss-webpack-plugin");
const { glob } = require('glob');
const smw = new SpeedMeasureWebpackPlugin();
module.exports = {
    mode: 'development',
    devtool: false,
    entry: './src/index.js',
    optimization: {
        moduleIds: 'named',
        chunkIds: 'named',
        usedExports: true,
        minimize: true,
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()]
    },
    /*  cache: {
         type: 'filesystem' //写入缓存到硬盘
     }, */
    /*  snapshot: {
         managedPaths: [path.resolve(__dirname, 'node_modules')],//配置包管理器管理的路径
     }, */
    output: {
        path: path.resolve(__dirname, 'dist'),
        //filename: '[name].[fullhash].js',
        //libraryExport: 'minus',//配置导出的模块中哪些子模块需要被 导出，它只有在libraryTarget设置为commonjs的时候才有用
        //library: 'calculator',//指定导出库的名称 
        //UniversalModuleDefinition
        //libraryTarget: 'umd'//以何种方式导出 this.calculator= window.calculator= global.calculator=
    },
    //此处是在模块里找依赖的模块时有效
    resolve: {
        extensions: [".js", ".jsx", ".json"],//指定要加载的模块的扩展名，尽可能把常用的往前放
        alias: { bootstrap },
        modules: ["node_modules"],//指定去哪个目录中查找对应的模块
        mainFields: ['browser', 'module', 'main'],//package.json中的main字段
        // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
        //mainFields: ['browser', 'module', 'main'],
        // target 的值为其他时，mainFields 默认值为：
        //mainFields: ["module", "main"],
        mainFiles: ["index", "main"],
        fallback: {
            crypto: false,
            buffer: false,
            stream: false
        }
    },
    //此处只用来找 loader时有效
    resolveLoader: {
        modules: ["loaders", "node_modules"],
    },
    module: {
        //不去分析这些模块的依赖，不可能有依赖，所以不去把它转成语法树，分析里的依赖模块
        noParse: /jquery|lodash/,
        /*  noParse: (moduleName) => {
             return /query|lodash/.test(moduleName);
         }, */
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: 3
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            // babel编译后把结果缓存起来，下次编译的时候可以复用上次的结果
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(jpg|png|gif)$/,
                type: 'asset',//必定会输出一个文件
                parser: {
                    //根据这个条件做选择，如果小于maxSize的话就变成base64字符串，如果大于的就拷贝文件并返回新的地址
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                    }
                },
                generator: {
                    filename: 'images/[hash][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            /* minify: {
                collapseWhitespace: true,
                removeComments: true
            } */
        }),
        new webpack.IgnorePlugin({
            contextRegExp: /moment$/, // 忽略哪个模块
            resourceRegExp: /locale/, // 忽略模块内的哪些资源
        }),
        new MiniCssExtractPlugin({
            filename: 'style/[name].[contenthash].css'
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['**/*']
        }),
        /* new PurgecssPlugin({
            paths: glob.sync(`${path.resolve('src')}/ `, { nodir: true })
        }), */
        //new webpack.optimize.ModuleConcatenationPlugin()

        //new BundleAnalyzerPlugin()
    ]
};
