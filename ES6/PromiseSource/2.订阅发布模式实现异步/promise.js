function Promise(executor) {
    let self = this;
    self.status = 'pending'; // 在promise内部定义一个维护状态：默认值为'pending'
    self.value = null;
    self.reason = null;
    self.onResolvedCallBacks = []; // 存放then所有成功的回调
    self.onRejectedCallBacks = []; // 存放then存放所有失败的回调
    function resolve(value) {
        if(self.status === 'pending'){ // status只有是pending状态才能改变值
            self.value = value;
            self.status = 'resolved'; // 成功态
            // 发布模式：执行订阅then所有成功的回调
            self.onResolvedCallBacks.forEach(fn => fn());
        }
    }
    function reject(reason) {
        if(self.status === 'pending'){
            self.reason = reason;
            self.status = 'rejected'; // 失败态
            // 发布
            self.onRejectedCallBacks.forEach(fn => fn());
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
    if (self.status === 'pending') {
        // 订阅模式：构造函数Promise里resolve和reject函数在异步函数的情况下status为pending，在这里订阅then的回调
        self.onResolvedCallBacks.push(function() {
            onResolved(self.value);
        });
        self.onRejectedCallBacks.push(function() {
            onRejected(self.reason);
        });
    }
}
module.exports = Promise;