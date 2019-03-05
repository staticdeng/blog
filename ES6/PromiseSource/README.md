# Promise源码实现

关于promise的使用，这里不作介绍，搜索一下非常多的文档，这个文档会教我们一步一步实现promise底层源码，力争简洁易懂，懂得原理才方便记忆，不要死记硬背。

## resolve, reject

**原理：**

* new Promise时需要传递一个executor执行器(函数)会立即被调用
* 默认的状态是等待态(pending)，这是一个维护状态status，调用resolve表示成功了将维护状态变为成功态(resolved)，reject表示失败了将维护状态变为失败态(rejected)
* 每一个promise都有一个实例方法then，执行的时候会检查维护状态status，这样就可以根据status来判断then的回调函数执行哪一个。

根据这三点，我们来实现实例化Promise中的resolve、reject和then。

首先看看原生Promise的实现，将下面代码拷贝到promise.test.js：

```js
let p = new Promise((resolve, reject) => {
    resolve('resolve');
    reject('reject');
})

p.then((value) => {
    console.log('success', value);
},(reason) => {
    console.log('error', reason);
})
```
运行node promise.test.js，结果为：

```
success resolve
```
通过上面例子我们可以发现，resolve和reject同时执行，一旦内部状态pending变成resolve和reject对应的状态，就不会再变成其他状态，只会输出一次结果。


在promise.test.js里引入我们自己的promise：

```js
let Promise = require('./promise');
...
```

将下面代码拷贝到./promise.js：

```js
function Promise(executor) {
    let self = this;
    self.status = 'pending'; // 在promise内部定义一个维护状态：默认值为'pending'
    self.value = null;
    self.reason = null;

    function resolve(value) {
        if(self.status === 'pending'){ // status只有是pending状态才能改变其维护状态
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
```
上面代码中，主要用到了一个维护状态status，执行resolve和reject方法改变status的状态，实例then的时候根据status的状态判断到底是resolve还是reject然后取值，这样就实现了一个最简单的Promise。

命令行执行node promise.test.js，结果和原生Promise一样：

```
success resolve
```

本文档中源代码在当前目录：[promise.js](./promise.js)  [promise-test.js](./promise-test.js)