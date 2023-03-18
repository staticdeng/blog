/**
 * 多次任务执行合并为一次：任务加入队列，弄个变量加个异步
 * https://github.com/vuejs/vue/blob/2.6/src/core/util/next-tick.js
 */

// nextTick 没有直接使用某个api 而是采用优雅降级的方式 
// 内部先采用的是promise （ie不兼容）  MutationObserver(h5的api)  可以考虑ie专享的 setImmediate  setTimeout
/*
let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  }
}
*/

let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach(cb => cb()); // 按照顺序依次执行
}

export function nextTick(cb) { // 先内部还是先用户的？
  callbacks.push(cb); // 维护nextTick中的cakllback方法
  if (!waiting) {
    // timerFunc();
    // Promise.resolve().then(flushCallbacks);
    setTimeout(flushCallbacks, 0);
    waiting = true;
  }
}