# 核心总结

1. webpack打包后文件的分析实现(require 实现)：[代码](./hand/1.main打包文件分析实现.js)

* 1.1 所有模块定义全部存放到modules对象里
    * 属性名是模块的ID，也就是相对于根目录的相对路径加上文件扩展名
    * 值是此模块的定义函数，函数体就是原来的模块内的代码
* 1.2 webpack在打包后的文件里按commonjs规范实现了一个require
  * require方法通过moduleId调用模块modules[moduleId]，传入module, exports, require三个参数；
  * 在模块modules里，用module.exports接收modules[moduleId]模块的导出值
  * 最后在require方法里返回模块的导出值module.exports

2. common.js加载esmodule分析实现：[代码](./hand/2.common.js加载esmodule分析实现.js)

* 2.1 require.r方法
  * 标识这个exports是es模块导出的结果（标识模块是es导出的）
  * 使用Object.defineProperty在 exports 对象上标记 { Symbol(Symbol.toStringTag): 'Module', __esModule: true }
* 2.2 require.d方法
  * 在 exports 上挂响应式属性：将export default 和 export const xxx 等转换为 require.d(exports， { default, xxx }) => 等价于exports.defalut 和 exports.xxx的基础上加上了响应式
  * 遍历 exports 所有的属性(exports.default/exports.xxx等)设置getter，最终将 esmodule 转换为 common.js 代码
* 2.3 common.js加载esmodule取值:
    let title = require("./src/title.js"); 
    console.log(title.default); // export default 在commonjs 里要使用title.default 而不是title
    console.log(title.age);

3. esmodule加载common.js分析实现：[代码](./hand/3.esmodule加载common.js分析实现.js)

* 3.1 打包前的模块是一个es module(使用import)，那么就会调用require.r方法进行标识处理；并把import转换为require
* 3.2 require.n 方法：获取导出对象的默认导出

4. 异步加载/懒加载实现原理

* 4.1 require.e异步加载hello.js的代码块文件hello.main.js，使用require.l进行网络请求
 
* 4.2 promise成功后，执行hello.main.js，通过回调函数window['webpack'].push，通知 webpackJsonpCallback 合并 hello.main.js 里面的代码定义到modules对象上

* 4.3 调用require方法加载./src/hello.js模块，获取模块modules的导出对象，获取异步模块 hello.main.js 的结果

1\. webpack 介绍
------------------------------------

*   `Webpack`是一个前端资源加载/打包工具。它将根据模块的依赖关系进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。

![webpack_intro](http://img.zhufengpeixun.cn/webpack_intro.gif)

2\. 预备知识
------------------------

### 2.1 toStringTag

*   `Symbol.toStringTag` 是一个内置 symbol，它通常作为对象的属性键使用，对应的属性值应该为字符串类型，这个字符串用来表示该对象的自定义类型标签
*   通常只有内置的 `Object.prototype.toString()` 方法会去读取这个标签并把它包含在自己的返回值里。

```
console.log(Object.prototype.toString.call("foo")); // "[object String]"
console.log(Object.prototype.toString.call([1, 2])); // "[object Array]"
console.log(Object.prototype.toString.call(3)); // "[object Number]"
console.log(Object.prototype.toString.call(true)); // "[object Boolean]"
console.log(Object.prototype.toString.call(undefined)); // "[object Undefined]"
console.log(Object.prototype.toString.call(null)); // "[object Null]"
let myExports = {};
Object.defineProperty(myExports, Symbol.toStringTag, { value: "Module" });
console.log(Object.prototype.toString.call(myExports)); //[object Module]

```
```
[object String]
[object Array]
[object Number]
[object Boolean]
[object Undefined]
[object Null]
[object Module]

```

### 2.2 defineProperty

*   [defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。
    *   obj 要在其上定义属性的对象。
    *   prop 要定义或修改的属性的名称。
    *   descriptor 将被定义或修改的属性描述符。

```
let obj = {};
var ageValue = 10;

Object.defineProperty(obj, "age", {
  //writable: true, //是否可修改
  //value: 10, //writeable 和 set不能混用
  get() {
    return ageValue;
  },
  set(newValue) {
    ageValue = newValue;
  },

  enumerable: true, //是否可枚举
  configurable: true, //是否可配置可删除
});

console.log(obj.age);
obj.age = 20;
console.log(obj.age);

```

3\. 同步加载(require)
------------------------

### 3.1 安装模块

```bash
cnpm i webpack webpack-cli html-webpack-plugin clean-webpack-plugin -D

```

### 3.2 webpack.config.js

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  module: {},
  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
  ],
  devServer: {},
};

```

### 3.2 index.js

src\\index.js

```js
let title = require("./title.js");
console.log(title);

```

### 3.3 title.js

src\\title.js

```js
module.exports = "title";

```

### 3.4 index.html

src\\index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack</title>
  </head>
  <body></body>
</html>

```

### 3.5 package.json

package.json

```bash
  "scripts": {
    "build": "webpack"
  }

```

### 3.6 打包文件

使用vscode插件rm-js-comment，简化webpack的打包文件内容，去掉注释和简化变量名

安装rm-js-comment后，允许npm run build打包，在打包文件里右键format就可以去掉注释了：

```js
 (() => {
   var __webpack_modules__ = ({
     "./src/title.js": ((module) => {
       module.exports = 'title';
     })
   });
   var __webpack_module_cache__ = {};

   function __webpack_require__(moduleId) {
     var cachedModule = __webpack_module_cache__[moduleId];
     if (cachedModule !== undefined) {
       return cachedModule.exports;
     }
     var module = __webpack_module_cache__[moduleId] = {
       exports: {}
     };
     __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
     return module.exports;
   }
   var __webpack_exports__ = {};
   (() => {
     let title = __webpack_require__("./src/title.js");
     console.log(title);
   })();
 })();
```

进一步简化变量名，在Settings-Extensions下找到rm-js-comment，点击Edit in settings.json，改为下面的配置：

```json
{
  "rm-js-comment.replacer": {
    "babel_runtime_corejs3_":"",
    "__WEBPACK":"",
    "__webpack_handle_async_dependencies__":"async_dependencies",
    "IMPORTED_MODULE_":"",
    "__WEBPACK_DEFAULT_EXPORT__":"DEFAULT_EXPORT",
    "__webpack_exports__":"exports",
    "__unused_webpack_module":"module",  
    "__WEBPACK_EXTERNAL_MODULE_":"EXTERNAL_MODULE_",
    "__WEBPACK_DYNAMIC_EXPORT__":"DYNAMIC_EXPORT",
    "__system_context__":"system_context",
    "__webpack_require__":"require",
    "__webpack_module_cache__":"cache",
    "__webpack_modules__":"modules",
    "__WEBPACK_IMPORTED_MODULE_":"_IMPORTED_MODULE_",
    "/*#__PURE__*/":"",
    "___EXPOSE_LOADER_IMPORT___":"EXPOSE_IMPORT",
    "___EXPOSE_LOADER_GET_GLOBAL_THIS___":"GET_GLOBAL_THIS",
    "___EXPOSE_LOADER_GLOBAL_THIS___":"GLOBAL_THIS"
  }
}
```

再次format简化变量名：

```js
// webpack打包后文件分析
(() => {
  // modules里为所有的模块
  // 属性名为模块的ID，值为原来的模块内的代码
  var modules = ({
    "./src/title.js": ((module) => {
      module.exports = 'title';
    })
  });
  var cache = {};

  // webpack在打包后的文件里按commonjs规范实现了一个require
  function require(moduleId) {
    // 缓存
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = cache[moduleId] = {
      // 定义一个module，export为空对象
      exports: {}
    };
    // 调用模块modules[moduleId]，传入module, exports, require三个参数，用module.exports接收模块的导出值
    modules[moduleId](module, module.exports, require);
    // 返回模块的导出值
    return module.exports;
  }
  var exports = {};
  (() => {
    let title = require("./src/title.js");
    console.log(title);
  })();
})();
```

4\. 兼容性实现
---------------------------

### 4.1 common.js 加载 common.js

#### 4.1.1 index.js

```js
let title = require("./title");
console.log(title.name);
console.log(title.age);

```

#### 4.1.2 title.js

```js
exports.name = "title_name";
exports.age = "title_age";

```

#### 4.1.3 main.js

从打包结果可以看出，common.js 加载 common.js也就是require:

```js
(() => {
  var modules = ({
    "./src/title.js":
      ((module, exports) => {
        exports.name = 'title_name';
        exports.age = 'title_age';
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
  var exports = {};
  (() => {
    let title = require("./src/title.js");
    console.log(title.name);
    console.log(title.age);
  })();
})();

```

### 4.2 common.js 加载 ES module

#### 4.2.1 index.js

common.js 加载 ES module:

```js
let title = require("./title");
console.log(title);
console.log(title.age);

```

#### 4.2.2 title.js

ES module 规范的代码：

```js
export default "title_name";
export const age = "title_age";

```

#### 4.2.3 main.js

common.js 加载 ES module，是把 ES module 代码变为 common.js代码.

common.js 加载 ES module分析实现：[代码](./hand/2.common.js加载esmodule分析实现.js)

```js
(() => {
  var modules = ({
    "./src/title.js":
      ((module, exports, require) => {
        require.r(exports);
        require.d(exports, {
          "default": () => (_DEFAULT_EXPORT__),
          "age": () => (age)
        });
        const _DEFAULT_EXPORT__ = ('title_name');
        const age = 'title_age';
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
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };
  let title = require("./src/title.js");
  console.log(title);
  console.log(title.age);
})();

```

### 4.3 ES module 加载 ES module

#### 4.3.1 index.js

```js
import name, { age } from "./title";
console.log(name);
console.log(age);

```

#### 4.3.2 title.js

```js
export default name = "title_name";
export const age = "title_age";

```

#### 4.3.3 main.js

ES module 加载 ES module和common.js 加载 ES module类似：

```js
(() => {
  "use strict";
  var modules = ({
    "./src/title.js":
      ((module, exports, require) => {
        require.r(exports);
        let _DEFAULT_EXPORT__ = ('title_name');
        let age = 'title_age';
        setTimeout(() => {
          age = 'new';
        }, 1000);
        /*  require.d(exports, {
           "default": () => (_DEFAULT_EXPORT__),
           "age": () => (age)
         }); */
        exports.age = age;
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
  (() => {
    require.d = (exports, definition) => {
      for (var key in definition) {
        if (require.o(definition, key) && !require.o(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  })();
  (() => {
    require.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  })();
  (() => {
    require.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();
  var exports = {};
  (() => {
    require.r(exports);
    var _title_0__ = require("./src/title.js");
    console.log(_title_0__["default"]);
    console.log(_title_0__.age);
  })();
})();

```

### 4.4 ES module 加载 common.js

#### 4.4.1 index.js

ES module 加载 common.js:

```js
import name, { age } from "./title";
console.log(name);
console.log(age);

```

#### 4.4.2 title.js

common.js:

```js
module.exports = {
  name: "title_name",
  age: "title_age",
};

```

#### 4.4.3 main.js

ES module 加载 common.js 分析实现：[代码](./hand/3.esmodule加载common.js分析实现.js)

```js
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
  require.n = (module) => {
    var getter = module && module.__esModule ?
      () => (module['default']) :
      () => (module);
    //require.d(getter, { a: getter });
    //给getter添加一个a属性，a的值就是getter的返回值 getter.a
    return getter;
  };
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
  var exports = {};
  (() => {
    //只要打包前的模块是一个es module,那么就会调用require.r方法进行处理
    require.r(exports);
    var _title_0__ = require("./src/title.js");
    var _title_0___default = require.n(_title_0__);
    console.log((_title_0___default()));
    console.log(_title_0__.age);
  })();
})();

```

5.异步加载/懒加载实现原理
----------------------

### 5.1 webpack.config.js

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  module: {},
  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
  ],
  devServer: {},
};

```

### 5.2 src\\index.js

src\\index.js

```js
import(/* webpackChunkName: "hello" */ "./hello").then((result) => {
    console.log(result.default);
});

```

### 5.3 hello.js

src\\hello.js

```js
export default 'hello';

```

### 5.4 dist\\main.js

```js
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
  return chunkId + '.main.js'
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
 * 异步加载模块
 */
require.e = function (chunkId) {
  let promises = [];
  require.f.j(chunkId, promises);
  return Promise.all(promises);
}

/**
 * 获取异步加载的文件
 */
var chunkLoadingGlobal = window['webpack'] = [];
chunkLoadingGlobal.push = webpackJsonpCallback;

/**
 * 异步加载/懒加载实现原理：
 * 1.require.e异步加载hello.js的代码块文件hello.main.js，使用require.l进行网络请求
 * 2.promise成功后，执行hello.main.js，通过回调函数window['webpack'].push，通知 webpackJsonpCallback 合并 hello.main.js 里面的代码定义到modules对象上
 * 3.调用require方法加载./src/hello.js模块，获取模块modules的导出对象，获取异步模块 hello.main.js 的结果
 */
require.e('hello')
  .then(require.bind(require, './src/hello.js'))
  .then(result => { console.log(result) });

```

### 5.5 dist\\hello.main.js

```js
(window["webpack"] = window["webpack"] || []).push([["hello"], {
  "./src/hello.js":
    ((module, exports, require) => {
      require.r(exports);
      require.d(exports, {
        "default": () => (_DEFAULT_EXPORT__)
      });
      const _DEFAULT_EXPORT__ = ('hello');
    })
}]);

```