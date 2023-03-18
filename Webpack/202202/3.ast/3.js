/**
 * 把类编译为 Function 的babel插件
 */
const core = require('@babel/core');
const types = require('@babel/types');

let transformClassPlugin = {
  visitor: {
    // 根据转换前的ast语法树，捕获ClassDeclaration
    ClassDeclaration(nodePath) {
      const { node } = nodePath;
      const id = node.id; // Person类
      const classMethods = node.body.body; // Person类里面有两个方法：constructor和getName方法
      let nodes = [];
      classMethods.forEach(method => {
        if (method.kind === 'constructor') {
          // 为构造函数，则使用 types.functionDeclaration 转换为函数
          const constructorFunction = types.functionDeclaration(id, method.params, method.body, method.generator, method.async);
          nodes.push(constructorFunction);
        } else {
          // 为普通方法

          // 左边转为成员表达式 types.memberExpression
          const left = types.memberExpression(types.memberExpression(id, types.identifier('prototype')), method.key); // Person.prototype.getName=
          // 右边转为函数声明 types.functionExpression
          const right = types.functionExpression(null, method.params, method.body, method.generator, method.async);
          
          // 为普通方法，则使用 types.assignmentExpression 转换为赋值表达式
          const assignmentExpression = types.assignmentExpression('=', left, right);
          nodes.push(assignmentExpression);
        }
      });

      // 原来此路径上放的是一个类的节点，现在替换成了多个节点
      nodePath.replaceWithMultiple(nodes);
    }
  }
}

const sourceCode = `
class Person{
    constructor(name){
        this.name = name;
    }
    getName(){
        return this.name;
    }
}
`;
let targetSource = core.transform(sourceCode, {
  plugins: [transformClassPlugin]
});
console.log(targetSource.code);

/* function Person(name) {
    this.name = name;
}
Person.prototype.getName = function () {
    return this.name;
} */