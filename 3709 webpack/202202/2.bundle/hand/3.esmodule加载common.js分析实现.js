/**
 * esmodule加载common.js分析实现
 * 1. 打包前的模块是一个es module(使用import)，那么就会调用require.r方法进行标识处理；并把import转换为require
 * 2. require.n 方法：获取导出对象的默认导出
 */

(() => {
  var modules = ({
    "./src/title.js":
      ((module) => {
        module.exports = {
          name: 'title_name',
          age: 'title_age'
        }
      })
  });
  var cache = {};
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
      if (require.o(definition, key) && !require.o(exports, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };
  require.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  require.r = (exports) => {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  /**
   * 
   * require.n 方法
   * 作用：获取导出对象的默认导出 
   */
  require.n = (module) => {
    var getter = module && module.__esModule ? () => (module['default']) : () => (module);
    // require.d(getter, { a: getter }); // 给getter添加一个a属性，a的值getter.a就是getter的返回值
    return getter;
  };
  var exports = {};
  (() => {
    // 只要打包前的模块是一个es module(使用import)，那么就会调用require.r方法进行标识处理；并把import转换为require
    require.r(exports);
    var title = require("./src/title.js");
    var title_default = require.n(title);
    console.log((title_default()));
    console.log(title.age);
  })();
})();