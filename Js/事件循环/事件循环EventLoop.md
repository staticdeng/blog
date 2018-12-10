# js运行机制-事件循环EventLoop

先来看看一段js代码：

```js
console.log('script begin')
setTimeout(() => {
    console.log('setTimeout')
},0)

new Promise((resolve) => {
    console.log('promise begin')
    for(let i = 0; i < 1000; i++) {
        i == 999 && resolve()
    }
}).then(() => {
    console.log('promise then')
})

console.log('script end')
```

在node命令行里执行这段js代码，输出的情况为script begin-promise begin——script end——promise then——setTimeout，为什么会这样呢？我们先来了解几个概念.

## js单线程如何理解

js单线程意思就是同一时间只能做一件事，按照先后顺序执行.那么，为什么JavaScript不能有多个线程呢？这样能提高效率啊.  

JavaScript的单线程，与它的用途有关。作为浏览器脚本语言，JavaScript的主要用途是与用户互动，以及操作DOM。这决定了它只能是单线程，否则会带来很复杂的同步问题。比如，假定JavaScript同时有两个线程，一个线程在某个DOM节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？  

所以，为了避免复杂性，从一诞生，JavaScript就是单线程。

## 主线程和任务队列

单线程就意味着，所有任务需要排队。所有任务可以分成两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）。  

同步任务：在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；  

异步任务：不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。

下图是主线程和任务队列的示意图：

<img src="http://pjizbyw69.bkt.clouddn.com/eventloop01.png"/>

## 宏任务和微任务

了解完主线程，还要了解一下任务，任务有宏任务（MacroTask）和微任务（MicroTask）之分。  

宏任务主要有：script代码段、setTimeout、setInterval、Promise的构造函数、setImmediate、I/O等.  

微任务主要有：process.nextTick和Promise的回调这两种情况.

如果宏任务在本轮Event Loop中执行，则微任务在本轮Event Loop的所有宏任务结束后执行（Event Loop下面会讲到）。下面为宏任务和微任务的执行示意图：  

<img src="http://pjizbyw69.bkt.clouddn.com/eventloop02.png"/>

## Event Loop

主线程从"任务队列"中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为Event Loop（事件循环）

我们再回头看看开始的一段代码：  

> 首先任务进入执行栈，除了setTimeout，其他的进入主线程执行，setTimeout则进入任务队列；
> 然后主线程里面的任务又有宏任务和微任务，先执行宏任务，微任务在所有宏任务结束后执行；
> 所以先输出script begin-promise begin——script end——promise then；
> 最后主线程读任务队列的异步任务，最后输出setTimeout