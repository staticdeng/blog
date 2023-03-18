/**
 * 编译完成的webpack插件
 * 1. 在 webpack 源码文件 compiler.js 文件中，done(compiler.hooks.done) 钩子函数使用的是异步串行钩子：
			class Compiler {
				constructor() {
					this.hooks = Object.freeze({
						// 异步串行AsyncSeriesHook
						done: new AsyncSeriesHook(\['stats'\]),
						...
					})
				}
			}
	 2. 因为 compiler.hooks.done 是异步串行钩子，所以既可以用 tap 使用同步，也可以用 tapAsync 使用异步
	 3. 使用异步，多了callback参数，执行callback了webpack继续后面工作
*/
class DonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 想在编译完成后执行一些事情 => 使用compiler.hooks.done钩子函数
    compiler.hooks.done.tapAsync('DonePlugin', (stats, callback) => {
      // 因为 compiler.hooks.done 是异步串行钩子，所以既可以用 tap 使用同步，也可以用 tapAsync 使用异步
      setTimeout(() => {
        console.log("Hello ", this.options.name);
        // 使用异步，多了callback参数，执行callback了webpack继续后面工作
        callback();
      }, 3000);
    });
  }
}
module.exports = DonePlugin;