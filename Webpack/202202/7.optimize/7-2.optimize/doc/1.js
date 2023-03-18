
const path = require('path');
var findNodeModules = require('find-node-modules');
let node_modules = findNodeModules();
console.log(node_modules);

//const bootstrap = path.resolve(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.css');
//c:\aproject\zhufengwebpack202111\9.optimize\node_modules\bootstrap\dist\js\bootstrap.js
//console.log(require.resolve('bootstrap'));
//向上查找node_modules
