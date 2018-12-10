/**
 * 实现Promise的多个then方法的处理
 */

function MyPromise(fn) {
    let self = this
    let value = null
    // let callback = null
    self.defferd = []
    this.then = function(cb) {
        // callback = cb
        self.defferd.push(cb) // 多个then
        return this
    }
    function resolve(value){
        // callback(value)
        // 如果resolve在非异步函数里面执行，会导致该resolve函数先于then执行，拿不到then的回调，加一个计时器(原理是有异步时会跳过执行下一段代码)
        setTimeout(function(){
            self.defferd.forEach(function(callback){
                callback(value)
            })
        },0)
        
    }
    fn(resolve)
}