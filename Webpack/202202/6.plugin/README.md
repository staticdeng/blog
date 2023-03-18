# webpack 插件

1\. plugin
----------------------------

插件向第三方开发者提供了 webpack 引擎中完整的能力。使用阶段式的构建回调，开发者可以引入它们自己的行为到 webpack 构建流程中。创建插件比创建 loader 更加高级，因为你将需要理解一些 webpack 底层的内部特性来做相应的钩子

### 1.1 为什么需要一个插件

*   webpack 基础配置无法满足需求
*   插件几乎能够任意更改 webpack 编译结果
*   webpack 内部也是通过大量内部插件实现的

### 1.2 可以加载插件的常用对象

| 对象 | 钩子函数 |
| --- | --- |
| [Compiler(编译器)](https://github.com/webpack/webpack/blob/v4.39.3/lib/Compiler.js) | run(运行钩子), compile(编译钩子), compilation(开始一次新的编译钩子), make(构建钩子), emit(写入文件钩子), done(编译完成钩子) |
| [Compilation(每次构建的编译)](https://github.com/webpack/webpack/blob/v4.39.3/lib/Compilation.js) | buildModule(构建模块钩子), normalModuleLoader(加载普通模块钩子), succeedModule(构建成功一个模块钩子), finishModules(所有模块构建完成钩子), seal(封装), optimize(优化), after-seal(封装完毕) |
| [Module Factory(模块工厂)](https://github.com/webpack/webpack/blob/master/lib/ModuleFactory.js) | beforeResolver(模块路径解析器构建前), afterResolver(模块路径解析器构建后), module(构建模块), parser(解析) |
| Module |  |
| [Parser(语法树解析)](https://github.com/webpack/webpack/blob/master/lib/Parser.js) | program, statement(语句), call(call方法), expression(表达式) |
| [Template](https://github.com/webpack/webpack/blob/master/lib/Template.js) | hash(创建hash), bootstrap(启动文件), localVars(本地变量), render(渲染) |

2\. 创建插件
------------------------

*   插件是一个类，类上有一个apply的实例方法
*   apply的参数是compiler

```js
class DonePlugin {
  constructor(options) {
      this.options = options;
  }
  apply(compiler) {

  }
}
module.exports = DonePlugin;

```

3\. Compiler 和 Compilation
------------------------------------------------------------

在插件开发中最重要的两个资源就是`compiler`和`compilation`对象。理解它们的角色是扩展 webpack 引擎重要的第一步。

*   compiler 对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。
    
*   compilation 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。
    

4\. 基本插件架构
----------------------------

*   插件是由「具有 apply 方法的 prototype 对象」所实例化出来的
*   这个 apply 方法在安装插件时，会被 webpack compiler 调用一次
*   apply 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象

### 4.1 webpack使用插件的源码

*   [webpack使用插件的源码](https://github.com/webpack/webpack/blob/master/lib/webpack.js#L60-L69)

webpack 源码中将 webpack.config.js 配置中的plugins遍历并执行 apply 方法，传入 compiler 对象：

```js
if (options.plugins && Array.isArray(options.plugins)) {
  for (const plugin of options.plugins) {
    plugin.apply(compiler);
  }
}

```

### 4.2 Compiler 类型插件

*   [done钩子函数源码](https://github.com/webpack/webpack/blob/master/lib/Compiler.js#L105)

在 webpack 源码文件 compiler.js 文件中，done(compiler.hooks.done) 钩子函数使用的是异步串行钩子：

```js
class Compiler {
  constructor() {
    this.hooks = Object.freeze({
      // 异步串行AsyncSeriesHook
      done: new AsyncSeriesHook(\['stats'\]),
      ...
    })
  }
}
```

#### 4.2.1 同步

使用 tap 同步方式：

```js
class DonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tap("DonePlugin", (stats) => {
      console.log("Hello ", this.options.name);
    });
  }
}
module.exports = DonePlugin;

```

#### 4.2.2 异步

因为 compiler.hooks.done 是异步串行钩子，所以既可以用 tap 使用同步，也可以用 tapAsync 使用异步：

```js
class DonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tapAsync("DonePlugin", (stats, callback) => {
      setTimeout(() => {
        console.log("Hello ", this.options.name);
        // 使用异步，多了callback参数，执行callback了webpack继续后面工作
        callback();
      }, 3000);
    });
  }
}
module.exports = DonePlugin;

```

### 4.3 使用插件

*   要安装这个插件，只需要在你的 webpack 配置的 plugin 数组中添加一个实例

```js
const DonePlugin = require("./plugins/DonePlugin");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("build"),
    filename: "bundle.js",
  },
  plugins: [new DonePlugin({ name: "DonePlugin" })],
};

```

5\. compilation 类型插件
---------------------------------------------

*   使用 compiler 对象时，你可以绑定提供了编译 compilation 引用的回调函数，然后拿到<b>每次构建新的 compilation 对象</b>。这些 compilation 对象提供了一些钩子函数，来钩入到构建流程的很多步骤中

### 5.1 assets-plugin.js

编写个Compilation插件，用来打印本次产出的代码块和文件：

plugins\\assets-plugin.js

```js
class AssetPlugin {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		// 每当webpack开启一次新的编译，就会创建一个新的compilation，会触发一个钩子事件
		compiler.hooks.compilation.tap('AssetPlugin', (compilation) => {
			// 每次根据chunk构建文件后会触发一次chunkAsset
			compilation.hooks.chunkAsset.tap('AssetPlugin', (chunk, filename) => {
				console.log(chunk.name, filename);
			});
		});
	}
}
module.exports = AssetPlugin;

```

6\. 打包 zip
-----------------------------

*   [webpack-sources](https://www.npmjs.com/package/webpack-sources)

### 6.1 webpack-archive-plugin.js

plugins\\webpack-archive-plugin.js

```js
const JSZip = require('jszip');
const { RawSource } = require('webpack-sources');
class ArchivePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // emit钩子：准备把编译后的结果输出到文件系统中去
    compiler.hooks.emit.tap('ArchivePlugin', (compilation) => {
      // processAssets: new AsyncSeriesHook(["assets"]) 为异步串行钩子，处理每个资源的时候处执行
      compilation.hooks.processAssets.tapPromise('ArchivePlugin', (assets) => {
        // assets: 本次编译出来的资源文件
        var zip = new JSZip();
        for (let filename in assets) {
          let cacheSource = assets[filename];
          console.log('before', cacheSource.source);

          // 获取此文件对应的源代码
          const source = cacheSource.source();
          console.log('after', source);
          
          // 向压缩包里添加文件，文件名叫filename,文件内容叫source
          zip.file(filename, source);
        }
        return zip.generateAsync({ type: 'nodebuffer' }).then(content => {
          // assets的值必须是一个对象，对象需要有一个source方法，返回源代码
          // assets['archive_' + Date.now() + '.zip'] = {
          // 	source() { return content;}
          // }

          // 等价于上面写法
          assets['archive_' + Date.now() + '.zip'] = new RawSource(content);
        });
      });
    });
  }
}
module.exports = ArchivePlugin;

```

### 6.2 webpack.config.js

webpack.config.js

```js
const WebpackArchivePlugin = require('./plugins/archive-plugin');

  plugins: [
    new WebpackArchivePlugin({
      filename:'[timestamp].zip'
    })
  ]
```

7.自动外链插件
----------------------

### 7.1 使用外部类库

在项目中，想要引入cdn链接或者类库文件的方式使用外部类库，不使用webpack将某个类库打包的话，需要做以下两个工作：

*   webpack手动指定 `external` 配置某个类库不进行打包处理
*   手动指定 `script` 引入类库文件或者cdn链接

在webpack.config.js里面配置external：

```js
module.exports = {
  externals: {
    // key为lodash是要require或import的模块名, 值为_是一个全局变量名window._
    'lodash': '_'
  },
  ...
}

```

在代码中使用lodash：

```js
let _ = require('lodash');
console.log(_);
```

使用webpack打包后，打包文件里面不含lodash，需要在html里面手动引入：

```html
<script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js"></script>
```

### 7.2 思路

使用外部类库需要手动配置 `external` 和 手动引入 `script` 标签，这样有点麻烦，可以写一个webpack插件来实现自动配置 `external` 和 自动引入 `script` 标签.

实现自动外链webpack插件的思路（自动 `external` 和 `script`）：

*   `依赖` 当检测到有`import`该`library`时，将其设置为不打包类似`exteral`,并在指定模版中加入 script,那么如何检测 import？这里就用`Parser`
*   `external依赖` 需要了解 external 是如何实现的，webpack 的 external 是通过插件`ExternalsPlugin`实现的，ExternalsPlugin 通过`tap` `NormalModuleFactory` 在每次创建 Module 的时候判断是否是`ExternalModule`
*   webpack4 加入了模块类型之后，`Parser`获取需要指定类型 moduleType,一般使用`javascript/auto`即可

### 7.3 使用 plugins

设计自动外链webpack插件的使用api：

```js
plugins: [
  new HtmlWebpackPlugin({
    template:'./src/index.html'
  }),
  new AutoExternalPlugin({
    jquery:{ // 自动把jquery模块变成一个外部依赖模块
      variable: 'jQuery', // 不再打包，而是从window.jQuery变量上获取jquery对象
      url: 'https://cdn.bootcss.com/jquery/3.1.0/jquery.js' // CDN脚本
    },
    lodash:{ // 自动把jquery模块变成一个外部依赖模块
      variable:'_', // 不再打包，而是从window._变量上获取lodash对象
      url:'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js' // CDN脚本
    }
  })
];

```

### 7.4 AutoExternalPlugin

*   [ExternalsPlugin.js](https://github.com/webpack/webpack/blob/0d4607c68e04a659fa58499e1332c97d5376368a/lib/ExternalsPlugin.js)
*   [ExternalModuleFactoryPlugin](https://github.com/webpack/webpack/blob/eeafeee32ad5a1469e39ce66df671e3710332608/lib/ExternalModuleFactoryPlugin.js)
*   [ExternalModule.js](https://github.com/webpack/webpack/blob/eeafeee32ad5a1469e39ce66df671e3710332608/lib/ExternalModule.js)
*   [parser](https://github.com/zhufengnodejs/webpack-analysis/blob/master/node_modules/_webpack%404.20.2%40webpack/lib/NormalModuleFactory.js#L87)
*   [factory](https://github.com/zhufengnodejs/webpack-analysis/blob/master/node_modules/_webpack%404.20.2%40webpack/lib/NormalModuleFactory.js#L66)
*   [htmlWebpackPluginAlterAssetTags](https://github.com/jantimon/html-webpack-plugin/blob/v3.2.0/index.js#L62)

先来看看normalModuleFactory.hooks.factorize，是一个异步串行保险钩子AsyncSeriesBailHook，来看看它的使用：

```js
let { AsyncSeriesBailHook } = require("tapable");
let factorize = new AsyncSeriesBailHook(['resolveData']);

// -------------- 多个工厂函数的监听 ------------------

// 自定义回调拦截工厂函数的生产过程，改写callback
factorize.tapAsync('factory1', (resolveData, callback) => {
  if (resolveData === 'jquery') {
    callback(null, {
      id: resolveData,
      type: '外部模块',
      source: 'window.jQuery'
    });
  } else {
    callback(null);
  }
});

// 生成正常模块的工厂函数
factorize.tapAsync('factory2', (resolveData, callback) => {
  callback(null, { id: resolveData, type: '正常模块', source: 'webpack打包后的内容' });
});

// ---------- 多个模块调用会触发工厂函数的监听 -----------

factorize.callAsync('jquery', (err, module) => {
  // 第一个factory1里面捕获了'jquery'，callback返回，就不用走第二个factory2
  console.log(module);
});
factorize.callAsync('lodash', (err, module) => {
  // 第一个factory1里callback(null)，则继续执行第二个factory2
  console.log(module);
});

```

再来看看自动外链插件的实现：

plugins\\auto-external-plugin.js

```js
const { ExternalModule } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
class AutoExternalPlugin {
  constructor(options) {
    this.options = options;
    // 插件配置的外部依赖模块
    this.externalModules = Object.keys(this.options); // ['lodash']
    // 存放实际import/require的外部依赖模块
    this.importedModules = new Set(); // []
  }
  /**
   * 1.收集依赖，将import/require的外部依赖模块，放到importedModules里
   * 2.在打包模块的时候，拦截正常的打包逻辑，变成外部依赖模块
   * 3.把外部依赖模块对应的CDN脚本插入到输出的index.html里面去
   * @param {*} compiler 
   */
  apply(compiler) {
    // 每种模块会对应一个模块工厂 普通模块对应的就是普通模块工厂
    // https://webpack.docschina.org/api/normalmodulefactory-hooks/
    compiler.hooks.normalModuleFactory.tap('AutoExternalPlugin', (normalModuleFactory) => {
      // https://webpack.docschina.org/api/parser/#root
      normalModuleFactory.hooks.parser
        .for('javascript/auto') // 普通的JS文件对应的钩子就是'javascript/auto'
        .tap('AutoExternalPlugin', parser => {
          // parser负责把源代码转成AST语法树

          // 在parser遍历语法的过程中，如果遍历到了import节点，就触发parser.hooks.import监听
          // https://webpack.docschina.org/api/parser/#import
          parser.hooks.import.tap('AutoExternalPlugin', (statement, source) => {
            if (this.externalModules.includes(source)) {
              this.importedModules.add(source); // 实际import的外部依赖模块
            }
          });

          // https://webpack.docschina.org/api/parser/#call
          // 遍历到require节点，也就是ast语法树对应的CallExpression
          parser.hooks.call.for('require').tap('AutoExternalPlugin', (callExpression) => {
            let source = callExpression.arguments[0].value;
            if (this.externalModules.includes(source)) {
              this.importedModules.add(source);//如果走到了这里，就表示代码中实际用到了lodash这个模块
            }
          });
        })
      
      // 拦截模块的生产过程hooks，如果是外链模块，就直接生产一个外部依赖模块返回
      // https://webpack.docschina.org/api/normalmodulefactory-hooks/
      normalModuleFactory.hooks.factorize.tapAsync('AutoExternalPlugin', (resolveData, callback) => {
        let { request } = resolveData; // lodash
        if (this.importedModules.has(request)) {
          let { globalVariable } = this.options[request]; // _
          // 直接生产一个外部依赖模块返回，模块就不会走打包
          callback(null, new ExternalModule(globalVariable));
        } else {
          // 正常模块，直接向后执行，走正常的打包模块的流程 => 读取模块源代码，传递给loader再返回JS模块，再解析依赖，再返回此模块
          callback(null);
        }
      });
    });
    compiler.hooks.compilation.tap('AutoExternalPlugin', (compilation) => {
      // 1.HtmlWebpackPlugin内部会向compilation对象上添加额外的钩子
      // 2.可以通过HtmlWebpackPlugin.getHooks取现这些钩子
      // 3.改变标签
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('AutoExternalPlugin', (htmlData, callback) => {
        [...this.importedModules].forEach(key => {
          htmlData.assetTags.scripts.unshift({
            tagName: 'script',
            voidTag: false,
            meta: { plugin: 'html-webpack-plugin' },
            attributes: { src: this.options[key].url }
          });
        });
        callback(null, htmlData);
      });
    });
  }
}
module.exports = AutoExternalPlugin;
```

8.AsyncQueue
----------------------------------

### 8.1 AsyncQueue

在webpack5中引入了AsyncQueue，控制任务并发执行的个数。

先看看AsyncQueue的使用.

doc/2.js：

```js
//let AsyncQueue = require('webpack/lib/util/AsyncQueue');
let AsyncQueue = require('./AsyncQueue');
/**
 * 条目处理器
 * @param {*} item 条目
 * @param {*} callback 处理完成后的回调函数
 */
function processor(item, callback) {
  setTimeout(() => {
    console.log('处理', item);
    callback(null, item);
  }, 3000);
}
/**
 * 返回此条目的唯一标识 
 * @param {*} item 条目
 * @returns 
 */
function getKey(item) {
  return item.key;
}
let queue = new AsyncQueue({
  name: '创建模块',
  parallelism: 3, //同时执行的异步任务并发数
  processor, //如何创建模块 每个条目 要经过如何处理
  getKey
});
const startTime = Date.now();
let item1 = {
  key: 'item1'
};
queue.add(item1, (err, result) => {
  console.log(err, result);
  console.log('完成item1过去', Date.now() - startTime);
});
let item2 = {
  key: 'item2'
};
queue.add(item2, (err, result) => {
  console.log(err, result);
  console.log('完成item2过去', Date.now() - startTime);
});
let item3 = {
  key: 'item3'
};
queue.add(item3, (err, result) => {
  console.log(err, result);
  console.log('完成item3过去', Date.now() - startTime);
});
let item4 = {
  key: 'item1'
};
queue.add(item4, (err, result) => {
  console.log(err, result);
  console.log('完成item4过去', Date.now() - startTime);
});
let item5 = {
  key: 'item1'
};
queue.add(item5, (err, result) => {
  console.log(err, result);
  console.log('完成item5过去', Date.now() - startTime);
});
```

### 8.2 AsyncQueue.js

实现AsyncQueue，来控制任务并发执行的个数.

doc/AsyncQueue.js

```js
const QUEUE_STATE = 0; //已经入队，等待执行
const PROCESSING_STATE = 1; //正在处理中
const DONE_STATE = 2; //任务已经执行完毕

//先进先出
class ArrayQueue {
  constructor() {
    this._list = [];
  }
  enqueue(item) {
    this._list.push(item); //放的话是放在最后的
  }
  dequeue() {
    return this._list.shift(); //出的是第一个，
  }
}
class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item;
    this.state = QUEUE_STATE; //默认状态是等待执行
    this.callback = callback;
  }
}
class AsyncQueue {
  constructor({
    name,
    parallelism,
    processor,
    getKey
  }) {
    this._name = name; //队列的名称
    this._parallelism = parallelism; //并发的个数
    this._processor = processor; //每个条目的处理器
    this._getKey = getKey; //每个条目的唯一标识获取函数
    this._entries = new Map(); //用来判断此条目是否已经添加过
    this._queued = new ArrayQueue(); //内部真正用来存放条目
    this._activeTasks = 0; //当前正在执行的任务数
    this._willEnsureProcessing = false; //是否要马上开始处理任务
  }
  add(item, callback) {
    const key = this._getKey(item); //获取此条目的key
    const oldEntry = this._entries.get(key); //去_entries获取一下老的条目
    if (oldEntry) {
      if (oldEntry.state == DONE_STATE) {
        process.nextTick(() => callback(entry.error, entry.result));
      } else {
        //这个老条目还在执行中，还没有结束，会把callback放到数组里
        if (oldEntry.callbacks) {
          oldEntry.callbacks.push(callback);
        } else {
          oldEntry.callbacks = [callback]
        }
      }
      return;
    }
    const newEntry = new AsyncQueueEntry(item, callback); //创建一个新的条目
    this._entries.set(key, newEntry);
    this._queued.enqueue(newEntry);
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }
  _ensureProcessing = () => {
    //如果当前已经在执行的任务小于并发任务数的话
    while (this._activeTasks < this._parallelism) {
      //取得最先加入的任务，或者说队头的任务
      const entry = this._queued.dequeue();
      if (!entry) break;
      this._activeTasks++; //让当前正在执行的并发任务数增加1
      entry.state = PROCESSING_STATE; //把条目的状态设置为执行中
      this._startProcessing(entry); //开始处理此条目
    }
    this._willEnsureProcessing = false;
  }
  _startProcessing(entry) {
    this._processor(entry.item, (error, result) => {
      this._handleResult(entry, error, result);
    });
  }
  _handleResult(entry, error, result) {
    const callback = entry.callback; //取现此条目的保存的回调函数
    const callbacks = entry.callbacks; //此条件额外其它的回调函数
    entry.state = DONE_STATE; //让当前的条目进行完成态
    entry.result = result; //把执行结果放在result属性上
    entry.error = error;
    callback(error, result); //执行回调
    if (callbacks) {
      callbacks.forEach(callback => callback(error, result));
    }
    this._activeTasks--; //让当前正在并发执行的任务数减1
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }
}
module.exports = AsyncQueue;
```