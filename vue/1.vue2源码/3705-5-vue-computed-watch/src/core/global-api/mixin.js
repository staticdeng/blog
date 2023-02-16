/**
 * Vue.mixin 合并所有调用 Vue.mixin(mixin) 的参数
 */
import { mergeOptions } from '../util/options';

export function initMixin(Vue) {
  Vue.options = {}

  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  }
}