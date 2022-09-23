/**
 * 在initMixin中，挂载vm.$options, 依次初始化initLifecycle, initEvents, initRender, initState等
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/init.js
 */

import { initState } from './state';

export function initMixin(Vue) { // 就是给Vue增加init方法的
  Vue.prototype._init = function (options) { // 用于初始化操作
    // vue  vm.$options 就是获取用户的配置 
    // 我们使用的 vue的时候 $nextTick $data $attr.....
    const vm = this;
    vm.$options = options; // 将用户的选项挂载到实例上

    // 初始化状态（进行数据劫持）
    initState(vm);

  }
}

