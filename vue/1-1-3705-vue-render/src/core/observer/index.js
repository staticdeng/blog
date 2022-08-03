/**
 * 对象属性劫持和数组方法劫持
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/index.js
 */

// 劫持类
class Observer{
  constructor(data) {
    // 对象属性劫持
    this.walk(data);
  }
  // 遍历对象，对属性依次劫持
  walk(data) {
    // "重新定义"所有的属性，在vue2中性能差
    Object.keys(data).forEach(key => defineRective(data, key, data[key]));
  }
}


// 属性劫持(重新定义对象属性为响应式)
function defineRective(target, key, value) { // value一直被使用，闭包
  observe(value); // 对深层对象都进行属性劫持

  Object.defineProperty(target, key, {
    get() { // 取值的时候会执行get
      console.log('get', value);
      return value;
    },
    set(newValue) { // 修改的时候会执行set
      console.log('set', newValue);
      if (newValue === value) return;

      observe(newValue); // 设置值为新的Object劫持新的Object属性

      value = newValue;
    }
  });
}

// 劫持入口
export function observe(data) {
  // 只对对象进行劫持
  if (typeof data !== 'object' || data === null) return;

  return new Observer(data);
}