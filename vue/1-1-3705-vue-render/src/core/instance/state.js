/**
 * initState 劫持数据
 * https://github.com/vuejs/vue/blob/2.6/src/core/instance/state.js
 */
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
}