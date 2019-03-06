function Promise(executor) {
    let self = this;
    self.status = 'pending'; // 在promise内部定义一个维护状态：默认值为'pending'
    self.value = null;
    self.reason = null;

    function resolve(value) {
        if(self.status === 'pending'){ // status只有是pending状态才能改变值
            self.value = value;
            self.status = 'resolved'; // 成功态
        }
    }
    function reject(reason) {
        if(self.status === 'pending'){
            self.reason = reason;
            self.status = 'rejected'; // 失败态
        }
    }
    // new Promise时需要传递一个executor执行器(函数)会立即被调用
    executor(resolve, reject);
}

// then是实例方法，实例执行then方法需要获取resolve和reject的值，这时候就需要一个状态维护，这个状态就是'pending'
Promise.prototype.then = function (onResolved, onRejected) {
    let self = this;
    if (self.status === 'resolved') {
        onResolved(self.value);
    }
    if (self.status === 'rejected') {
        onRejected(self.reason);
    }
}
module.exports = Promise;