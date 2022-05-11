/**
 * 异步加载/懒加载实现原理
 * 
 */

// 定义一个模块定义的对象
var modules = ({});
// 存放已经加载的模块的缓存
var cache = {};
// 在浏览器里实现require方法
function require(moduleId) {
  var cachedModule = cache[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = cache[moduleId] = {
    exports: {}
  };
  modules[moduleId](module, module.exports, require);
  return module.exports;
}
require.d = (exports, definition) => {
  for (var key in definition) {
    Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
  }
};
require.r = (exports) => {
  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  Object.defineProperty(exports, '__esModule', { value: true });
};

/**
 * 存放加载的代码块的状态：
   key是代码块的名字；0表示已经加载完成了
 */
var installedChunks = {
  "main": 0,
  //'hello': [resolve, reject,promise]
};

/**
 * 
 * @param {*} chunkIds 代码块ID数组
 * @param {*} moreModules 额外的模块定义
 */
function webpackJsonpCallback([chunkIds, moreModules]) {
  const resolves = [];
  for (let i = 0; i < chunkIds.length; i++) {
    const chunkId = chunkIds[i];
    resolves.push(installedChunks[chunkId][0]);
    installedChunks[chunkId] = 0; // 表示此代码块已经下载完毕
  }
  // 合并异步加载的模块定义到modules去
  for (const moduleId in moreModules) {
    modules[moduleId] = moreModules[moduleId];
  }
  // 依次取出resolve方法并执行
  while (resolves.length) {
    resolves.shift()();
  }
}

//给require方法定义一个m属性，指向模块定义对象
require.m = modules;
require.f = {};
//返回此文件对应的访问路径 
require.p = '';

// 返回此代码块对应的文件名
require.u = function (chunkId) {
  return chunkId+'.main.js'
}

/**
 * 加载异步加载的文件
 * @param {*} url 
 */
require.l = function (url) {
  let script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
}

/**
 * 通过JSONP异步加载一个chunkId对应的代码块文件，其实就是hello.main.js
 * 会返回一个Promise
 * @param {*} chunkId 代码块ID
 * @param {*} promises promise数组
 */
require.f.j = function (chunkId, promises) {
  // 当前的代码块的数据
  let installedChunkData;
  // 创建一个promise
  const promise = new Promise((resolve, reject) => {
    installedChunkData = installedChunks[chunkId] = [resolve, reject];
  });

  installedChunkData[2] = promise;
  promises.push(promise);
  // promises.push(installedChunkData[2] = promise);
  const url = require.p + require.u(chunkId); // require.p 公共路径；require.u文件名
  require.l(url);
}

/**
 * 加载模块
 */
require.e = function (chunkId) {
  let promises = [];
  require.f.j(chunkId,promises);
  return Promise.all(promises);
}

/**
 * 获取异步加载的文件
 */
var chunkLoadingGlobal = window['webpack'] = [];
chunkLoadingGlobal.push = webpackJsonpCallback;

/**
 * require.e异步加载hello代码块文件 hello.main.js
 * promise成功后会把 hello.main.js里面的代码定义合并到require.m对象上，也就是modules上
 * 调用require方法加载./src/hello.js模块，获取 模块的导出对象，进行打印
 */
debugger
require.e('hello')
  .then(require.bind(require, './src/hello.js'))
  .then(result => { console.log(result) });