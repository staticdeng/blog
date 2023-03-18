/**
 * loader-runner 的使用和 loader 执行流程
 */

const { runLoaders } = require('./loader-runner');
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
