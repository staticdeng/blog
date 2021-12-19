# rollup配置打包vue组件库并发布到npm

在最近探索写一个vue上拉加载下拉刷新组件[(组件库链接)](https://github.com/staticdeng/vuejs-loadmore)的过程中，组件花了几周写好了，正准备打包的时候，却遇到了一个很奇怪的问题；用的是vue-cli的lib模式打包([文档在这](https://cli.vuejs.org/zh/guide/build-targets.html#%E5%BA%93))，结果奇怪的是打包的体积竟然快200k，但是写的组件库的代码应该只有20k，这可让人接收不了。

为了解决问题，我接着去看vue各种常用的移动端ui组件库的构建方式；vant用的是类似于vue-cli脚手架工具的vant/cli(有兴趣和时间可以去研究一下vant/cli如何构建的)，还有其他组件库使用webpack打包组件库包的体积有点大。

为了实现打包体积的最优化，不可能短时间内去研究vant/cli生成一套构建工具吧。经过思考，把构建工具的选型定在了rollup、parcel、vite中；最后由于rollup可配置性比较高和特别适合库和组件库的打包，最后选择了rollup，下面就来看看rollup是怎么构建打包一个可供别人使用的组件库吧。


# rollup配置打包组件库

Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。在平时开发应用程序时，我们基本上选择用webpack，相比之下，rollup.js更多是用于library打包，我们熟悉的vue、react、vuex、vue-router等都是用rollup进行打包的。

### rollup安装

```bash
npm i rollup -g        # 全局安装
npm i rollup -D        # 项目本地安装
```

### rollup配置文件

rollup通过像webpack一样编写一个配置文件来进行打包:

在项目根目录下创建rollup.config.js，指定入口文件和打包配置：

```js
export default {
  input: './src/index.js',
  output: [
    {
      name: 'libName',
      file: './lib/index.js',
      format: 'umd',
      sourcemap: false,
      globals: {
        vue: 'vue'
      }
    },
    {
      name: 'libName',
      file: './lib/index.module.js',
      format: 'es',
      sourcemap: false,
      globals: {
        vue: 'vue'
      }
    }
  ],
}
```

使用rollup.config.js配置文件，可以<b>使用rollup --config或者rollup -c指令来打包</b>。

上面打包成了umd和es两种模式，globals指定用到了的vue库；umd和es生成的打包文件还需要在package.json下面两个属性中分别指定好打包后的路径：

```bash
{
  "main": "lib/index.js",
  "module": "lib/index.module.js",
}
```

在我们的组件库发布到npm后，可以使用umd的模式调用，也可以使用es的模式；那么项目中怎么识别呢？webpack 从版本 2 开始也可以识别package.json中module 字段，如果存在 module 字段，会优先使用；es的模式也就是ES Module，带来的一个优势即是代码 `tree shaking`，webpack可以对组件库中没用用到的代码打包时自动去除。

### rollup插件

上面我们知道了rollup的基础用法，上面仅仅只能打包js代码；在实际应用中，会有很多更复杂的需求，比如，怎样支持es6语法，怎样打包vue文件，怎样压缩我们js的代码等等。在rollup中，我们借助插件来完成。

rollup的plugin兼具webpack中loader和plugin的功能，下面来介绍一些常用插件：

#### rollup-plugin-vue

rollup-plugin-vue用于处理vue文件，vue2和vue3项目所用的rollup-plugin-vue版本不一样，vue的编译器也不一样。

* vue2：rollup-plugin-vue^5.1.9 + vue-template-compiler
* vue3：rollup-plugin-vue^6.0.0 + @vue/compiler-sfc

以vue2为例：

```bash
npm i rollup-plugin-vue@5.1.9 vue-template-compiler --D
```

在rollup.config.js中加入rollup-plugin-vue

```js
import vue from 'rollup-plugin-vue'
export default {
  ...
  plugins:[
    vue()
  ]
}
```
这样就可以编译、打包.vue文件了。

#### rollup-plugin-node-resolve

自动识别文件后缀：

```js
import resolve from 'rollup-plugin-node-resolve';
export default {
  ...
  plugins:[
    resolve({
      extensions: ['.vue', '.js']
    }),
  ]
}
```

#### rollup-plugin-postcss

处理css需要用到的插件是rollup-plugin-postcss。它支持css文件的加载、css加前缀、css压缩、对scss/less的支持等等。

这里安装不做过多强调，差哪些包在打包时会自动提示。

```js
import postcss from 'rollup-plugin-postcss';
export default {
  ...
  plugins:[
    postcss({
      plugins: [require('autoprefixer')],
      // 把 css 插入到 style 中
      inject: true,
      // 把 css 放到和js同一目录
      // extract: true,
      minimize: true,
      sourceMap: false,
      extensions: ['.sass', '.scss', '.less', '.css']
    }),
  ]
}
```

组件库中我使用的是sass，不需要额外装其他sass包，用一个postcss就搞定；个人认为这是一个最好用的包了，既可以将css打包内联到js中，又可以单独打包css到一个css文件中。

#### rollup-plugin-babel

rollup-plugin-babel用于转换es6为es5语法，还需要其他比如`@babel/preset-env`包来配合解析。

```js
import babel from 'rollup-plugin-babel';
export default {
  ...
  plugins:[
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.vue']
    }),
  ]
}
```

使用babel插件 @babel/preset-env、@babel/core：

新建babel.config.js：

```js
module.exports = {
  "presets": [
    [
      "@babel/preset-env"
    ]
  ]
}
```
@babel/preset-env可以转换很多es6语法，还需要转行其他es6语法则需要其他插件。

#### rollup-plugin-terser

rollup-plugin-terser用于压缩代码，它可以混淆和大幅度压缩代码体积。

```js
import { terser } from 'rollup-plugin-terser';
export default {
  ...
  plugins:[
    terser(),
  ]
}
```

在package.json中配置打包命令：

```js
"scripts": {
  "build": "rollup -c"
},
```

npm run build就可以将`./src/index.js`路径下的vue组件库打包生成`lib/index.js`和`lib/index.module.js`了。

[完整的配置文件在这里](https://github.com/staticdeng/vuejs-loadmore)

## 关于Eslint

一个组件库中，Eslint必不可少。在vue-cli中，eslint已经配置好了；那么在rollup的配置中，如何添加上eslint呢？

先安装eslint：

```bash
npm install eslint --D
```
安装完成后在 ./node_modules/.bin/eslint --init 或者 npx eslint --init，根据指引生成所需的 eslint 配置方案，最后生成一个 ESLint 配置文件 .eslintc.js。

当然上面配置只加了一个简单的extends, `extends: eslint:recommended`经常被作为项目的JS检查规范被引入。实际项目中配置规则的时候，还有vue的规则，不可能团队一条一条的去商议配置，太费精力了。通常的做法是使用业内大家普通使用的、遵循的编码规范。 我们组件库中配置使用的是vue-cli中一样的eslint配置，直接拷贝过来就可以了。

最后配置一个eslint校验命令：

```bash
"scripts": {
  "lint": "eslint ./packages --ext .vue,.js,.ts",
  "lint-fix": "eslint --fix ./packages --ext .vue,.js,.ts",
}
```
npm run lint 就可以对指定的文件进行eslint校验，npm run lint-fix可以直接优化eslint校验不通过的代码。

[完整的eslint配置文件在这里](https://github.com/staticdeng/vuejs-loadmore)


## 关于单元测试

组件库应该保证功能的稳定性和代码质量，还有后续开源库可能存在很多人维护的问题，必须保证程序的健壮性，每次迭代保证不破坏原有的逻辑，单元测试也就尤为重要。一般组件库中做单元测试的框架有以下两种方式：

* Karma + Mocha
* Jest

其中Karma可以模拟开一个浏览器自动化测试，可以在不同的浏览器里跑样式测试等；Macha提供一个自动化测试的框架，用于单元测试的断言。

Jest集成了Mocha + jsdom（node环境模拟dom环境，无法测试样式）自带测试覆盖率，优点是零配置，包含了测试框架的所有内容，还带有快照等功能，开箱即用。

## 关于持续集成

持续集成就是把代码测试、打包、发布等工作交给一些工具来自动完成。这样可以提高效率，开发人员只需要关心开发和提交代码到git就可以了。

Github Actions是Github官方提供的一个非常好用的持续集成工具，我们可以用Github Actions来做发布、持续单元测试等。

[GitHub Actions 入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html?fileGuid=1PWJAvQBtLA5IGh3)

## 发布到npm

如果我们在业务中写了组件库抽离出来，想要分享出去给别人使用，一般都会把它作为 npm 包发布到官方仓库中，需要使用的时候再通过 npm install xxx 来安装即可。

那么如何发布一个 npm 包呢？

首先要指定好package.json里面的必须字段：

```json
{
  "name": "your package name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```
其中name写好包名，必须指定一个初始版本version，然后指定main入口文件，这些都是必不可少的。

"main"的作用是别人import、require的时候，引用的文件，所以main指定为rollup打包后的文件路径。

一切组件库工作准备就绪后，就可以通过下面npm命令发布到npm了。

```bash
npm addUser # 假若没有账号，则注册一个
npm login   # 假若已经有账号了，则直接登录
npm publish # 将组件库发布到npm
```

# 后续

整个组件库的架构还不够完善，在后续工作中，还有很多事情需要做；比如很有必要添加单元测试等，组件库的功能更新，支持vue3、TS等，这些有时间会在后续补上，有兴趣的可以关注我这个上拉加载下拉刷新的组件库。别急，让子弹先飞一会...

[上拉加载下拉刷新的组件库](https://github.com/staticdeng/vuejs-loadmore)

参考资料(Tanks)：

[rollup从入门到打包一个按需加载的组件库](https://juejin.cn/post/6934698510436859912)

[配置 ESLint](https://juejin.cn/post/6844904041063907341)

[如何写出优雅且有意义的 README.md](https://juejin.cn/post/6844904057191170055)
