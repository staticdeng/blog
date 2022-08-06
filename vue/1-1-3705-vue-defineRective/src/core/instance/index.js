/**
 * vue 入口文件
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/index.js
 * 导出Vue构造函数
 */

import { initMixin } from './init';

// 避免将所有的方法都耦合在一起，使用构造函数的方式，不使用类的方式
function Vue(options) { 
  // options就是用户的选项
  this._init(options); // 默认就调用了init
}

initMixin(Vue);

export default Vue;