
const path = require('path').posix;
const baseDir = process.cwd().replace(/\\/g, '/');
console.log('baseDir', baseDir);
console.log('__filename', __filename.replace(/\\/g, '/'));
let moduleId = path.relative(baseDir, __filename.replace(/\\/g, '/'));
console.log(moduleId);