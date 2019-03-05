/**
new Promise时需要传递一个executor执行器(函数)会立即被调用
默认的状态是等待态(pending)，调用resolve表示成功了，reject表示失败了
每一个promise都有一个实例方法then
 */

let Promise = require('./promise');

let p = new Promise((resolve, reject) => {
    resolve('resolve');
    reject('reject');
})

p.then((value) => {
    console.log('success', value);
},(reason) => {
    console.log('error', reason);
})