/**
 * 重写数组的部分方法，并且保留数组原有的特性
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/array.js
 */

let oldArrayProto = Array.prototype; // 获取数组的原型

// 不要直接重写Array.prototype.push，否则会影响原生Array的push
export const newArrayProto = Object.create(oldArrayProto); // 拷贝一份，不影响数组原型上的方法
// 等价于newArrayProto.__proto__  = oldArrayProto

let methods = [ // 找到所有的变异方法
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
] // concat slice 都不会改变原数组

methods.forEach(method => {
  newArrayProto[method] = function (...args) { // 重写了数组的方法
    const result = oldArrayProto[method].call(this, ...args); // 内部调用原来的方法，函数的劫持
    // 需要对新增的数据再次进行劫持
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift': // arr.unshift(1,2,3)
        inserted = args;
        break;
      case 'splice':  // arr.splice(0,1,{a:1},{a:1})
        inserted = args.slice(2);
      default:
        break;
    }
    console.log('array inserted', inserted); // 新增的内容
    if(inserted) {
      // 对新增的内容再次进行观测  
      ob.observeArray(inserted);
    }
    return result;
  }
})