/**
 * 按需加载lodash的babel插件
 */
const types = require('@babel/types');

const visitor = {
  /**
   * 当babel遍历语法树的时候，当遍历到ImportDeclaration节点的时候会执行此函数
   * @param {*} nodePath 
   * @param {*} state 
   */
  ImportDeclaration(nodePath, state) {
    // 获取对应的node节点
    const { node } = nodePath;
    // 获取导入的标识符
    const { specifiers } = node;
    // 获取在webpack配置文件中配置的参数
    const { libraryName, libraryDirectory = 'lib' } = state.opts;

    // 如果导入的库等于配置的库的名字，并且当前导入不是默认导入
    if (node.source.value === libraryName && !types.isImportDefaultSpecifier(specifiers[0])) {
      const declarations = specifiers.map(specifier => {
        const source = [libraryName, libraryDirectory, specifier.imported.name].filter(Boolean).join('/'); // => lodash/flatten

        // 创建一个新的importDeclaration类型的节点
        return types.importDeclaration(
          [types.importDefaultSpecifier(specifier.local)],
          types.stringLiteral(source)
        );
      });

      // 新的ast语法树替换老ast语法树
      nodePath.replaceWithMultiple(declarations)
    }
  }
}


module.exports = function () {
  return {
    visitor
  }
}