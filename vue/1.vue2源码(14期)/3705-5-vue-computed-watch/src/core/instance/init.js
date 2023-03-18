/**
 * 在initMixin中，挂载vm.$options, 依次初始化initLifecycle, initEvents, initRender, initState等
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/init.js
 */

import { initState } from './state';
import { mergeOptions } from '../util/options';
import { callHook } from './lifecycle';

export function initMixin(Vue) { // 就是给Vue增加init方法的
  Vue.prototype._init = function (options) { // 用于初始化操作
    // vue  vm.$options 就是获取用户的配置 
    // 我们使用的 vue的时候 $nextTick $data $attr.....
    const vm = this;
    // vm.$options = options; // 将用户的选项挂载到实例上
    vm.$options = mergeOptions(this.constructor.options, options); // 将全局指令(如Vue.mixin)和用户的选项合并，挂载到实例上

    // 初始化状态前调用 beforeCreate 生命周期
    callHook(vm, 'beforeCreate');
    // 初始化状态（进行数据劫持）
    initState(vm);
    // 初始化状态后调用 created 生命周期
    callHook(vm, 'created');
    
    if (options.el) {
      vm.$mount(options.el); // 如果选项有el, 调用$mount挂载数据
    }
  }
}

