const path = require('path');
const RunPlugin = require('./plugins/run-plugin');
const DonePlugin = require('./plugins/done-plugin');
const AssetPlugin = require('./plugins/assets-plugin');
module.exports = {
    mode: 'production',
    devtool: false,
    /* entry: {
        main: './src/entry1.js'
    }, */
    entry: {
        entry1: './src/entry1.js',
        entry2: './src/entry2.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    path.resolve(__dirname, 'loaders/logger1.js'),
                    path.resolve(__dirname, 'loaders/logger2.js')
                ]
            }
        ]
    },
    plugins: [
        new RunPlugin(),
        new DonePlugin(),
        new AssetPlugin()
    ]
}