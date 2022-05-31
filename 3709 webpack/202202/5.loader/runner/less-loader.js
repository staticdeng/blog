const less = require('less');
/**
 * 把less编译成css
 * @param {*} lessSource 
 */
function loader(lessSource) {
    //一旦你调用了async方法，那么此loaer的执行就会变成异步的，当前loader结束后不会自动执行上一个loader
    //而是会等待你调用callback函数才会继续执行
    let callback = this.async();
    less.render(lessSource, { filename: this.resource }, (err, output) => {
        callback(err, output.css);
    });
    /* setTimeout(() => {
        //调用下一个loader
        //如果一直不调用callback,就会卡死在这里
        callback(err, output.css);
    }, 3000); */
}
module.exports = loader;

/* fs.readFile(filename, (err,result) => {

}); */