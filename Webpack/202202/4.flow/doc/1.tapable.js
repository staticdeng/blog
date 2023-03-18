let { SyncHook } = require('tapable');
/* 
// 自己实现SyncHook
class SyncHook {
    constructor(args) {
        this.args = args;
        this.taps = [];
    }
    tap(name, fn) { // events on
        this.taps.push(fn);
    }
    call(...args) { // events emit
        this.taps.forEach((tap) => tap(...args));
    }
} 
*/

let syncHook = new SyncHook(['name', 'age']);
// tap 监听
syncHook.tap('监听器的名字1', (name, age) => {
    console.log(name, age);
})
syncHook.tap('监听器的名字2', (name, age) => {
    console.log(name, age);
})

// call 触发
syncHook.call('xiaoming', 28);