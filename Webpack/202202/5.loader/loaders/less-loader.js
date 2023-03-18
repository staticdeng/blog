/**
 * less-loader：把less编译成css
 * 返回的是一个js模块
 * @param {*} lessSource 
 */

const less = require('less');

function loader(lessSource) {
    // 调用async方法，那么此loader的执行就会变成异步的，当前loader结束后不会自动执行上一个loader，而是会等待调用callback函数才会继续执行
    let callback = this.async();
    less.render(lessSource, { filename: this.resource }, (err, output) => {
        // callback(err, output.css);
        // 当前上面callback(err, output.css)这种写法返回的是CSS脚本，并不是JS，所以并不能单独使用，只不能直接给webpack使用
        // 所以改写成module.exports导出模块的方式
        let script = `module.exports = ${JSON.stringify(output.css)}`;
        callback(err, script);
    });
}
module.exports = loader;
