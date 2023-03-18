const QUEUE_STATE = 0; //已经入队，等待执行
const PROCESSING_STATE = 1; //正在处理中
const DONE_STATE = 2; //任务已经执行完毕

//先进先出
class ArrayQueue {
  constructor() {
    this._list = [];
  }
  enqueue(item) {
    this._list.push(item); //放的话是放在最后的
  }
  dequeue() {
    return this._list.shift(); //出的是第一个，
  }
}
class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item;
    this.state = QUEUE_STATE; //默认状态是等待执行
    this.callback = callback;
  }
}
class AsyncQueue {
  constructor({
    name,
    parallelism,
    processor,
    getKey
  }) {
    this._name = name; //队列的名称
    this._parallelism = parallelism; //并发的个数
    this._processor = processor; //每个条目的处理器
    this._getKey = getKey; //每个条目的唯一标识获取函数
    this._entries = new Map(); //用来判断此条目是否已经添加过
    this._queued = new ArrayQueue(); //内部真正用来存放条目
    this._activeTasks = 0; //当前正在执行的任务数
    this._willEnsureProcessing = false; //是否要马上开始处理任务
  }
  add(item, callback) {
    const key = this._getKey(item); //获取此条目的key
    const oldEntry = this._entries.get(key); //去_entries获取一下老的条目
    if (oldEntry) {
      if (oldEntry.state == DONE_STATE) {
        process.nextTick(() => callback(entry.error, entry.result));
      } else {
        //这个老条目还在执行中，还没有结束，会把callback放到数组里
        if (oldEntry.callbacks) {
          oldEntry.callbacks.push(callback);
        } else {
          oldEntry.callbacks = [callback]
        }
      }
      return;
    }
    const newEntry = new AsyncQueueEntry(item, callback); //创建一个新的条目
    this._entries.set(key, newEntry);
    this._queued.enqueue(newEntry);
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }
  _ensureProcessing = () => {
    //如果当前已经在执行的任务小于并发任务数的话
    while (this._activeTasks < this._parallelism) {
      //取得最先加入的任务，或者说队头的任务
      const entry = this._queued.dequeue();
      if (!entry) break;
      this._activeTasks++; //让当前正在执行的并发任务数增加1
      entry.state = PROCESSING_STATE; //把条目的状态设置为执行中
      this._startProcessing(entry); //开始处理此条目
    }
    this._willEnsureProcessing = false;
  }
  _startProcessing(entry) {
    this._processor(entry.item, (error, result) => {
      this._handleResult(entry, error, result);
    });
  }
  _handleResult(entry, error, result) {
    const callback = entry.callback; //取现此条目的保存的回调函数
    const callbacks = entry.callbacks; //此条件额外其它的回调函数
    entry.state = DONE_STATE; //让当前的条目进行完成态
    entry.result = result; //把执行结果放在result属性上
    entry.error = error;
    callback(error, result); //执行回调
    if (callbacks) {
      callbacks.forEach(callback => callback(error, result));
    }
    this._activeTasks--; //让当前正在并发执行的任务数减1
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }
}
module.exports = AsyncQueue;