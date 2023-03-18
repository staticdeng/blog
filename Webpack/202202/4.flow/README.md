# webpack 工作流

## 核心总结

webpack 编译流程：

1. 把配置文件传给webpack函数，在webpack函数里会实例化new Compiler，在Compiler类里进行编译和触发钩子函数

2. 在webpack函数里继续执行配置文件里所有的plugins，在插件里会监听Compiler类里触发的钩子函数

3. 编译：在Compiler类的 run 方法会执行 compile 方法进行编译；在 compile 方法里实例化 Compilation 类并调用 build 方法编译

4. 在Compilation 类的 build 方法里会根据配置文件的entry找入口文件，使用 buildModule 从入口文件开始编译

5. 从入口文件出发，调用所有配置的Loader对模块进行编译

6. 再找出该模块依赖的模块，再递归 buildModule 编译依赖模块

7. 根据编译后的入口和依赖模块之间的依赖关系，组装成一个个包含多个模块的 Chunk；Chunk 包含 { name,entryModule, modules } 分别为入口文件名、入口模块、依赖模块

8. 把 Chunk 使用 getSource 方法，根据entryModule, modules的关系转换成一个单独的源码加入到输出列表

9. 根据webpack配置文件确定输出的路径和文件名，把输出列表文件内容写入到文件系统

1.调试 webpack
---------------------------------

### 1.1 通过 chrome 调试

```
node --inspect-brk ./node_modules/webpack-cli/bin/cli.js

```

> 然后打开 Chrome 浏览器控制台，点击`DevTools for Node.js`就可以调试了

### 1.2 通过执行命令调试

*   打开工程目录，点击调试按钮，再点击小齿轮的配置按钮系统就会生成 `launch.json` 配置文件
*   修改好了以后直接点击 F5 就可以启动调试

.vscode\\launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "debug webpack",
      "cwd": "${workspaceFolder}",
      "program": "${workspaceFolder}/node_modules/webpack-cli/bin/cli.js"
    }
  ]
}

```

### 1.3 通过 debugger.js 调试

新建debugger.js:

```js
const webpack = require("webpack");
const webpackOptions = require("./webpack.config");
const compiler = webpack(webpackOptions);
//4.执行对象的run方法开始执行编译
compiler.run((err, stats) => {
  console.log(err);
  console.log(
    stats.toJson({
      assets: true,
      chunks: true,
      modules: true,
    })
  );
});

```

运行`node debugger.js`就可以调试了

2\. tapable.js
------------------------------------

*   tapable 是一个类似于 Node.js 中的 EventEmitter 的库，但更专注于自定义事件的触发和处理
*   webpack 通过 tapable 将实现与流程解耦，所有具体实现通过插件的形式存在

tapable的使用:

```js
let { SyncHook } = require('tapable');
/* 
// 自己实现SyncHook
class SyncHook {
    constructor(args) {
        this.args = args;
        this.taps = [];
    }
    tap(name, fn) { // events on
        this.taps.push(fn);
    }
    call(...args) { // events emit
        this.taps.forEach((tap) => tap(...args));
    }
} 
*/

let syncHook = new SyncHook(['name', 'age']);
// tap 监听
syncHook.tap('监听器的名字1', (name, age) => {
    console.log(name, age);
})
syncHook.tap('监听器的名字2', (name, age) => {
    console.log(name, age);
})

// call 触发
syncHook.call('xiaoming', 28);

```

```js
class Plugin {
  apply() {
    hook.tap("Plugin", () => {
      console.log("Plugin ");
    });
  }
}
new Plugin().apply();
hook.call();

```

3\. webpack 编译流程
----------------------------------------

1.  初始化参数：从webpack.config.js配置文件和 Shell 语句中读取并合并参数,得出最终的配置对象
2.  用上一步得到的参数初始化 Compiler 对象
3.  加载所有配置的插件
4.  执行对象的 run 方法开始执行编译
5.  根据配置中的`entry`找出入口文件
6.  从入口文件出发,调用所有配置的`Loader`对模块进行编译
7.  再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
8.  根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
9.  再把每个 Chunk 转换成一个单独的文件加入到输出列表
10.  在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

> 在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果

![webpackflow](https://user-images.githubusercontent.com/20060839/168425989-ee900824-f31c-475a-ab6f-dc12ba3905fc.jpeg)

### 3.1 debugger.js

debugger.js

```js
const webpack = require("./webpack");
const options = require("./webpack.config");
const compiler = webpack(options);
compiler.run((err, stats) => {
  console.log(err);
  console.log(
    JSON.stringify(
      stats.toJson({
        assets: true, //资源
        chunks: true, //代码块
        modules: true, //模块
      }),
      null,
      2
    )
  );
});

```

### 3.2 webpack.config.js

webpack.config.js

```js
const path = require("path");
const RunPlugin = require("./plugins/run-plugin");
const DonePlugin = require("./plugins/done-plugin");
module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    entry1: "./src/entry1.js",
    entry2: "./src/entry2.js",
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, "loaders/logger1-loader.js"),
          path.resolve(__dirname, "loaders/logger2-loader.js"),
        ],
      },
    ],
  },
  plugins: [
    new RunPlugin(), //开始编译的时候触发run事件，RunPlugin会监听这个事件执行回调
    new DonePlugin(), //编译完成的时候会触发done事件，DonePlugin会监听这个done事件的回调
  ],
};

```

### 3.3 webpack.js

webpack.js

```js
let Compiler = require("./Compiler");
function webpack(options) {
  //1.初始化参数：从配置文件和Shell语句中读取并合并参数,得出最终的配置对象
  console.log(process.argv); //['node.exe','debugger.js']
  let argv = process.argv.slice(2);
  let shellOptions = argv.reduce((shellOptions, option) => {
    let [key, value] = option.split("=");
    shellOptions[key.slice(2)] = value;
    return shellOptions;
  }, {});
  let finalOptions = { ...options, ...shellOptions };
  console.log("finalOptions", finalOptions);
  //2.用上一步得到的参数初始化Compiler对象
  let compiler = new Compiler(finalOptions);
  //3.加载所有配置的插件
  let { plugins } = finalOptions;
  for (let plugin of plugins) {
    plugin.apply(compiler);
  }
  return compiler;
}
module.exports = webpack;

```

### 3.4 Compiler.js

Compiler.js

```js
let { SyncHook } = require("tapable");
let fs = require("fs");
let path = require("path");
let Complication = require("./Complication");
/**
 * Compiler就是编译大管家
 * 负责整个编译过程，里面保存整个编译所有的信息
 */
class Compiler {
  constructor(options) {
    this.options = options;
    this.hooks = {
      run: new SyncHook(), //会在开始编译的时候触发
      done: new SyncHook(), //会在结束编译的时候触发
    };
  }
  //4.执行Compiler对象的run方法开始执行编译
  run(callback) {
    this.hooks.run.call();
    //5.根据配置中的entry找出入口文件
    const onCompiled = (err, stats, fileDependencies) => {
      //10在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
      for (let filename in stats.assets) {
        let filePath = path.join(this.options.output.path, filename);
        fs.writeFileSync(filePath, stats.assets[filename], "utf8");
      }
      callback(err, {
        toJson: () => stats,
      });
      fileDependencies.forEach((fileDependency) =>
        fs.watch(fileDependency, () => this.compile(onCompiled))
      );
    };
    this.compile(onCompiled);
    this.hooks.done.call();
  }
  compile(callback) {
    //每次编译都会创建一个新的Compilcation
    let complication = new Complication(this.options);
    complication.build(callback);
  }
}
module.exports = Compiler;

```

### 3.5 Complication.js

Complication.js

```js
let fs = require("fs");
let types = require("babel-types");
let parser = require("@babel/parser");
let traverse = require("@babel/traverse").default;
let generator = require("@babel/generator").default;
const path = require("path");
//根目录就是当前的工作目录
let baseDir = toUnixPath(process.cwd()); // \ => /
function toUnixPath(filePath) {
  return filePath.replace(/\\/g, "/");
}
class Complication {
  constructor(options) {
    this.options = options;
    this.modules = []; //存放着本次编译生产所有的模块 所有的入口产出的模块
    this.chunks = []; //代码块的数组
    this.assets = {}; //产出的资源
    this.fileDependencies = [];
  }
  //这个才是编译最核心的方法
  build(callback) {
    //5.根据配置中的entry找出入口文件
    let entry = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry;
    } else {
      entry = this.options.entry;
    }
    for (let entryName in entry) {
      //找到入口文件的绝对路径
      let entryFilePath = path.posix.join(baseDir, entry[entryName]);
      this.fileDependencies.push(entryFilePath);
      //6.从入口文件出发,调用所有配置的Loader对模块进行编译
      let entryModule = this.buildModule(entryName, entryFilePath);
      //8.根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
      let chunk = {
        name: entryName, //代码块的名字就是入口的名字
        entryModule, //入口模块 entry1.js
        modules: this.modules.filter((item) => item.name.includes(entryName)),
      };
      this.chunks.push(chunk);
    }
    //9.再把每个Chunk转换成一个单独的文件加入到输出列表
    this.chunks.forEach((chunk) => {
      let filename = this.options.output.filename.replace("[name]", chunk.name);
      this.assets[filename] = getSource(chunk);
    });

    callback(
      null,
      {
        chunks: this.chunks,
        modules: this.modules,
        assets: this.assets,
      },
      this.fileDependencies
    );
  }
  //name此模块是属于哪个入口的 modulePath 模块的绝对路径
  buildModule(name, modulePath) {
    //6.从入口文件出发,调用所有配置的Loader对模块进行编译
    //1.读取模块的内容
    let sourceCode = fs.readFileSync(modulePath, "utf8");
    let { rules } = this.options.module;
    let loaders = []; //
    rules.forEach((rule) => {
      let { test } = rule;
      if (modulePath.match(test)) {
        loaders.push(...rule.use);
      }
    }); //loaders=[logger1,logger2]
    sourceCode = loaders.reduceRight((sourceCode, loader) => {
      return require(loader)(sourceCode);
    }, sourceCode);
    //当前模块的模块ID
    let moduleId = "./" + path.posix.relative(baseDir, modulePath);
    let module = { id: moduleId, dependencies: [], name: [name] };
    //7.再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    let ast = parser.parse(sourceCode, { sourceType: "module" });
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === "require") {
          //获取依赖模块的相对路径 wepback打包后不管什么模块，模块ID都是相对于根目录的相对路径 ./src ./node_modules
          let depModuleName = node.arguments[0].value; // ./title
          //获取当前模块的所在的目录
          let dirname = path.posix.dirname(modulePath); //src
          //C:\aproject\zhufengwebpack202108\4.flow\src\title.js
          let depModulePath = path.posix.join(dirname, depModuleName);
          let extensions = this.options.resolve.extensions;
          depModulePath = tryExtensions(depModulePath, extensions);
          this.fileDependencies.push(depModulePath);
          //生成此模块的模块ID
          let depModuleId = "./" + path.posix.relative(baseDir, depModulePath);
          node.arguments = [types.stringLiteral(depModuleId)]; // ./title => ./src/title.js
          //把此模块依赖的模块ID和模块路径放到此模块的依赖数组中
          module.dependencies.push({ depModuleId, depModulePath });
        }
      },
    });
    let { code } = generator(ast); //根据改造后的语法树生成源代码
    module._source = code; //module._source属必指向此模块的改造后的源码
    //7.再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    module.dependencies.forEach(({ depModuleId, depModulePath }) => {
      let existModule = this.modules.find((item) => item.id === depModuleId);
      if (existModule) {
        existModule.name.push(name);
      } else {
        let depModule = this.buildModule(name, depModulePath);
        this.modules.push(depModule);
      }
    });
    return module;
  }
}
function tryExtensions(modulePath, extensions) {
  if (fs.existsSync(modulePath)) {
    return modulePath;
  }
  for (let i = 0; i < extensions.length; i++) {
    let filePath = modulePath + extensions[i];
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(`${modulePath}没找到`);
}

function getSource(chunk) {
  return `
   (() => {
    var modules = {
      ${chunk.modules.map(
        (module) => `
        "${module.id}": (module) => {
          ${module._source}
        },
      `
      )}  
    };
    var cache = {};
    function require(moduleId) {
      var cachedModule = cache[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = (cache[moduleId] = {
        exports: {},
      });
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    var exports ={};
    ${chunk.entryModule._source}
  })();
   `;
}
module.exports = Complication;

```

### 3.6 run-plugin.js

plugins\\run-plugin.js

```js
class RunPlugin {
  //每个插件都是一个类，而每个类都需要定义一个apply方法
  apply(compiler) {
    compiler.hooks.run.tap("RunPlugin", () => {
      console.log("run:开始编译");
    });
  }
}
module.exports = RunPlugin;

```

### 3.7 done-plugin.js

plugins\\done-plugin.js

```js
class DonePlugin {
  //每个插件都是一个类，而每个类都需要定义一个apply方法
  apply(compiler) {
    compiler.hooks.done.tap("DonePlugin", () => {
      console.log("done:结束编译");
    });
  }
}
module.exports = DonePlugin;

```

### 3.9 logger1-loader.js

loaders\\logger1-loader.js

```js
function loader(source) {
  return source + "//logger1"; //let name= 'entry1';//logger2//logger1
}
module.exports = loader;

```

### 3.10 logger2-loader.js

loaders\\logger2-loader.js

```js
function loader(source) {
  //let name= 'entry1';
  return source + "//logger2"; //let name= 'entry1';//logger2
}
module.exports = loader;

```

### 3.11 src\\entry1.js

src\\entry1.js

```js
let title = require("./title");
console.log("entry12", title);

```

### 3.12 src\\entry2.js

src\\entry2.js

```js
let title = require("./title.js");
console.log("entry2", title);

```

### 3.13 src\\title.js

src\\title.js

```js
module.exports = "title";

```

4.Stats 对象
------------------------------

*   在 Webpack 的回调函数中会得到 stats 对象
*   这个对象实际来自于`Compilation.getStats()`，返回的是主要含有`modules`、`chunks`和`assets`三个属性值的对象。
*   Stats 对象本质上来自于[lib/Stats.js](https://github.com/webpack/webpack/blob/v4.39.3/lib/Stats.js)的类实例

| 字段 | 含义 |
| --- | --- |
| modules | 记录了所有解析后的模块 |
| chunks | 记录了所有 chunk |
| assets | 记录了所有要生成的文件 |

```
npx webpack --profile --json > stats.json

```
```json
{
  "hash": "780231fa9b9ce4460c8a", //编译使用的 hash
  "version": "5.8.0", // 用来编译的 webpack 的版本
  "time": 83, // 编译耗时 (ms)
  "builtAt": 1606538839612, //编译的时间
  "publicPath": "auto", //资源访问路径
  "outputPath": "C:\\webpack5\\dist", //输出目录
  "assetsByChunkName": {
    //代码块和文件名的映射
    "main": ["main.js"]
  },
  "assets": [
    //资源数组
    {
      "type": "asset", //资源类型
      "name": "main.js", //文件名称
      "size": 2418, //文件大小
      "chunkNames": [
        //对应的代码块名称
        "main"
      ],
      "chunkIdHints": [],
      "auxiliaryChunkNames": [],
      "auxiliaryChunkIdHints": [],
      "emitted": false,
      "comparedForEmit": true,
      "cached": false,
      "info": {
        "javascriptModule": false,
        "size": 2418
      },
      "related": {},
      "chunks": ["main"],
      "auxiliaryChunks": [],
      "isOverSizeLimit": false
    }
  ],
  "chunks": [
    //代码块数组
    {
      "rendered": true,
      "initial": true,
      "entry": true,
      "recorded": false,
      "size": 80,
      "sizes": {
        "javascript": 80
      },
      "names": ["main"],
      "idHints": [],
      "runtime": ["main"],
      "files": ["main.js"],
      "auxiliaryFiles": [],
      "hash": "d25ad7a8144077f69783",
      "childrenByOrder": {},
      "id": "main",
      "siblings": [],
      "parents": [],
      "children": [],
      "modules": [
        {
          "type": "module",
          "moduleType": "javascript/auto",
          "identifier": "C:\\webpack5\\src\\index.js",
          "name": "./src/index.js",
          "nameForCondition": "C:\\webpack5\\src\\index.js",
          "index": 0,
          "preOrderIndex": 0,
          "index2": 1,
          "postOrderIndex": 1,
          "size": 55,
          "sizes": {
            "javascript": 55
          },
          "cacheable": true,
          "built": true,
          "codeGenerated": true,
          "cached": false,
          "optional": false,
          "orphan": false,
          "dependent": false,
          "issuer": null,
          "issuerName": null,
          "issuerPath": null,
          "failed": false,
          "errors": 0,
          "warnings": 0,
          "profile": {
            "total": 38,
            "resolving": 26,
            "restoring": 0,
            "building": 12,
            "integration": 0,
            "storing": 0,
            "additionalResolving": 0,
            "additionalIntegration": 0,
            "factory": 26,
            "dependencies": 0
          },
          "id": "./src/index.js",
          "issuerId": null,
          "chunks": ["main"],
          "assets": [],
          "reasons": [
            {
              "moduleIdentifier": null,
              "module": null,
              "moduleName": null,
              "resolvedModuleIdentifier": null,
              "resolvedModule": null,
              "type": "entry",
              "active": true,
              "explanation": "",
              "userRequest": "./src/index.js",
              "loc": "main",
              "moduleId": null,
              "resolvedModuleId": null
            }
          ],
          "usedExports": null,
          "providedExports": null,
          "optimizationBailout": [],
          "depth": 0
        },
        {
          "type": "module",
          "moduleType": "javascript/auto",
          "identifier": "C:\\webpack5\\src\\title.js",
          "name": "./src/title.js",
          "nameForCondition": "C:\\webpack5\\src\\title.js",
          "index": 1,
          "preOrderIndex": 1,
          "index2": 0,
          "postOrderIndex": 0,
          "size": 25,
          "sizes": {
            "javascript": 25
          },
          "cacheable": true,
          "built": true,
          "codeGenerated": true,
          "cached": false,
          "optional": false,
          "orphan": false,
          "dependent": true,
          "issuer": "C:\\webpack5\\src\\index.js",
          "issuerName": "./src/index.js",
          "issuerPath": [
            {
              "identifier": "C:\\webpack5\\src\\index.js",
              "name": "./src/index.js",
              "profile": {
                "total": 38,
                "resolving": 26,
                "restoring": 0,
                "building": 12,
                "integration": 0,
                "storing": 0,
                "additionalResolving": 0,
                "additionalIntegration": 0,
                "factory": 26,
                "dependencies": 0
              },
              "id": "./src/index.js"
            }
          ],
          "failed": false,
          "errors": 0,
          "warnings": 0,
          "profile": {
            "total": 0,
            "resolving": 0,
            "restoring": 0,
            "building": 0,
            "integration": 0,
            "storing": 0,
            "additionalResolving": 0,
            "additionalIntegration": 0,
            "factory": 0,
            "dependencies": 0
          },
          "id": "./src/title.js",
          "issuerId": "./src/index.js",
          "chunks": ["main"],
          "assets": [],
          "reasons": [
            {
              "moduleIdentifier": "C:\\webpack5\\src\\index.js",
              "module": "./src/index.js",
              "moduleName": "./src/index.js",
              "resolvedModuleIdentifier": "C:\\webpack5\\src\\index.js",
              "resolvedModule": "./src/index.js",
              "type": "cjs require",
              "active": true,
              "explanation": "",
              "userRequest": "./title.js",
              "loc": "1:12-33",
              "moduleId": "./src/index.js",
              "resolvedModuleId": "./src/index.js"
            },
            {
              "moduleIdentifier": "C:\\webpack5\\src\\title.js",
              "module": "./src/title.js",
              "moduleName": "./src/title.js",
              "resolvedModuleIdentifier": "C:\\webpack5\\src\\title.js",
              "resolvedModule": "./src/title.js",
              "type": "cjs self exports reference",
              "active": true,
              "explanation": "",
              "userRequest": null,
              "loc": "1:0-14",
              "moduleId": "./src/title.js",
              "resolvedModuleId": "./src/title.js"
            }
          ],
          "usedExports": null,
          "providedExports": null,
          "optimizationBailout": [
            "CommonJS bailout: module.exports is used directly at 1:0-14"
          ],
          "depth": 1
        }
      ],
      "origins": [
        {
          "module": "",
          "moduleIdentifier": "",
          "moduleName": "",
          "loc": "main",
          "request": "./src/index.js"
        }
      ]
    }
  ],
  "modules": [
    //模块数组
    {
      "type": "module",
      "moduleType": "javascript/auto",
      "identifier": "C:\\webpack5\\src\\index.js",
      "name": "./src/index.js",
      "nameForCondition": "C:\\webpack5\\src\\index.js",
      "index": 0,
      "preOrderIndex": 0,
      "index2": 1,
      "postOrderIndex": 1,
      "size": 55,
      "sizes": {
        "javascript": 55
      },
      "cacheable": true,
      "built": true,
      "codeGenerated": true,
      "cached": false,
      "optional": false,
      "orphan": false,
      "issuer": null,
      "issuerName": null,
      "issuerPath": null,
      "failed": false,
      "errors": 0,
      "warnings": 0,
      "profile": {
        "total": 38,
        "resolving": 26,
        "restoring": 0,
        "building": 12,
        "integration": 0,
        "storing": 0,
        "additionalResolving": 0,
        "additionalIntegration": 0,
        "factory": 26,
        "dependencies": 0
      },
      "id": "./src/index.js",
      "issuerId": null,
      "chunks": ["main"],
      "assets": [],
      "reasons": [
        {
          "moduleIdentifier": null,
          "module": null,
          "moduleName": null,
          "resolvedModuleIdentifier": null,
          "resolvedModule": null,
          "type": "entry",
          "active": true,
          "explanation": "",
          "userRequest": "./src/index.js",
          "loc": "main",
          "moduleId": null,
          "resolvedModuleId": null
        }
      ],
      "usedExports": null,
      "providedExports": null,
      "optimizationBailout": [],
      "depth": 0
    },
    {
      "type": "module",
      "moduleType": "javascript/auto",
      "identifier": "C:\\webpack5\\src\\title.js",
      "name": "./src/title.js",
      "nameForCondition": "C:\\webpack5\\src\\title.js",
      "index": 1,
      "preOrderIndex": 1,
      "index2": 0,
      "postOrderIndex": 0,
      "size": 25,
      "sizes": {
        "javascript": 25
      },
      "cacheable": true,
      "built": true,
      "codeGenerated": true,
      "cached": false,
      "optional": false,
      "orphan": false,
      "issuer": "C:\\webpack5\\src\\index.js",
      "issuerName": "./src/index.js",
      "issuerPath": [
        {
          "identifier": "C:\\webpack5\\src\\index.js",
          "name": "./src/index.js",
          "profile": {
            "total": 38,
            "resolving": 26,
            "restoring": 0,
            "building": 12,
            "integration": 0,
            "storing": 0,
            "additionalResolving": 0,
            "additionalIntegration": 0,
            "factory": 26,
            "dependencies": 0
          },
          "id": "./src/index.js"
        }
      ],
      "failed": false,
      "errors": 0,
      "warnings": 0,
      "profile": {
        "total": 0,
        "resolving": 0,
        "restoring": 0,
        "building": 0,
        "integration": 0,
        "storing": 0,
        "additionalResolving": 0,
        "additionalIntegration": 0,
        "factory": 0,
        "dependencies": 0
      },
      "id": "./src/title.js",
      "issuerId": "./src/index.js",
      "chunks": ["main"],
      "assets": [],
      "reasons": [
        {
          "moduleIdentifier": "C:\\webpack5\\src\\index.js",
          "module": "./src/index.js",
          "moduleName": "./src/index.js",
          "resolvedModuleIdentifier": "C:\\webpack5\\src\\index.js",
          "resolvedModule": "./src/index.js",
          "type": "cjs require",
          "active": true,
          "explanation": "",
          "userRequest": "./title.js",
          "loc": "1:12-33",
          "moduleId": "./src/index.js",
          "resolvedModuleId": "./src/index.js"
        },
        {
          "moduleIdentifier": "C:\\webpack5\\src\\title.js",
          "module": "./src/title.js",
          "moduleName": "./src/title.js",
          "resolvedModuleIdentifier": "C:\\webpack5\\src\\title.js",
          "resolvedModule": "./src/title.js",
          "type": "cjs self exports reference",
          "active": true,
          "explanation": "",
          "userRequest": null,
          "loc": "1:0-14",
          "moduleId": "./src/title.js",
          "resolvedModuleId": "./src/title.js"
        }
      ],
      "usedExports": null,
      "providedExports": null,
      "optimizationBailout": [
        "CommonJS bailout: module.exports is used directly at 1:0-14"
      ],
      "depth": 1
    }
  ],
  "entrypoints": {
    //入口点
    "main": {
      "name": "main",
      "chunks": ["main"],
      "assets": [
        {
          "name": "main.js",
          "size": 2418
        }
      ],
      "filteredAssets": 0,
      "assetsSize": 2418,
      "auxiliaryAssets": [],
      "filteredAuxiliaryAssets": 0,
      "auxiliaryAssetsSize": 0,
      "children": {},
      "childAssets": {},
      "isOverSizeLimit": false
    }
  },
  "namedChunkGroups": {
    //命名代码块组
    "main": {
      "name": "main",
      "chunks": ["main"],
      "assets": [
        {
          "name": "main.js",
          "size": 2418
        }
      ],
      "filteredAssets": 0,
      "assetsSize": 2418,
      "auxiliaryAssets": [],
      "filteredAuxiliaryAssets": 0,
      "auxiliaryAssetsSize": 0,
      "children": {},
      "childAssets": {},
      "isOverSizeLimit": false
    }
  },
  "errors": [],
  "errorsCount": 0,
  "warnings": [],
  "warningsCount": 0,
  "children": []
}

```