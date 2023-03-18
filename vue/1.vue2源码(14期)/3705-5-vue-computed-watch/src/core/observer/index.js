/**
 * 对象属性劫持和数组方法劫持
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/index.js
 */
import { newArrayProto } from './array';
import Dep from './dep';

// 劫持类
class Observer {
  constructor(data) {
    // data.__ob__ = this; // 这样写可枚举遍历到，会递归this可不行，需要设置为不可枚举
    // data.__ob__ = this 作用1.给数据加了一个标识，如果数据上有__ob__ 则说明这个属性被观测过了
    // data.__ob__ = this 作用2.在data.__ob__上挂载Observer的实例，可以供newArrayProto里面取observeArray方法

    // data.__ob__ = this改写为：
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false // 将__ob__ 变成不可枚举 （循环的时候无法获取到）
    });

    // 数组劫持
    if (Array.isArray(data)) {
      // 在数据的实例原型上重写数组的部分方法，并且保留数组原有的特性
      data.__proto__ = newArrayProto;
      // 不用劫持数组的每一项，只用劫持数组中的对象
      this.observeArray(data);
    } else {
      // 对象属性劫持
      this.walk(data);
    }
  }
  // 遍历对象，对属性依次劫持
  walk(data) {
    // "重新定义"所有的属性，在vue2中性能差
    Object.keys(data).forEach(key => defineRective(data, key, data[key]));
  }
  // 劫持数组中的对象
  observeArray(data) {
    data.forEach(v => observe(v));
  }
}


// 属性劫持(重新定义对象属性为响应式)
// Object.defineProperty只能劫持已经存在的属性，后增的或者删除的属性不会监听到（vue2里面会为此单独写一些api，如$set $delete）
function defineRective(target, key, value) { // value一直被使用，闭包
  observe(value); // 对深层对象都进行属性劫持

  let dep = new Dep(); // 每一个属性都有一个dep
  Object.defineProperty(target, key, {
    get() { // 取值的时候会执行get
      // console.log('defineRective get =>', value);
      if(Dep.target){
        dep.depend(); // 让这个属性的收集器dep记住当前的watcher
      }
      return value;
    },
    set(newValue) { // 修改的时候会执行set
      // console.log('defineRective set =>', newValue);
      if (newValue === value) return;

      observe(newValue); // 设置值为新的Object劫持新的Object属性

      value = newValue;

      dep.notify(); // dep通知更新
    }
  });
}

// 劫持入口
export function observe(data) {
  // 只对对象进行劫持
  if (typeof data !== 'object' || data === null) return;

  // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }

  return new Observer(data);
}