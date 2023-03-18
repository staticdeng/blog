const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    mode: "development",
    devtool:false,//关闭sourcemap
    entry: {
        main: "./src/index.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
        publicPath:''
    },
    module: {},
    plugins: [
        new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
        }),
    ],
    devServer: {},
};