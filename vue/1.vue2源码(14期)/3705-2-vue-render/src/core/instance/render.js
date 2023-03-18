/**
 * renderMixin: vm._render生成虚拟dom
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/render.js
 */
import { createElementVNode, createTextVNode } from '../vdom/vnode';

export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const { render } = this.$options;

    // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
    const vnode = render.call(this);
    return vnode;
  }

  // _c('div',{},...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
};
