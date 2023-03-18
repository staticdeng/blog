/**
 * 异步串行保险钩子AsyncSeriesBailHook的使用
   作用：从这个示例中可以知道外部模块的捕获过程
 */
let { AsyncSeriesBailHook } = require("tapable");
let factorize = new AsyncSeriesBailHook(['resolveData']);

// -------------- 多个工厂函数的监听 ------------------

// 自定义回调拦截工厂函数的生产过程，改写callback
factorize.tapAsync('factory1', (resolveData, callback) => {
  if (resolveData === 'jquery') {
    callback(null, {
      id: resolveData,
      type: '外部模块',
      source: 'window.jQuery'
    });
  } else {
    callback(null);
  }
});

// 生成正常模块的工厂函数
factorize.tapAsync('factory2', (resolveData, callback) => {
  callback(null, { id: resolveData, type: '正常模块', source: 'webpack打包后的内容' });
});

// ---------- 多个模块调用会触发工厂函数的监听 -----------

factorize.callAsync('jquery', (err, module) => {
  // 第一个factory1里面捕获了'jquery'，callback返回，就不用走第二个factory2
  console.log(module);
});
factorize.callAsync('lodash', (err, module) => {
  // 第一个factory1里callback(null)，则继续执行第二个factory2
  console.log(module);
});