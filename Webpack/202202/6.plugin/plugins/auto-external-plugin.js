/**
 * 自动外链插件
 */
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
          callback(null, new ExternalModule(globalVariable, '', request));
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