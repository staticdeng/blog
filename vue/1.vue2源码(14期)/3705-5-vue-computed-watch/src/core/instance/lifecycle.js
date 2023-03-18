/**
 * 初始化生命周期initLifeCycle，挂载组件mountComponent
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/lifecycle.js
 */
import { patch } from '../vdom/patch';
import Watcher from '../observer/watcher';

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) { // 将vnode转化成真实dom
    // console.log('_update', vnode);

    const vm = this;
    const el = vm.$el;

    // patch既有初始化的功能，又有更新 
    vm.$el = patch(el, vnode);
  }
}

export function mountComponent(vm, el) { // 这里的el 是通过querySelector处理过的
  vm.$el = el;

  // 1.调用render方法产生虚拟节点虚拟DOM
  // 2.根据虚拟DOM产生真实DOM，插入el元素中
  // vm._update(vm._render()); // vm.$options.render() 虚拟节点

  const updateComponent = ()=>{
    console.log('mount =>', 'updateComponent');
    vm._update(vm._render());
  }
  const watcher = new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher
  // console.log('render watcher =>', watcher);
}

/**
 * 从vm.$options 中取生命周期函数调用
 */
export function callHook(vm, hook) { // 定义钩子函数
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach(handler => handler.call(vm));
  }
}
