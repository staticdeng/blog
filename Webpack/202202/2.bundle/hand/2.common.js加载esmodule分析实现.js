/**
 * common.js加载esmodule分析实现
 * 1. require.r方法
      标识这个exports是es模块导出的结果（标识模块是es导出的）
      使用Object.defineProperty在 exports 对象上标记 { Symbol(Symbol.toStringTag): 'Module', __esModule: true }
 * 2. require.d方法
      在 exports 上挂响应式属性：将export default 和 export const xxx 等转换为 require.d(exports， { default, xxx }) => 等价于exports.defalut 和 exports.xxx的基础上加上了响应式
      遍历 exports 所有的属性(exports.default/exports.xxx等)设置getter，最终将 esmodule 转换为 common.js 代码
 * 3. common.js加载esmodule取值:
        let title = require("./src/title.js"); 
        console.log(title.default);
        console.log(title.age);
 */
var modules = {
  './src/title.js': (function (module, exports, require) {
    // 表示当前的模块是es导出的
    require.r(exports);

    // 在 exports 上挂响应式属性：将export default 和 export const xxx 等转换为 require.d(exports， { default, xxx })
    require.d(exports, {
      default: () => DEFAULT_EXPORT,
      age:()=> age
    });
    const DEFAULT_EXPORT = 'title_name';
    const age = { name: 'title_age' };

    /**
     * 上面 require.d 的等价于于下面两行代码，不同在于 require.d 用了 Object.defineProperty;
       这样在1s后改变 age.name 值，在 require("./src/title.js") 后使用 title.age.name 就是响应式的值了
         exports.default = 'title_name';
         exports.age = { name: 'title_age' };
     */
    setTimeout(() => {
      age.name = 'new_title_age';
    }, 1000);
  })
}


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

/**
 * require.r方法：
    标明这个exports是es模块导出的结果：使用Object.defineProperty在 exports 对象上标记 { Symbol(Symbol.toStringTag): 'Module', __esModule: true }
    不管是es module还common.js, 最终导出的都是common.js，require.r 所以做 esmodule 的标识
 */
require.r = (exports) => {
  //exports[Symbol.toStringTag]='Module'
  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

  //exports.__esModule = true;
  Object.defineProperty(exports, '__esModule', { value: true });
}

/**
 * require.d方法：
 *   遍历 exports 所有的属性设置getter
 */
require.d = (exports, definition) => {
  // 循环所有的属性
  for (let key in definition) {
    // 设置getter
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: definition[key]
    });
  }
}

let title = require("./src/title.js");
console.log(title.default);
console.log(title.age);

setTimeout(() => {
  // 2s后取title.age的值，因为用了Object.defineProperty，所以是响应式的，不会值没更新
  console.log(title.age);
}, 2000);