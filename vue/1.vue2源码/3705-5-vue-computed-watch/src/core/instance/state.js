/**
 * initState 初始化配置项data，初始化数据劫持
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/state.js
 */
import { observe } from '../observer/index';
import Watcher from '../observer/watcher';
import Dep from '../observer/dep';

export function initState(vm) {
  const opts = vm.$options; // 获取所有的选项
  if (opts.data) {
    initData(vm);
  }

  if (opts.computed) {
    initComputed(vm);
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

// 初始化computed
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上
  for (let key in computed) {
    let userDef = computed[key];

    // 计算属性中的getter
    let fn = typeof userDef === 'function' ? userDef : userDef.get

    // 将计算属性和计算属性watcher对应起来，传入dirty
    watchers[key] = new Watcher(vm, fn, { dirty: true })

    defineComputed(vm, key, userDef);
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

function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => { });

  // 可以通过vm拿到对应的计算属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

function createComputedGetter(key) {
  return function () {
    // 获取到对应属性的watcher
    const watcher = this._computedWatchers[key];
    // 缓存：dirty 为 true 执行计算属性，为 false 则为缓存状态
    if (watcher.dirty) {
      // 如果是脏的就执行计算属性watcher的fn
      watcher.evaluate();
    }
    
    if (Dep.target) { // 此时计算属性watcher出栈了, Dep.target 为渲染watcher
      // 计算属性watcher出栈后，还需要让计算属性watcher里面的依赖属性，也去收集上一层的渲染watcher
      watcher.depend();
    }
    return watcher.value;
  }
}