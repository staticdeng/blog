# AST 和 babel 插件

## 核心总结

1. babel(@babel/core)的工作过程：

* 包括三部分：
  * 1. 把源代码转成ast语法树
  * 2. 遍历ast语法树，遍历时将语法树给插件进行处理；插件会根据某个特定es6语法进行处理，转换成新的语法树
  * 3. 新的ast语法树重新生成新的源代码

用代码简单概括为：

```js
const core = require('@babel/core');
// targetSource 为生成的新的源代码
let targetSource = core.transform(sourceCode, {
  plugins: [transformClassPlugin]
});
```

2. babel插件的原理

由babel的工作过程的第2步可以知道，babel插件的原理就是对ast语法树进行转换。

1.抽象语法树(Abstract Syntax Tree)
-------------------------------------------------------------------

* 抽象语法树（Abstract Syntax Tree，AST）是源代码语法结构的一种抽象表示
* 它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构

2.抽象语法树用途
---------------------------

* 代码语法检查、风格检查：

  * 比如JSlint对代码错误或者风格检查

* 代码混淆压缩：

  * UglifyJS2 等

* 优化变更代码，改变代码结构使达到想要的结构

  * 代码打包工具webpack、rollup等
  * CommonJs/AMD/CMD/UMD 代码规范之间的转化

3.抽象语法树定义
---------------------------

*   这些工具的原理都是通过`JavaScript Parser`把代码转化为一颗抽象语法树（AST），这颗树定义了代码的结构，通过操纵这颗树，我们可以精准的定位到声明语句、赋值语句、运算语句等等，实现对代码的分析、优化、变更等操作

![ast](http://img.zhufengpeixun.cn/ast.jpg)

4\. JavaScript Parser
--------------------------------------------------

`JavaScript Parser`是把JavaScript源码转化为抽象语法树的解析器

### 4.1 常用的 JavaScript Parser

* babel parser

* esprima

### 4.2 AST节点

*   [astexplorer](https://astexplorer.net/)
 
https://astexplorer.net/ 这个网站可以将 js 源码 转换为 ast 语法树。

*   ast 语法树的节点类型（type）有：

    *   File 文件
    *   Program 程序
    *   Literal 字面量
    *   Identifier 标识符
    *   Statement 语句
    *   Declaration 声明语句
    *   Expression 表达式
    *   Class 类

### 4.3 AST遍历

*   [astexplorer](https://astexplorer.net/)
*   AST是深度优先遍历

```
npm i esprima estraverse escodegen -S

```
esprima的使用：

```js
let esprima = require('esprima');// 把JS源代码转成AST语法树
let estraverse = require('estraverse');// 遍历语法树,修改树上的节点
let escodegen = require('escodegen');// 把AST语法树重新转换成代码
let code = `function ast(){}`;
let ast = esprima.parse(code);
let indent = 0;
const padding = () => " ".repeat(indent);

estraverse.traverse(ast, {
  enter(node) {
    console.log(padding() + node.type + '进入');
    if (node.type === 'FunctionDeclaration') {
      node.id.name = 'newAst';
    }
    indent += 2;
  },
  leave(node) {
    indent -= 2;
    console.log(padding() + node.type + '离开');
  }
});

```

5.babel
-----------------------

*   Babel 能够转译 `ECMAScript 2015+` 的代码，使它在旧的浏览器或者环境中也能够运行

*   工作过程分为三个部分

    * Parse(解析)：将源代码转换成 ast 抽象语法树，树上有很多的[estree节点](https://github.com/estree/estree)
    * Transform(转换)：对抽象语法树进行转换
    * Generate(代码生成)：将上一步经过转换过的新的抽象语法树生成新的代码

![ast-compiler-flow.jpg](https://img.zhufengpeixun.com/ast-compiler-flow.jpg)

### 5.1 babel 插件

*   [@babel/parser](https://github.com/babel/babel/tree/master/packages/@babel/parser) 可以把源码转换成AST
*   [@babel/traverse](https://www.npmjs.com/package/babel-traverse)用于对 AST 的遍历，维护了整棵树的状态，并且负责替换、移除和添加节点
*   [@babel/generate](https://github.com/babel/babel/tree/master/packages/@babel/generate) 可以把AST生成源码，同时生成sourcemap
*   [@babel/types](https://github.com/babel/babel/tree/master/packages/babel-types) 用于 AST 节点的 Lodash 式工具库, 它包含了构造、验证以及变换 AST 节点的方法，对编写处理 AST 逻辑非常有用
*   [@babel/template](https://www.npmjs.com/package/@babel/template)可以简化AST的创建逻辑
*   [@babel/code-frame](https://www.npmjs.com/package/@babel/code-frame)可以打印代码位置
*   [@babel/core](https://www.npmjs.com/package/@babel/core) Babel 的编译器，核心 API 都在这里面，比如常见的 transform、parse,并实现了插件功能
*   [babylon](https://www.npmjs.com/package/babylon) Babel 的解析器，以前叫babel parser,是基于acorn扩展而来，扩展了很多语法,可以支持es2020、jsx、typescript等语法
*   [babel-types-api](https://babeljs.io/docs/en/next/babel-types.html)
*   [Babel 插件手册](https://github.com/brigand/babel-plugin-handbook/blob/master/translations/zh-Hans/README.md#asts)
*   [babeljs.io](https://babeljs.io/en/repl.html) babel 可视化编译器
*   [babel-types](https://babeljs.io/docs/en/babel-types)
*   [类型别名](https://github.com/babel/babel/blob/main/packages/babel-types/src/ast-types/generated/index.ts#L2489-L2535)
*   [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types)

### 5.2 Visitor

*   访问者模式 Visitor 对于某个对象或者一组对象，不同的访问者，产生的结果不同，执行操作也不同
*   Visitor 的对象定义了用于 AST 中获取具体节点的方法
*   Visitor 上挂载以节点 `type` 命名的方法，当遍历 AST 的时候，如果匹配上 type，就会执行对应的方法

#### 5.2.1 path 节点路径对象

*   [path](https://github.com/babel/babel/blob/main/packages/babel-traverse/src/path/index.ts)
*   node 当前 AST 节点
*   parent 父 AST 节点
*   parentPath 父AST节点的路径
*   scope 作用域
*   get(key) 获取某个属性的 path
*   set(key, node) 设置某个属性
*   is类型(opts) 判断当前节点是否是某个类型
*   find(callback) 从当前节点一直向上找到根节点(包括自己)
*   findParent(callback)从当前节点一直向上找到根节点(不包括自己)
*   insertBefore(nodes) 在之前插入节点
*   insertAfter(nodes) 在之后插入节点
*   replaceWith(replacement) 用某个节点替换当前节点
*   replaceWithMultiple(nodes) 用多个节点替换当前节点
*   replaceWithSourceString(replacement) 把源代码转成AST节点再替换当前节点
*   remove() 删除当前节点
*   traverse(visitor, state) 遍历当前节点的子节点,第1个参数是节点，第2个参数是用来传递数据的状态
*   skip() 跳过当前节点子节点的遍历
*   stop() 结束所有的遍历

#### 5.2.2 scope

*   [scope](https://github.com/babel/babel/blob/main/packages/babel-traverse/src/scope/index.ts)
*   scope.bindings 当前作用域内声明所有变量
*   scope.path 生成作用域的节点对应的路径
*   scope.references 所有的变量引用的路径
*   getAllBindings() 获取从当前作用域一直到根作用域的集合
*   getBinding(name) 从当前作用域到根使用域查找变量
*   getOwnBinding(name) 在当前作用域查找变量
*   parentHasBinding(name, noGlobals) 从当前父作用域到根使用域查找变量
*   removeBinding(name) 删除变量
*   hasBinding(name, noGlobals) 判断是否包含变量
*   moveBindingTo(name, scope) 把当前作用域的变量移动到其它作用域中
*   generateUid(name) 生成作用域中的唯一变量名,如果变量名被占用就在前面加下划线

### 5.3 转换箭头函数

* 使用 [babel-plugin-transform-es2015-arrow-functions](https://www.npmjs.com/package/babel-plugin-transform-es2015-arrow-functions) 插件转换箭头函数

* 手写babel插件转换箭头函数

转换前

```js
const sum = (a,b)=>{
  return a+b;
};
```

转换后

```js
const sum = function (a, b) {
  return a + b;
};
```

使用 babel-plugin-transform-es2015-arrow-functions 这个babel插件转换：

```bash
npm i babel-plugin-transform-es2015-arrow-functions -D
```

```js
// @babel/core：babel核心包，用来实现语法树生成、遍历、修改和生成源代码
const core = require('@babel/core');

const sourceCode = `const sum = (a,b)=>{
  console.log(this);
  return a+b;
}`;

const targetCode = core.transform(sourceCode, {
  plugins: ['transform-es2015-arrow-functions']
});
console.log(targetCode.code);
```


手写babel插件转换箭头函数：

```bash
npm i @babel/core @babel/types -D

```

在转换源代码为ast语法树网站 https://astexplorer.net/ 里，将上面转换前和转换后的代码分别生成ast语法树；通过对比语法树发现，需要将节点type由ArrowFunctionExpression转为FunctionExpression：

```js
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
      // 如果函数体不是语句块包裹，加上{}
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
```

### 5.4 把类编译为 Function

*   [@babel/plugin-transform-classes](https://www.npmjs.com/package/@babel/plugin-transform-classes)

转化前es6：

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}

```

在 https://astexplorer.net/ 生成的ast语法树为：

<img src="https://user-images.githubusercontent.com/20060839/167653026-14b778b3-6b6b-42e0-8e2f-caeb613095d1.png" width="70%">


转换后es5：

```js
function Person(name) {
  this.name = name;
}
Person.prototype.getName = function () {
  return this.name;
};

```

转换后ast语法树为：

<img src="https://user-images.githubusercontent.com/20060839/167659338-a683b729-f687-4b61-8d70-74214c9ad58e.png" width="70%">

根据转换前后的ast语法树，实现把类编译为 Function的babel插件如下：

构造下面ast新节点的文档为：[babel-types-api](https://babeljs.io/docs/en/next/babel-types.html)

```js
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

      //原来此路径上放的是一个类的节点，现在替换成了多个节点
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
```

6\. webpack中使用babel插件
---------------------------------------------------

### 6.1 实现按需加载的babel插件

下面两个babel插件都可以实现lodash按需加载：

* [babel-plugin-lodash](https://www.npmjs.com/package/babel-plugin-lodash)

* [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import)

转换前

```js
import { flatten, concat } from "lodash";
```

转换后

```js
import flatten from "lodash/flatten";
import concat from "lodash/flatten";
```
转换前的ast语法树为：

<img src="https://user-images.githubusercontent.com/23166885/167809351-7dd74a44-a96a-4b13-9ced-a999ff250519.png" width="70%">

转换后的ast语法树为：

<img src="https://user-images.githubusercontent.com/23166885/167809605-c4fd0bfa-7580-4c94-acf3-20ecc9888a4a.png" width="70%">

#### 6.1.1 webpack 配置

```bash
npm i webpack webpack-cli babel-plugin-import -D
```
首先配置webpack，在babel-loader的plugins处使用按需加载的babel-plugin-import： 

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options:{
            plugins:[
              [
                // 使用babel-plugin-import插件
                // ['import', { libraryName: 'lodash', libraryDirectory: ''}],

                // 实现babel-plugin-import类似按需导入lodash的功能
                [
                  path.resolve(__dirname, 'plugins/babel-plugin-import.js'),
                  {
                    // 指定按需加载的模块
                    libraryName: 'lodash',
                    // 按需加载的目录
                    libraryDirectory: ''
                  }
                ]
              ]
            ]
          }
        },
      },
    ],
  },
};

```

> 编译顺序为首先`plugins`从左往右,然后`presets`从右往左

#### 6.1.2 手写按需加载lodash的 babel 插件

plugins\\babel-plugin-import.js

```js
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
```

7\. 参考
---------------------

*   [Babel 插件手册](https://github.com/brigand/babel-plugin-handbook/blob/master/translations/zh-Hans/README.md#asts)
*   [babel-types](https://github.com/babel/babel/tree/master/packages/babel-types)
*   [不同的 parser 解析 js 代码后得到的 AST](https://astexplorer.net/)
*   [在线可视化的看到 AST](http://resources.jointjs.com/demos/javascript-ast)
*   [babel 从入门到入门的知识归纳](https://zhuanlan.zhihu.com/p/28143410)
*   [Babel 内部原理分析](https://octman.com/blog/2016-08-27-babel-notes/)
*   [babel-plugin-react-scope-binding](https://github.com/chikara-chan/babel-plugin-react-scope-binding)
*   [transform-runtime](https://www.npmjs.com/package/babel-plugin-transform-runtime) Babel 默认只转换新的 JavaScript 语法，而不转换新的 API。例如，Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法（比如 Object.assign）都不会转译,启用插件 `babel-plugin-transform-runtime` 后，Babel 就会使用 babel-runtime 下的工具函数
*   [ast-spec](https://github.com/babel/babylon/blob/master/ast/spec.md)
*   [babel-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/README.md)