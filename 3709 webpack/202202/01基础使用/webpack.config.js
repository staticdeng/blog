const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
//上面不管如何设置，此处无法取到值
//console.log('process.env.NODE_ENV', process.env.NODE_ENV);
//package.json --env决定 envObj  envObj.development 决定 mode ,mode会决定 process.env.NODE_ENV
module.exports = {
    mode: 'development',
    devtool: false,
    //入口 
    entry: './src/index.js',
    //输出
    output: {
        path: path.resolve('dist'),
        filename: 'main.js',
        publicPath: '/'//指定打包后的文件插入html文件时的访问路径路径前缀
    },
    devServer: {
        //额外的静态文件根目录
        static: [path.resolve(__dirname, 'public'), path.resolve(__dirname, 'public2')],
        port: 8080,//静态文件服务器或者说webpack开发服务器端口号
        open: true, //打包完成后自动打开浏览器
        //因为其实在内部实现的时候，webpack-dev-server内部也是一个express服务器
        //这个参数跟内部实现耦合在一起了
        onBeforeSetupMiddleware({ app}) {
            app.get('/users', (req, res) => {
                res.json({
                    success: true,
                    data: { id: 1, name: 'zhangsan' }
                });
            });
        }
       /*  proxy: {
            '/api': {
                target: 'http://localhost:8000',
                pathRewrite: {"^/api":""} // /api/users=>/users
            }
        } */
    },
    //配置解析的别名
    resolve: {
        alias: {
            '@': path.resolve('src')
        }
    },
    module: {
        //loader 翻译器
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                options: { fix: false },
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { version: "2021-12", decoratorsBeforeExport: true }],
                            ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
                            ["@babel/plugin-proposal-private-methods", { loose: true }],
                            ["@babel/plugin-proposal-class-properties", { loose: true }]
                        ]
                    }
                }
            },
            //css-loader 可以处理css中的url和import
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,//处理url地址中的图片地址
                            import: true,//是否要处理源码中的import关键字
                            modules: false,//是否要对类名进行模块化处理 vue style scoped
                            sourceMap: false,//是否生成sourceMap
                            esModule: false,//{default:Array}  false Array
                            importLoaders: 1,//在处理引入@import引入的css这前需要先使用几个loader对它进行处理
                        }
                    },
                    "postcss-loader"
                ]
            },
            {
                test: /\.less$/, use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,//处理url地址
                            import: false,
                            modules: true,
                            sourceMap: true,
                            importLoaders: 0,//此参数无意义，因为css-loader拿 到的less-loader编译后css代码已经没有@import
                            esModule: true
                        }
                    },
                    "postcss-loader",
                    'less-loader']
            },
            {
                test: /\.scss$/, use: [
                    'style-loader',
                    'css-loader',
                    "postcss-loader",
                    'sass-loader']
            },
            {
                test: /\.png$/,
                type: 'asset/resource'//相当于以前的file-loader,它可以发射一个文件到输出目录里
            },
            {
                test: /\.ico$/,
                type: 'asset/inline'//相当于以前的url-loader,它可以把文件内容变成一个base64字符串，并内联到HTML中
            },
            {
                test: /\.txt$/,
                type: 'asset/source'//相当于以前的raw-loader,不对内容做任何转换
            },
            {
                test: /\.jpg$/,
                type: 'asset',
                parser: {
                    //指定内联的条件，如果引入的文件体积大于4K的话就发射文件，如果小于4K就变成base64字符串内联
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new webpack.DefinePlugin({
            //如果此处设置了process.env.NODE_ENV，会覆盖mode设置的process.env.NODE_ENV
            //'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            VERSION: JSON.stringify("1.0.0")
        }),
        /* new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.resolve('public'),
                            to: path.resolve('dist/public')
                        },
                        {
                            from: path.resolve('public2'),
                            to: path.resolve('dist/public2')
                        }
                    ]
        }) */
    ]
}
/**
 * 取值 process.env.NODE_ENV 有两个地方
 * 一个是模块内
 * 一个是webpack的配置文件中
 * source.replace('processx.envx.NODE_XX','release');
 * 
 */