/**
 * 实现Promise的resolve和单个then方法
 */

function MyPromise(fn) {
    let callback = null
    this.then = function(cb) { //cb: callback
        callback = cb // 表示拿到了callback
    }
    function resolve(val){
        callback(val) // 把then函数执行的回调拿到resolve里执行
    }
    fn(resolve)
}