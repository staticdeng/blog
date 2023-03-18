let module1 = require('./module1');
let module2 = require('./module2');
let $ = require('jquery');
console.log(module1, module2, $);
console.log('改变page1');
import( /* webpackChunkName: "asyncModule1" */'./asyncModule1');