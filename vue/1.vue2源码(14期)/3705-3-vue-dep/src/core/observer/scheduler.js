/**
 * 缓存watcher
 * 多次执行需要合并为一次：任务放入缓存队列，弄个变量防抖，开个异步执行缓存队列任务
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/scheduler.js
 */
import { nextTick } from '../util/next-tick';

let queue = []; // 队列
let has = {}; // 去重
// let waiting = false; // 防抖

// 执行缓存队列
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  // waiting = false;
  flushQueue.forEach(q => q.run()); // 在刷新的过程中可能还有新的watcher，重新放到queue中
}

export function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) { // 去重watcher
    has[id] = true;
    queue.push(watcher); // 缓存watcher
    // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
    // if (!waiting) {
    //   setTimeout(flushSchedulerQueue, 0);
    //   waiting = true;
    // }

    nextTick(flushSchedulerQueue);
  }
}