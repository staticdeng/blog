/**
 * initState 初始化配置项data，初始化数据劫持
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/state.js
 */
import { observe } from '../observer/index';

export function initState(vm) {
  const opts = vm.$options; // 获取所有的选项
  if (opts.data) {
    initData(vm);
  }
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data; // data可能是函数和对象
  data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象
  vm._data = data; // 我将返回的对象放到了_data上
  // console.log(data);

  // 初始化数据劫持：vue 里采用了一个api defineProperty
  observe(data);

  for(let key in data) {
    proxy(vm, '_data', key);
  }
}

// 属性/数据代理：将vm.key的取值和设置值代理到vm._data.key上
function proxy(vm, sourceKey, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[sourceKey][key];
    },
    set(newValue) {
      vm[sourceKey][key] = newValue;
    }
  })
}