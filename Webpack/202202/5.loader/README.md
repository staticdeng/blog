# webpack-loader

## 核心总结

1. babel-loader的原理

* babel-loader只是一个转换JS源代码的函数；传入js源码，通过babel.transform传入源码和babel的插件配置，通过babel的插件来实现对应语法的转换即可

```js
function loader(source) {
  let options = this.getOptions({}); // presets: ["@babel/preset-env"]
  let { code } = babel.transform(source, options);
  return code;//转换成ES5的内容
}
```

2. loader-runner模块的原理

核心原理就是先执行loader.pitch，后执行loader.normal(也就是loader函数)，然后返回loader的执行结果

3. style-loader的原理

* style-loader的 loader 函数返回的是一个JS模块代码；所以在style-loader的loader函数里不好处理less-loader返回的内容，改用loader.pitch处理

* style-loader在loader.pitch里处理css为内联css

* 比如使用了less-loader，处理 pitch 函数的剩余请求参数 remainingRequest 为相对路径（例如处理后相对路径为'!!../loaders/less-loader.js!./index.less'）

* 使用内联loader：require('!!../loaders/less-loader.js!./index.less')，这样执行流程就是 style-loader的pitch => less-loader的normal执行顺序了，而不再是 less-loader 的noraml => style-loader 的noraml函数（也就是loader函数）

1.loader 的工作流
-------------------------

*   所谓 loader 只是一个导出为函数的 JavaScript 模块。它接收上一个 loader 产生的结果或者资源文件(resource file)作为入参。也可以用多个 loader 函数组成 loader chain
*   compiler 需要得到最后一个 loader 产生的处理结果。这个处理结果应该是 String 或者 Buffer（被转换为一个 string）

### 1.1 loader 运行的总体流程

![webpackflowloader](https://user-images.githubusercontent.com/20060839/168425989-ee900824-f31c-475a-ab6f-dc12ba3905fc.jpeg)

### 1.2 loader-runner

*   [loader-runner](https://github.com/webpack/loader-runner#readme)是一个执行 loader 链条的npm模块

![loader-runner2](https://user-images.githubusercontent.com/20060839/169233263-e9b14f58-3188-4d83-aaf5-2bed4c097e2a.png)

#### 1.2.1 loader 类型

*   [loader 的叠加顺序](https://github.com/webpack/webpack/blob/v4.39.3/lib/NormalModuleFactory.js#L159-L339) = post(后置)+inline(内联)+normal(正常)+pre(前置)

* loader 的执行顺序相反

#### 1.2.2 loader 执行流程

##### 1.2.2.1 runner-demo.js

loader-runner 的使用：

```js
const { runLoaders } = require('loader-runner');
const path = require('path');
const fs = require('fs');
// 入口文件
const entryFile = path.resolve(__dirname, 'src', 'title.js');
// loader的转换规则配置
let rules = [
  {
    test: /title\.js$/,
    use: ['normal1-loader.js', 'normal2-loader.js']
  },
  {
    test: /title\.js$/,
    enforce: 'post',
    use: ['post1-loader.js', 'post2-loader.js']
  },
  {
    test: /title\.js$/,
    enforce: 'pre',
    use: ['pre1-loader.js', 'pre2-loader.js']
  }
]

let request = `inline1-loader!inline2-loader!${entryFile}`; // 内联类型loader
let parts = request.replace(/^-?!+/, '').split('!'); // ['inline1-loader','inline2-loader',entryFile]
let resource = parts.pop(); // entryFile
const inlineLoaders = parts; // ['inline1-loader','inline2-loader']

// 根据rules匹配不同类型的loader
const preLoaders = [], postLoaders = [], normalLoaders = [];
rules.forEach(rule => {
  //if (rule.test.test(resource)) {
  if (resource.match(rule.test)) {
    if (rule.enforce === 'pre') {
      preLoaders.push(...rule.use);
    } else if (rule.enforce === 'post') {
      postLoaders.push(...rule.use);
    } else {
      normalLoaders.push(...rule.use);
    }
  }
})

// loader 的叠加顺序 = post(后置)+inline(内联)+normal(正常)+pre(前置)
let loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
// 把loader的名称转变成一个绝对路径
const resolveLoader = loader => path.resolve(__dirname, 'runner', loader);
loaders = loaders.map(resolveLoader);

// 使用loader-runner
runLoaders({
  resource, // 要加载和转换的模块
  loaders, // 是一个绝对路径的loader数组
  context: { name: 'test' }, // loader的上下文对象
  readResource: fs.readFile.bind(fs) // 读取硬盘上资源的方法
}, (err, result) => {
  // console.log(err); // 运行错误
  console.log('result:', result); // 转换后的结果
  // resourceBuffer 是buffer格式的源代码的内容，如果是pitch返回的，没有读取源文件，那么它就是null
  if (result.resourceBuffer) {
    console.log('resource:', result.resourceBuffer.toString('utf8'));// 最初始的转换前的源文件内容
  }
});

```

##### 1.2.2.2 pre-loader1.js

loaders\\pre-loader1.js

```
function loader(source) {
  console.log("pre1");
  return source + "//pre1";
}
module.exports = loader;

```

##### 1.2.2.3 pre-loader2.js

loaders\\pre-loader2.js

```
function loader(source) {
  console.log("pre2");
  return source + "//pre2";
}
module.exports = loader;

```

##### 1.2.2.4 normal-loader1.js

loaders\\normal-loader1.js

```
function loader(source) {
  console.log("normal1");
  return source + "//normal1";
}
loader.pitch = function () {
  return "normal1pitch";
};
module.exports = loader;

```

##### 1.2.2.5 normal-loader2.js

loaders\\normal-loader2.js

```
function loader(source) {
  console.log("normal2");
  return source + "//normal2";
}
/* loader.pitch = function(){
  return 'normal-loader2-pitch';
} */
module.exports = loader;

```

##### 1.2.2.6 inline-loader1.js

loaders\\inline-loader1.js

```
function loader(source) {
  console.log("inline1");
  return source + "//inline1";
}

module.exports = loader;

```

##### 1.2.2.7 inline-loader2.js

loaders\\inline-loader2.js

```
function loader(source) {
  console.log("inline2");
  return source + "//inline2";
}
module.exports = loader;

```

##### 1.2.2.8 post-loader1.js

loaders\\post-loader1.js

```
function loader(source) {
  console.log("post1");
  return source + "//post1";
}
module.exports = loader;

```

##### 1.2.2.9 post-loader2.js

loaders\\post-loader2.js

```
function loader(source) {
  console.log("post2");
  return source + "//post2";
}
module.exports = loader;

```

最后运行`node runner-demo.js`，输入结果为：

```js
pre2
pre1
normal2
normal1
inline2
inline1
post2
post1
result: {
  result: [
    "module.exports = 'title';//pre2//pre1//normal2//normal1//inline2//inline1//post2//post1"
  ],
  resourceBuffer: <Buffer 6d 6f 64 75 6c 65 2e 65 78 70 6f 72 74 73 20 3d 20 27 74 69 74 6c 65 27 3b>,
  cacheable: true,
  fileDependencies: [ '/Users/sunnyface/Desktop/5.loader/src/title.js' ],
  contextDependencies: [],
  missingDependencies: []
}
resource: module.exports = 'title';
```
#### 1.3 特殊配置

*   [loaders/#configuration](https://webpack.js.org/concepts/loaders/#configuration)

| 符号 | 变量 | 含义 |
| --- | --- | --- |
| `-!` | noPreAutoLoaders | 不要前置和普通 loader | Prefixing with -! will disable all configured preLoaders and loaders but not postLoaders |
| `!` | noAutoLoaders | 不要普通 loader | Prefixing with ! will disable all configured normal loaders |
| `!!` | noPrePostAutoLoaders | 不要前后置和普通 loader,只要内联 loader | Prefixing with !! will disable all configured loaders (preLoaders, loaders, postLoaders) |

这些符号都是和内连loader一起使用的：

```js
let request = `-!inline-loader1!${entryFile}`; // 比如 -! 不要前置和普通loader, 在webpack配置文件中的前置和普通loader就不起效
```

#### 1.4 pitch

*   比如 a!b!c!module, 正常调用顺序应该是 c、b、a，但是真正调用顺序是 a(pitch)、b(pitch)、c(pitch)、c、b、a,如果其中任何一个 pitching loader 返回了值就相当于在它以及它右边的 loader 已经执行完毕
*   比如如果 b 中 loader.pitch 返回了字符串`return 'b'`（也就是有返回值），接下来只有 a 会被系统执行，且 a 的 loader 收到的参数是 `'b'`，而不是源文件里面代码
*   loader 根据返回值可以分为两种，一种是返回 js 代码（一个 module 的代码，含有类似 module.export 语句）的 loader，还有不能作为最左边 loader 的其他 loader
*   有时候我们想把两个第一种 loader chain 起来，比如 style-loader!css-loader! 问题是 css-loader 的返回值是一串 js 代码，如果按正常方式写 style-loader 的参数就是一串代码字符串
*   为了解决这种问题，我们需要在 style-loader 里执行 require(css-loader!resources)

pitch 与 loader 本身方法的执行顺序图

```
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution

```

![loader_pitch](https://user-images.githubusercontent.com/20060839/169644533-b32b1edb-b003-482b-ab0d-fcd835e92d7c.jpeg)

2.babel-loader 实现
--------------------------------------

*   [babel-loader](https://github.com/babel/babel-loader/blob/master/src/index.js)
*   [@babel/core](https://babeljs.io/docs/en/next/babel-core.html)
*   [babel-plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx/)


```
$ npm i @babel/preset-env @babel/core -D

```

babel-loader的实现代码：

```js
const babel = require('@babel/core');

/**
 * babel-loader只是一个转换JS源代码的函数
 * @param {*} source 接收一个source参数
 * 返回一个新的内容
 */
function loader(source) {
  let options = this.getOptions({}); // loader-context
  let { code } = babel.transform(source, options);
  return code;//转换成ES5的内容
}
module.exports = loader;
/**
 * babel-loader
     babel-loader只是提供一个转换源代码函数，但是它并不知道要干啥要转啥
 * @babel/core 真正要转换代码从ES6到ES5需要靠 @babel/core
     babel/core本身只能提供从源代码转成语法树，遍历语法树，从新的语法树重新生成源代码的功能
 * babel plugin
     但是babel/core并不知道如何转换语换法，它并不认识箭头函数，也不知道如何转换转换箭头函数
     @babel/transform-arrow-functions 插件其实是一个访问器，它知道如何转换AST语法树
 * babel preset
     因为要转换的语法太多，插件也太多。所以可一堆插件打包大一起，成为预设preset-env
 */

```

webpack.config.js

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devServer: {
    hot: false,
  },
  resolveLoader: {
    alias: {
      "babel-loader": path.resolve(__dirname, "loader/babel-loader.js"),
    },
    modules: [path.resolve("./loader"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
/**
 * 要想在项目中使用自定义loader
 * 1.可以使用绝对路径 path.resolve(__dirname,'loader/babel-loader.js')
 * 2.resolveLoader 配置alias
 * 3.resolveLoader 配置modules
 */

```

3\. style-loader 实现
-----------------------------------------

*   [css-loader](https://github.com/webpack-contrib/css-loader/blob/master/lib/loader.js) 的作用是处理 css 中的 @import 和 url 这样的外部资源
*   [style-loader](https://github.com/webpack-contrib/style-loader/blob/master/index.js) 的作用是把样式插入到 DOM 中，方法是在 head 中插入一个 style 标签，并把样式写入到这个标签的 innerHTML 里
*   [less-loader](https://github.com/webpack-contrib/less-loader) 把 less 编译成 css
*   [pitching-loader](https://webpack.js.org/api/loaders/#pitching-loader)
*   [loader-utils](https://github.com/webpack/loader-utils)
*   [!!](https://webpack.js.org/concepts/loaders/#configuration)

### 3.1 安装依赖

```bash
$ npm i less  -D

```

### 3.2 使用 less-loader

#### 3.2.1 index.js

src\\index.js

```js
import "./index.less";

```

#### 3.2.2 src\\index.less

src\\index.less

```less
@color: red;
#root {
  color: @color;
}

```

#### 3.2.3 src\\index.html

src\\index.html

```
<div id="root">root</div>

```

#### 3.2.4 webpack.config.js

webpack.config.js

```js
{
  test: /\.less$/,
  use: [
    'style-loader',
    'less-loader'
  ]
}

```

#### 3.2.5 loaders/less-loader.js

```js
let less = require("less");
function loader(source) {
  let callback = this.async();
  less.render(source, { filename: this.resource }, (err, output) => {
    callback(err, output.css);
  });
}
module.exports = loader;

```

#### 3.2.6 loaders/style-loader.js

```js
function loader(source) {
  let script = `
      let style = document.createElement("style");
      style.innerHTML = ${JSON.stringify(source)};
    document.head.appendChild(style);
    `;
  return script;
}
module.exports = loader;

```

上面的less-loader.js和style-loader.js 简单实现了less编译为css；但是当前style-loader.js这种写法返回的是CSS脚本，并不是JS，所以并不能单独使用，只不能直接给webpack使用。

### 3.3 两个左侧模块连用

#### 3.3.1 loaders/less-loader.js

```js
const less = require('less');

function loader(lessSource) {
  // 调用async方法，那么此loader的执行就会变成异步的，当前loader结束后不会自动执行上一个loader，而是会等待调用callback函数才会继续执行
  let callback = this.async();
  less.render(lessSource, { filename: this.resource }, (err, output) => {
    // callback(err, output.css);
    // 当前上面callback(err, output.css)这种写法返回的是CSS脚本，并不是JS，所以并不能单独使用，只不能直接给webpack使用
    // 所以改写成module.exports导出模块的方式
    let script = `module.exports = ${JSON.stringify(output.css)}`;
    callback(err, script);
  });
}
module.exports = loader;

```

#### 3.3.2 loaders/style-loader.js

```js
const path = require('path');
function loader() {}

loader.pitch = function (remainingRequest) {
  //现在我们的请求格式  style-loader!less-loader!index.less
  //style.innerHTML = require("!!../loader/less-loader.js!./index.less");
  let script = `
      let style = document.createElement('style');
      style.innerHTML = require(${stringifyRequest(
        this,
        "!!" + remainingRequest
      )});
      document.head.appendChild(style);
    `;
  console.log(script);
  return script;
};
function stringifyRequest(loaderContext, request) {
  let prefixRep = /^-?!+/;
  let prefixResult = request.match(prefixRep);
  let prefix = prefixResult ? prefixResult[0] : "";
  const splitted = request.replace(prefixRep, "").split("!");
  const { context } = loaderContext;
  return JSON.stringify(
    prefix +
      splitted
        .map((part) => {
          part = path.relative(context, part);
          if (part[0] !== ".") part = "./" + part;
          return part.replace(/\\/g, "/");
        })
        .join("!")
  );
}
module.exports = loader;

```

最后运行`npm run build` 预览结果

4\. loader-runner 实现
-------------------------------------------------

*   [LoaderRunner.js](https://github.com/webpack/loader-runner/blob/v2.4.0/lib/LoaderRunner.js)
*   [NormalModuleFactory.js](https://github.com/webpack/webpack/blob/v4.39.3/lib/NormalModuleFactory.js#L180)
*   [NormalModule.js](https://github.com/webpack/webpack/blob/v4.39.3/lib/NormalModule.js#L292)

*   previousRequest 前面的 loader
*   currentRequest 自己和后面的 loader+资源路径
*   remainingRequest 后面的 loader+资源路径
*   data: 和普通的 loader 函数的第三个参数一样,而且 loader 执行的全程用的是同一个对象

loader-runner的流程图：

![](https://user-images.githubusercontent.com/20060839/169648924-2d4a83b0-5f94-4671-b52a-f756dafad0c7.png)

总结一下loader-runner的流程：

* 进入 runLoaders 方法，先执行loader.pitch，然后processResource读取模块内容，然后执行normalLoaders，然后执行callback

* 核心原理就是先执行loader.pitch，后执行loader.normal(也就是loader函数)，然后返回loader的执行结果result

```js
let fs = require("fs");
/**
 * 可以把一个loader从一个绝对路径变成一个loader对象
 */
function createLoaderObject(loader) {
  let normal = require(loader);
  let pitch = normal.pitch;
  let raw = normal.raw; //决定loader的参数是字符串还是Buffer
  return {
    path: loader, //存放着此loader的绝对路径
    normal,
    pitch,
    raw,
    data: {}, //每个loader都可以携带一个自定义data对象
    pitchExecuted: false, //此loader的pitch函数是否已经 执行过
    normalExecuted: false, //此loader的normal函数是否已经执行过
  };
}
function convertArgs(args, raw) {
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = args[0].toString("utf8");
  }
}
function iterateNormalLoaders(
  processOptions,
  loaderContext,
  args,
  pitchingCallback
) {
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, args);
  }
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      args,
      pitchingCallback
    );
  }
  let fn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(fn, loaderContext, args, (err, ...returnArgs) => {
    if (err) return pitchingCallback(err);
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      returnArgs,
      pitchingCallback
    );
  });
}
function processResource(processOptions, loaderContext, pitchingCallback) {
  processOptions.readResource(loaderContext.resource, (err, resourceBuffer) => {
    processOptions.resourceBuffer = resourceBuffer;
    loaderContext.loaderIndex--; //定位到最后一个loader
    iterateNormalLoaders(
      processOptions,
      loaderContext,
      [resourceBuffer],
      pitchingCallback
    );
  });
}
function iteratePitchingLoaders(
  processOptions,
  loaderContext,
  pitchingCallback
) {
  //说所有的loader的pitch都已经执行完成
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(processOptions, loaderContext, pitchingCallback);
  }
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++; //如果当前的pitch已经执行过了，就可以让当前的索引加1
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }
  let fn = currentLoader.pitch;
  currentLoader.pitchExecuted = true; //表示当前的loader的pitch已经处理过
  if (!fn) {
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }
  //以同步或者异步的方式执行fn
  runSyncOrAsync(
    fn,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...args) => {
      //如果有返回值，索引减少1，并执行前一个loader的normal
      if (args.length > 0 && args.some((item) => item)) {
        loaderContext.loaderIndex--; //索引减少1
        iterateNormalLoaders(
          processOptions,
          loaderContext,
          args,
          pitchingCallback
        );
      } else {
        return iteratePitchingLoaders(
          processOptions,
          loaderContext,
          pitchingCallback
        );
      }
    }
  );
}
function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  let isSync = true; //这个是个标志 符，用来标志fn的执行是同步还是异步，默认是同步
  loaderContext.callback = (...args) => {
    runCallback(null, ...args);
  };
  loaderContext.async = () => {
    isSync = false; //从同步改为异步
    return loaderContext.callback;
  };
  //在执行pitch方法的时候 ，this指向loaderContext
  let result = fn.apply(loaderContext, args);
  if (isSync) {
    //如果是同步的执行的话，会立刻向下执行下一个loader
    runCallback(null, result);
  } //如果是异步的话，那就什么都不要做
}
function runLoaders(options, finalCallback) {
  let {
    resource,
    loaders = [],
    context = {},
    readResource = fs.readFile,
  } = options; //src\index.js
  let loaderObjects = loaders.map(createLoaderObject);
  let loaderContext = context;
  loaderContext.resource = resource; //要加载的资源
  loaderContext.readResource = readResource; //读取资源的方法
  loaderContext.loaders = loaderObjects; //所有的loader对象
  loaderContext.loaderIndex = 0; //当前正在执行的loader索引
  loaderContext.callback = null; //回调
  loaderContext.async = null; //把loader的执行从同步变成异步
  //所有的loader加上resouce
  Object.defineProperty(loaderContext, "request", {
    get() {
      //loader1!loader2!loader3!index.js
      return loaderContext.loaders
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  //从当前的loader下一个开始一直到结束 ，加上要加载的资源
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      //loader1!loader2!loader3!index.js
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  //从当前的loader开始一直到结束 ，加上要加载的资源
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      //loader1!loader2!loader3!index.js
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  //从第一个到当前的loader的前一个
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      //loader1!loader2!loader3!index.js
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "data", {
    get() {
      //loader1!loader2!loader3!index.js
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });
  let processOptions = {
    resourceBuffer: null, //将要存放读到的原始文件的原始文件 index.js的内容 Buffer
    readResource,
  };
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}
exports.runLoaders = runLoaders;

```