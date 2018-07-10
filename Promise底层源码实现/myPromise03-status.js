/**
 * 实现Promise的状态_status标识和多个resolve的正常处理（之前只能处理一个resolve）
 */

function MyPromise(fn) {
    let self = this
    let value = null
    self._resolves = []
    self._status = 'PENDING'
    this.then = function(cb) {
        // 递归调用resolve
        return new MyPromise(function(resolve){
            // 对上一个Promise的then中回调进行处理，并调用resolve
            function handle(){
                let ret = typeof cb == 'function' && cb(value) || value
                if(ret && typeof ret['then'] == 'function'){ // 判断下一个then类型是否为函数
                    ret.then(function(value){
                        resolve(value)
                    })
                }else{
                    resolve(ret)
                }
            }
            if(self._status == 'PENDING'){
                self._resolves.push(cb)
            }else if(self._status == 'FULLFILLED'){
                handle(value)
            }
        })
        
        
    }
    function resolve(value){
        setTimeout(function(){
            self._status = 'FULLFILLED'
            self._resolves.forEach(function(callback){
                callback(value)
            })
        },0)
        
    }
    fn(resolve)
}