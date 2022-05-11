/**
 * webpack打包后文件的实现
 * 1. 所有模块定义全部存放到modules对象里
      1.1 属性名是模块的ID，也就是相对于根目录的相对路径加上文件扩展名
      1.2 值是此模块的定义函数，函数体就是原来的模块内的代码
 * 2. webpack在打包后的文件里按commonjs规范实现了一个require
      require方法通过moduleId调用模块modules[moduleId]，传入module, exports, require；用module.exports接收modules[moduleId]模块的导出值
      最后在require方法里返回模块的导出值module.exports
 */
var modules = {
  // 属性名为模块的ID，值为原来的模块内的代码
  './src/title': function (module, exports, require) {
    let msg = require('./src/msg.js');

    // 用module.exports接收modules[moduleId]模块的导出值
    module.exports = 'title-' + msg;
  },
  './src/msg.js': function (module, exports, require) {
    module.exports = 'msg';
  }
}

var cache = {};
// webpack在打包后的文件里按commonjs规范实现了一个require
function require(moduleId) {
  if (cache[moduleId]) {
    // 缓存
    return cache[moduleId].exports;
  }
  var module = cache[moduleId] = {
    // 定义一个module，export为空对象
    exports: {}
  }
  // 调用模块modules[moduleId]，传入module, exports, require三个参数，用module.exports接收模块的导出值
  modules[moduleId](module, module.exports, require);
  // 返回模块的导出值
  return module.exports;
}

// 使用require
let title = require('./src/title');
console.log(title);