const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    devtool: false,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: {
                            "browsers": ["IE 10"]
                        },
                        presets: [
                            ["@babel/preset-env", {
                                useBuiltIns: 'usage',
                                corejs: { version: 3 }
                            }]
                        ],
                        plugins: [
                            ["@babel/plugin-transform-runtime", {
                                corejs: false,
                                helpers: true,
                                regenerator: false
                            }]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
};
// useBuiltIns: false  400 KiB 把polyfill全量引入，不考虑浏览器兼容性
