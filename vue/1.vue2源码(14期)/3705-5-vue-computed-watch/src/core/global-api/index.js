/**
 * vue全局api
 */
import { initMixin } from './mixin';

export function initGlobalAPI(Vue) {
  
  // Vue.mixin
  initMixin(Vue);
}