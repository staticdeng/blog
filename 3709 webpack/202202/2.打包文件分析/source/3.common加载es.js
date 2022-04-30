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
})()
  ;