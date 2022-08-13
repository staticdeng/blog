/**
 * 带模板编译(编译器)的入口文件
 * https://github.com/vuejs/vue/blob/2.6/src/platforms/web/entry-runtime-with-compiler.js
  • script 标签引用的vue.global.js, 这个编译过程是在浏览器运行的, 含编译器
  • runtime是不包含模板编译的, 不含编译器, 整个编译是打包的时候通过loader来转义.vue文件的
 */

import Vue from 'core/index';
import { compileToFunctions } from 'compiler/index';

// $mount实现挂载
Vue.prototype.$mount = function (el) {
  const vm = this;
  el = document.querySelector(el);
  if (!el) return;

  let options = vm.$options;
  if (!options.render) { // 先看有没有render函数 
    let template; // 没有render看一下是否写了tempate, 没写template采用外部的html
    if (!options.template) { // 没有写模板但是写了el
      template = el.outerHTML
    } else {
      template = options.template // 有temlate则采用temlate的内容
    }

    if (template) {
      // 对模板进行编译 
      const render = compileToFunctions(template);
      options.render = render; // jsx 最终会被编译成h('xxx')
    }
  }
}
export default Vue;