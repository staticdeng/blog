 (() => {
   var modules = ({
     "lodash": ((module) => {
       "use strict";
       module.exports = _;
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
     let _ = require("lodash");
     console.log(_);
   })();
 })();