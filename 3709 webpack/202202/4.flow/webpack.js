/**
 * 手写webpack入口文件
 */
const Compiler = require('./Compiler');
function webpack(options) {
    // 1.初始化参数：从webpack.config.js 配置文件和 Shell 语句中读取并合并参数, 得出最终的配置对象
    const argv = process.argv.slice(2); // 获取 Shell 语句中的参数, 比如'--mode=development'
    const shellOptions = argv.reduce((shellOptions, option) => {
        let [key, value] = option.split('=');
        shellOptions[key.slice(2)] = value;
        return shellOptions;
    }, {});
    const finalOptions = { ...options, ...shellOptions }; // 配置文件和Shell 语句中的参数合并

    // 2.用初始化参数new Compiler 对象，进行编译；触发钩子函数(比如开始编译和结束编译的钩子函数)
    let compiler = new Compiler(finalOptions);

    // 3.加载所有配置的插件，监听对应编译的钩子函数
    finalOptions.plugins.forEach(plugin => plugin.apply(compiler));
    return compiler;
}

module.exports = webpack;