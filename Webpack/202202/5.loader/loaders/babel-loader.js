/**
 * babel-loader实现原理
    1. babel-loader只是一个转换JS源代码的函数
    2. babel.transform(source, options) => 使用 @babel/core 的 transform 方法将源代码转换为ast语法树，
       transform 的第二个参数为babel的插件，插件里面通过接收旧的ast语法树，遍历语法树捕获对应的类型，转换为新的ast语法树，最后转为源代码
       实现ES6到ES5的语法转换
 */
const babel = require('@babel/core');

/**
 * babel-loader只是一个转换JS源代码的函数
 * @param {*} source 接收一个source参数
 * 返回一个新的内容
 */
function loader(source) {
    let options = this.getOptions({}); // presets: ["@babel/preset-env"]
    let { code } = babel.transform(source, options);
    return code;//转换成ES5的内容
}
module.exports = loader;
/**
 * babel-loader
     babel-loader只是提供一个转换源代码函数，但是它并不知道要干啥要转啥
 * @babel/core 真正要转换代码从ES6到ES5需要靠 @babel/core
     babel/core本身只能提供从源代码转成语法树，遍历语法树，从新的语法树重新生成源代码的功能
 * babel plugin
     但是babel/core并不知道如何转换语换法，它并不认识箭头函数，也不知道如何转换转换箭头函数
     @babel/transform-arrow-functions 插件其实是一个访问器，它知道如何转换AST语法树
 * babel preset
     因为要转换的语法太多，插件也太多。所以可一堆插件打包大一起，成为预设preset-env
 */