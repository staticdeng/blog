/**
 * 手写转换箭头函数的babel插件
 */

// @babel/core：babel核心包，用来实现语法树生成、遍历、修改和生成源代码
const core = require('@babel/core');
// @babel/types：用来生成某些AST节点或者判断某个节点是不是需要个类型的
const types = require('@babel/types');

const sourceCode = `const sum = (a,b)=>{
  return a+b;
}`;

// const sourceCode = `const sum = (a,b)=> a+b;`;

/**
 * 手写转换箭头函数的babel插件
    • babel插件有一个访问器对象visitor
    • 如果是箭头函数类型，就会进入ArrowFunctionExpression方法，参数为节点路径对象
    • 将节点type由ArrowFunctionExpression转为FunctionExpression
 */
const transformEs2015ArrowFunctions = {
  visitor: {
    // 如果是箭头函数类型，就会进入ArrowFunctionExpression方法，参数为节点路径对象
    ArrowFunctionExpression(path) {
      let { node } = path;

      // 将节点type由ArrowFunctionExpression转为FunctionExpression
      node.type = 'FunctionExpression';

      let body = node.body;
      // 如果函数体不是语句块{}包裹，加上{}
      if (!types.isBlockStatement(body)) {
        node.body = types.blockStatement([types.returnStatement(body)]);
      }
    }
  }
}

/**
 * 在转换的时候，每一个语法都会对应一个插件
 * 每个插件只有一个功能，转换一种写法
 */
const targetCode = core.transform(sourceCode, {
  // plugins: ['transform-es2015-arrow-functions']
  plugins: [transformEs2015ArrowFunctions]
});
console.log(targetCode.code);