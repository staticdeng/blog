const path = require('path');
const types = require('@babel/types');
const visitor = {
  CallExpression(nodePath, state) {
    const { node } = nodePath;
    if (types.isMemberExpression(node.callee)) {
      if (node.callee.object.name === 'console') {
        if (['log', 'debug', 'info', 'warn', 'error'].includes(node.callee.property.name)) {
          const { line, column } = node.loc.start;
          const fileName = path.relative(path.resolve('.'), state.file.opts.filename).replace(/\\/g, '/');
          node.arguments.unshift(types.stringLiteral(`${fileName} ${line}:${column}`));
        }
      }
    }
  }
}


module.exports = function () {
  return {
    visitor
  }
}