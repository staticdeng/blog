# webpack-optimize

1\. 缩小范围 
---------------------------------------------------------------------

### 1.1 extensions 

指定extension之后可以不用在`require`或是`import`的时候加文件扩展名,会依次尝试添加扩展名进行匹配

```js
resolve: {
  extensions: [".js",".jsx",".json",".css"]
},

```

### 1.2 alias 

配置别名可以加快webpack查找模块的速度

*   每当引入bootstrap模块的时候，它会直接引入`bootstrap`,而不需要从`node_modules`文件夹中按模块的查找规则查找

```js
const bootstrap = path.resolve(__dirname,'node_modules/bootstrap/dist/css/bootstrap.css')
resolve: {
+    alias:{
+        bootstrap
+    }
},

```

### 1.3 modules 

*   对于直接声明依赖名的模块（如 react ），webpack 会类似 Node.js 一样进行路径搜索，搜索`node_modules`目录
*   这个目录就是使用`resolve.modules`字段进行配置的 默认配置

```js
resolve: {
  modules: ['node_modules'],
}
```
如果可以确定项目内所有的第三方依赖模块都是在项目根目录下的 node\_modules 中的话

```js
resolve: {
  modules: [path.resolve(__dirname, 'node_modules')],
}
```
    

### 1.4 mainFields 

默认情况下package.json 文件则按照文件中 main 字段的文件名来查找文件

```js
resolve: {
  // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
  mainFields: ['browser', 'module', 'main'],
  // target 的值为其他时，mainFields 默认值为：
  mainFields: ["module", "main"],
}

```

### 1.5 mainFiles 

当目录下没有 package.json 文件时，我们说会默认使用目录下的 index.js 这个文件，其实这个也是可以配置的

```js
resolve: {
  mainFiles: ['index'], // 你可以添加其他默认使用的文件名
},

```

### 1.6 resolveLoader 

`resolve.resolveLoader`用于配置解析 loader 时的 resolve 配置,默认的配置：

```js
module.exports = {
  resolveLoader: {
    modules: [ 'node_modules' ],
    extensions: [ '.js', '.json' ],
    mainFields: [ 'loader', 'main' ]
  }
};

```

2\. noParse 
-------------------------------------------

*   `module.noParse` 字段，可以用于配置哪些模块文件的内容不需要进行解析
*   不需要解析依赖（即无依赖） 的第三方大型类库等，可以通过这个字段来配置，以提高整体的构建速度

```js
module.exports = {
  // ...
  module: {
    noParse: /jquery|lodash/, // 正则表达式
    // 或者使用函数
    noParse(content) {
      return /jquery|lodash/.test(content)
    },
  }
}...

```
    
> 使用 noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制
    

3\. IgnorePlugin 
-----------------------------------------------------

IgnorePlugin用于忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去

### 3.1 src/index.js 

```js
import moment from  'moment';
import 'moment/locale/zh-cn'
console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));

```

### 3.2 webpack.config.js 

```js
import moment from  'moment';
console.log(moment);

```

让webpack不把moment下的locale文件夹的语言包打包：

```js
new webpack.IgnorePlugin({
  contextRegExp: /moment$/, // 忽略哪个模块
  resourceRegExp: /locale/, // 忽略模块内的哪些资源
```

并在业务代码中引入语言包：

```js
import moment from  'moment';
import 'moment/locale/zh-cn';
console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));

```

*   第一个是匹配引入模块路径的正则表达式
*   第二个是匹配模块的对应上下文，即所在目录名

4.费时分析和打包分析
-----------------------------------------------------------------

费时分析配置：

```js
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const smw = new SpeedMeasureWebpackPlugin();
module.exports =smw.wrap({
});

```

webpack-bundle-analyzer打包文件分析：

*   一个webpack的插件，需要配合webpack和webpack-cli一起使用。这个插件的功能是生成代码分析报告，帮助提升代码质量和网站性能

```js
cnpm i webpack-bundle-analyzer -D
```

```js
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
module.exports={
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

```

5\. 优化js、css和图片 
-------------------------------------------------------

### 5.1 提取CSS

*   因为CSS的下载和JS可以并行,当一个HTML文件很大的时候，我们可以把CSS单独提取出来加载

#### 5.1.1 安装 

*   [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

```bash
npm install  mini-css-extract-plugin --save-dev

```

#### 5.1.2 webpack.config.js 

webpack.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
+const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
+   publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
+      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
+      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
+      { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
       {
        test: /\.(jpg|png|gif|bmp|svg)$/,
        type:'asset/resource',
        generator:{
          filename:'images/[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
+   new MiniCssExtractPlugin({
+      filename: '[name].css'
+   })
  ]
};

```

### 5.2 优化图片 

*   资源模块(asset module)是一种模块类型，它允许使用资源文件（字体，图标等）而无需配置额外 loader
*   在 webpack 5 之前，通常使用：
    *   raw-loader 将文件导入为字符串
    *   url-loader 将文件作为 data URI 内联到 bundle 中
    *   file-loader 将文件发送到输出目录
*   资源模块类型(asset module type)，通过添加 4 种新的模块类型，来替换所有这些 loader
    *   asset/resource 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
    *   asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。
    *   asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
    *   asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现；根据配置将符合配置的文件转换成 Base64 方式引入，将小体积的图片 Base64 引入项目可以减少 http 请求，也是一个前端常用的优化方式

```js
module: {
  rules: [
    { test: /\.txt$/, use: 'raw-loader' },
    { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
    { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
    { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
    // webpack5中用type:'asset/resource'处理图片资源
    {
      test: /\.(jpg|png|gif|bmp|svg)$/,
      type:'asset/resource',
      generator:{
        filename:'images/[hash][ext]',
      },
      parser: {
        //根据这个条件做选择，如果小于maxSize的话就变成base64字符串，如果大于的就拷贝文件并返回新的地址
        dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb
        }
      },
    }
  ]
},

```

### 5.3 压缩JS、CSS和HTML 

*   [optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)是一个优化和压缩CSS资源的插件
*   [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin)是一个优化和压缩JS资源的插件

webpack.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
+const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
+const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
+  mode: 'none',
  devtool: false,
  entry: './src/index.js',
+  optimization: {
+    minimize: true,
+    minimizer: [
+      new TerserPlugin(),
+    ],
+  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"],
          },
        },
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
      },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'] },
      { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'] },
      {
        test: /\.(jpg|png|gif|bmp|svg)$/,
        type:'asset/resource',
        generator:{
          filename:'images/[hash][ext]'
        }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
    template: './src/index.html',
+     minify: {  
+        collapseWhitespace: true,
+        removeComments: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
+    new OptimizeCssAssetsWebpackPlugin(),
  ],
};

```

### 5.4 purgecss-webpack-plugin 

*   [purgecss-webpack-plugin](https://www.npmjs.com/package/purgecss-webpack-plugin)
*   [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin)
*   [purgecss](https://www.purgecss.com/)
*   可以去除未使用的 css，一般与 glob、glob-all 配合使用
*   必须和`mini-css-extract-plugin`配合使用
*   `paths`路径是绝对路径

```bash
npm i  purgecss-webpack-plugin mini-css-extract-plugin css-loader glob -D
```

webpack.config.js

```js
const path = require("path");
+const glob = require("glob");
+const PurgecssPlugin = require("purgecss-webpack-plugin");
+const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
+      {
+        test: /\.css$/,
+        include: path.resolve(__dirname, "src"),
+        exclude: /node_modules/,
+        use: [
+          {
+            loader: MiniCssExtractPlugin.loader,
+          },
+          "css-loader",
+        ],
+      },
    ],
  },
  plugins: [
+    new MiniCssExtractPlugin({
+      filename: "[name].css",
+    }),
+    new PurgecssPlugin({
+      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
+    })
  ],
};

```

6\. CDN与hash 
-----------------------------------

*   CDN 又叫内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度。
*   [public-path](https://webpack.js.org/guides/public-path/#root)
*   [external-remotes-plugin](https://npmmirror.com/package/external-remotes-plugin)

### 6.1 使用缓存 

*   HTML文件不缓存，放在自己的服务器上，关闭自己服务器的缓存，静态资源的URL变成指向CDN服务器的地址
*   静态的JavaScript、CSS、图片等文件开启CDN和缓存，并且文件名带上HASH值
*   为了并行加载不阻塞，把不同的静态资源分配到不同的CDN服务器上

### 6.2 域名限制 

*   同一时刻针对同一个域名的资源并行请求是有限制
*   可以把这些静态资源分散到不同的 CDN 服务上去
*   多个域名后会增加域名解析时间
*   可以通过在 HTML HEAD 标签中 加入`<link rel="dns-prefetch" href="http://img.zhufengpeixun.cn">`去预解析域名，以降低域名解析带来的延迟

### 6.3 文件指纹hash

*   打包后输出的文件名和后缀
*   hash一般是结合CDN缓存来使用，通过webpack构建之后，生成对应文件名自动带上对应的MD5值。如果文件内容改变的话，那么对应文件哈希值也会改变，对应的HTML引用的URL地址也会改变，触发CDN服务器从源服务器上拉取对应数据，进而更新本地缓存。

指纹占位符

| 占位符名称 | 含义 |
| --- | --- |
| ext | 资源后缀名 |
| name | 文件名称 |
| path | 文件的相对路径 |
| folder | 文件所在的文件夹 |
| hash | 每次webpack构建时生成一个唯一的hash值 |
| chunkhash | 根据chunk生成hash值，来源于同一个chunk，则hash值就一样 |
| contenthash | 根据内容生成hash值，文件内容相同hash值就相同 |

#### 6.3.1 hash 

*   Hash 是整个项目的hash值，其根据每次编译内容计算得到，每次编译之后都会生成新的hash,即修改任何文件都会导致所有文件的hash发生改变

```js
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  mode: "production",
+  entry: {
+    main: './src/index.js',
+    vender:['lodash']
+  },
  output:{
    path:path.resolve(__dirname,'dist'),
+    filename:'[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[hash].css"
    }),
  ],
};
```

#### 6.3.2 chunkhash 

*   采用hash计算的话，每一次构建后生成的哈希值都不一样，即使文件内容压根没有改变。这样子是没办法实现缓存效果，我们需要换另一种哈希值计算方式，即chunkhash

* chunkhash和hash不一样，它根据不同的入口文件(Entry)进行依赖文件解析、构建对应的chunk，生成对应的哈希值。我们在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用chunkhash的方式生成哈希值，那么只要我们不改动公共库的代码，就可以保证其哈希值不会受影响

```js
const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  mode: "production",
  entry: {
    main: './src/index.js',
    vender:['lodash']
  },
  output:{
    path:path.resolve(__dirname,'dist'),
+    filename:'[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[chunkhash].css"
    }),
  ],
};
```

#### 6.3.3 contenthash 

* 使用chunkhash存在一个问题，就是当在一个JS文件中引入CSS文件，编译后它们的hash是相同的，而且只要js文件发生改变，关联的css文件hash也会改变；

* 这个时候可以使用`mini-css-extract-plugin`里的`contenthash`值，保证即使css文件所处的模块里就算其他文件内容改变，只要css文件内容不变，那么不会重复构建

```js
const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  mode: "production",
  entry: {
    main: './src/index.js',
    vender:['lodash']
  },
  output:{
    path:path.resolve(__dirname,'dist'),
    filename:'[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[contenthash].css"
    }),
  ],
};
```

7.tree-shaking
-----------------------------------------------------------------------------------------

*   [tree-shaking](https://webpack.js.org/guides/tree-shaking/#root)
*   webpack4 本身的 tree shaking 比较简单，主要是找一个 import 进来的变量是否在这个模块内出现过，非常简单粗暴

![1608717220311](https://img.zhufengpeixun.com/1608717220311)

### 7.1 原理

*   webpack从入口遍历所有模块的形成依赖图,webpack知道那些导出被使用
*   遍历所有的作用域并将其进行分析，消除未使用的范围和模块的方法
*   [webpack-deep-scope-demo](https://diverse.space/webpack-deep-scope-demo/)
*   [webpack-deep-scope-analysis-plugin](https://github.com/vincentdchan/webpack-deep-scope-analysis-plugin)

![1608717379363](https://img.zhufengpeixun.com/1608717379363)


### 7.2 开启

#### 7.2.1 开发环境

webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  optimization: {
   usedExports: true,
  },
};

```

#### 7.2.2 生产环境

*   生产环境默认开启

#### 7.2.3 sideEffects

*   `"sideEffects": false`,意思就是对所有的模块都进行`Tree Shaking`
*   也就是将没有引入的方法等不进行打包到打包输出文件中

package.json

```
{"sideEffects": ["@babel/polyfill"]}
{"sideEffects": ["*.css"]}

```

### 7.3 嵌套的 tree-shaking

*   webpack 现在能够跟踪对导出的嵌套属性的访问
*   这可以改善重新导出命名空间对象时的Tree Shaking(清除未使用的导出和混淆导出)

#### 7.3.1 src\\index.js

src\\index.js

```js
import * as calculator from "./calculator";
console.log(calculator.operators.add);

```

#### 7.3.2 src\\calculator.js

src\\calculator.js

```js
import * as operators from "./operators";
export { operators };

```

#### 7.3.3 src\\operators.js

src\\operators.js

```js
export const add = 'add';
export const minus = 'minus';

```

#### 7.3.4 webpack.config.js

webpack.config.js

```js
module.exports = {
  mode: 'production'
}

```

### 7.4 内部模块 tree-shaking

*   webpack 4 没有分析模块的导出和引用之间的依赖关系
*   webpack 5 可以对模块中的标志进行分析，找出导出和引用之间的依赖关系

#### 7.4.1 src\\index.js

src\\index.js

```js
import { getPostUrl } from './api';
console.log('getPostUrl',getPostUrl);

```

#### 7.4.2 src\\api.js

src\\api.js

```js
import { host } from './constants';

function useHost() {
  return host;
}

export function getUserUrl() {
  return useHost()+'/user';
}
export function getPostUrl() {
    return '/post';
}

```

#### 7.4.3 src\\api.js

src\\api.js

```js
export const host = 'http://localhost';

```

### 7.5 CommonJs Tree Shaking

*   webpack 曾经不进行对 `CommonJS` 导出和 `require()`调用时的导出使用分析
*   webpack 5 增加了对一些 `CommonJS` 构造的支持，允许消除未使用的 CommonJs 导出，并从 require() 调用中跟踪引用的导出名称 支持以下构造：
  
> *   exports|this|module.exports.xxx = ...
    
> *   exports|this|module.exports = require("...") (reexport)

> *   exports|this|module.exports.xxx = require("...").xxx (reexport)

> *   Object.defineProperty(exports|this|module.exports, "xxx", ...)

> *   require("abc").xxx

> *   require("abc").xxx()

#### 7.5.1 src\\index.js

src\\index.js

```js
let api = require('./api');
console.log(api.getPostUrl);

```

#### 7.5.2 src\\api.js

src\\api.js

```js
function getUserUrl() {
  return '/user';
}
function getPostUrl() {
    return '/post';
}

exports.getPostUrl=getPostUrl;

```

8.开启Scope Hoisting
---------------------------------------------------------------------------------------------------

* webpack3 新推出的Scope Hoisting，译为"作用域提升"，它可以让webpack打包出来的代码文件更小，运行更快

* 原来webpack将import转换为require的模块代码会包裹上一层函数，函数声明语句会产生大量代码，函数作用域变多，内存开销变大

* Scope Hoisting的原理是将所有模块按照引用顺序放在一个函数作用域里，然后适当地重命名一些变量以防止命名冲突

* 这个功能在mode: 'production'下默认开启，开发环境要用 `webpack.optimize.ModuleConcatenationPlugin` 插件

* 要使用ES6 Module, Commonjs 不支持

9.提高构建速度
---------------------------------------------------------------------------------------------------

在项目开发中，想要提高webpack编译速度，可以开启多线程和利用缓存。

### 9.1 开启多线程

```bash
npm install --save-dev thread-loader
```

把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个单独的 worker 池(worker pool)中运行

每个 worker 都是一个单独的有 600ms 限制的 node.js 进程。同时跨进程的数据交换也会被限制。请仅在耗时的 loader 上使用。

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'thread-loader',
          options: {
            workers: 3
          }
        },
        {
          loader: 'babel-loader'
        }
      ]
    }
  ]
}
```


### 9.2 利用缓存

webpack中利用缓存一般有：

* babel-loader开启缓存

* 使用cache-loader，webpack5 中使用cache

#### 9.2.1 babel-loader开启缓存

babel在转义js的过程中消耗性能较高，将babel-loader执行结果缓存起来，当重新打包构建时会尝试读取缓存，从而提高打包构建速度，降低消耗

```js
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        // babel编译后把结果缓存起来，下次编译的时候可以复用上次的结果
        cacheDirectory: true
      }
    }
  ]
}
```

#### 9.2.2 使用cache-loader

在webpack5之前：

* 在一些性能开销较大的loader之前添加cache-loader，将结果缓存到磁盘里

在webpack5中：

*   [缓存](https://webpack.docschina.org/configuration/other-options/#cache)生成的webpack模块和chunk,来改善构建速度
*   cache 会在开发模式被设置成 `type: 'memory'` 而且在 生产 模式 中被禁用
*   在webpack5中默认开启，缓存默认是在内存里,但可以对`cache`进行设置
*   当设置`cache.type: "filesystem"`的时候,webpack会在内部启用文件缓存和内存缓存，写入的时候会同时写入内存和文件，读取缓存的时候会先读内存，如果内存里没有才会读取文件
*   每个缓存最大资源占用不超过500MB,当逼近或超过500MB时，会优先删除最老的缓存，并且缓存的有效期最长为2周

```js
const path = require('path');
module.exports = {
  mode: 'development',
  cache: {
    type: 'filesystem',  //  'memory' | 'filesystem'
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'), // 默认将缓存存储在 node_modules/.cache/webpack
  },
}
```

10.moduleIds & chunkIds的优化 
---------------------------------------------------------------------------------------------------

### 10.1 概念和选项 

*   module: 每一个文件其实都可以看成一个 module
*   chunk: webpack打包最终生成的代码块，代码块会生成文件，一个文件对应一个chunk
*   在webpack5之前，没有从entry打包的chunk文件，都会以1、2、3...的文件命名方式输出，删除某些文件可能会导致缓存失效
*   在生产模式下，默认启用这些功能chunkIds: "deterministic", moduleIds: "deterministic"，此算法采用`确定性`的方式将短数字 ID(3 或 4 个字符)短hash值分配给 modules 和 chunks
*   chunkId设置为deterministic，则output中chunkFilename里的 name 会被替换成确定性短数字ID
*   虽然chunkId不变(不管值是deterministic | natural | named)，但更改chunk内容，chunkhash还是会改变的

| 可选值 | 含义 | 示例 |
| --- | --- | --- |
| natural | 按使用顺序的数字ID | 1 |
| named | 方便调试的高可读性id | src\_two\_js.js |
| deterministic | 根据模块名称生成简短的hash值 | 915 |
| size | 根据模块大小生成的数字id | 0 |

### 10.2 webpack.config.js 

webpack.config.js

```js
const path = require('path');
module.exports = {
    mode: 'development',
    devtool:false,
+   optimization:{
+       moduleIds:'deterministic',
+       chunkIds:'deterministic'
+   }
}

```

### 10.3 src\\index.js 

src\\index.js

```js
import('./one'); // 1.hash.js
import('./two'); // 2.hash.js 如果不引入这一行，则下面的3.hash.js会变成2.hash.js，缓存失效
import('./three'); // 3.hash.js

```

如果删除`import('./two')`，在webpack5之前都会以1、2、3...的文件命名方式输出，则`import('./three')`的缓存会失效

