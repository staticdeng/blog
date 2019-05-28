/**
 * 
 */

let Promise = require('./promise');

let p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('resolve');
        reject('reject');
    }, 5000)
})

p.then((value) => {
    console.log('success', value);
},(reason) => {
    console.log('error', reason);
})

// 测试多个then
p.then((value) => {
    console.log('success', value);
},(reason) => {
    console.log('error', reason);
})