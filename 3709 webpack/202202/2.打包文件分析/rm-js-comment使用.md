使用插件rm-js-comment，简化webpack的打包文件内容，去掉注释和简化变量名

安装rm-js-comment后，在打包文件里右键format就可以去掉注释了：

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