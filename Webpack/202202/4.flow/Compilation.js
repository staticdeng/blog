/**
 * 编译入口文件及其依赖文件
 */
const path = require('path').posix;
const fs = require('fs');
const types = require('@babel/types');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const { SyncHook } = require('tapable');
const baseDir = toUnixPath(process.cwd());
function toUnixPath(filePath) {
    return filePath.replace(/\\/g, '/');
}
class Compilation {
    constructor(options) {
        this.options = options;
        // 存放已经编译的所有的依赖模块
        this.buildedDepModules = [];
        // 编译依赖的文件
        this.fileDependencies = [];
        // 所有的代码块
        this.chunks = [];
        // 输出的代码内容
        this.assets = {};
        this.hooks = {
            chunkAsset: new SyncHook(["chunk", "filename"])
        }
    }
    build(onCompiled) {
        // 5.根据配置文件的entry找入口文件
        let entry = {};
        // 兼容配置文件entry的值是对象和字符串的情况
        if (typeof this.options.entry === 'string') {
            entry.main = this.options.entry;
        } else {
            entry = this.options.entry;
        }
        for (let entryName in entry) {
            // 获取配置文件的所有入口文件的绝对路径，添加到文件依赖
            let entryPath = path.join(baseDir, entry[entryName]);
            this.fileDependencies.push(entryPath);

            // 6.从入口文件出发,调用所有配置的Loader对模块进行编译
            let entryModule = this.buildModule(entryName, entryPath);

            // 8.根据入口和依赖模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
            let chunk = {
                name: entryName, // 代码块名称是入口名称
                entryModule, // 入口模块
                modules: this.buildedDepModules.filter(module => module.names.includes(entryName)) // 这个入口代码块中包含的依赖模块
            }
            this.chunks.push(chunk);
            console.log('chunks', this.chunks);

            // 9.再把每个 Chunk 转换成一个单独的源码加入到输出列表
            this.chunks.forEach(chunk => {
                let filename = this.options.output.filename.replace('[name]', chunk.name); // 打包后文件名就是配置文件的入口文件entry的key
                this.hooks.chunkAsset.call(chunk, filename);
                this.assets[filename] = getSource(chunk);
            });
        }

        // 编译成功回调
        onCompiled(null, {
            modules: this.buildedDepModules, // 依赖模块
            chunks: this.chunks, // 代码块
            assets: this.assets, // 输出代码内容
        }, this.fileDependencies);
    }
    /**
     * 编译模块
     * @param {*} name 入口的名称 entry1 entry2
     * @param {*} modulePath 模块的绝对路径
     */
    buildModule(name, modulePath) {
        // 6.从入口文件出发,调用所有配置的Loader对模块进行编译
        // 6.1 读取源代码的内容
        let sourceCode = fs.readFileSync(modulePath, 'utf8');
        // 6.2 匹配此模块需要使用的loader
        let { rules } = this.options.module;
        let loaders = [];
        rules.forEach(rule => {
            //如果正则匹配上了，则把此rule对应的loader添加到loaders数组里
            if (modulePath.match(rule.test)) {
                loaders.push(...rule.use);
            }
        });
        // 6.3 从右向左调用loader转换sourceCode
        sourceCode = loaders.reduceRight((sourceCode, loader) => {
            return require(loader)(sourceCode);
        }, sourceCode);

        // 7.再找出该模块依赖的模块，再递归本步骤(buildModule)直到所有入口依赖的文件都经过了本步骤的处理

        // 模块ID就是相对于项目根目录的相对路径； './src/title.js'每个模块都有一个ID => id: './src/entry1.js',
        let moduleId = "./" + path.relative(baseDir, modulePath);
        // 创建一个模块对象，moduleId是相对于项目根目录的相对路径；dependencies表示此模块依赖的模块；names表示此模块添几个入口依赖了（入口的名称 [entry1,entry2]）
        let module = { id: moduleId, dependencies: [], names: [name] };
        let ast = parser.parse(sourceCode, { sourceType: 'module' });
        traverse(ast, {
            CallExpression: ({ node }) => {
                if (node.callee.name === 'require') {
                    let depModuleName = node.arguments[0].value; //./title
                    // 获取当前模块所有的目录 C:\4.flow\src
                    let dirname = path.dirname(modulePath);
                    // 获取依赖的模块的绝对路径 C:/4.flow/src/title
                    let depModulePath = path.join(dirname, depModuleName);
                    // 获取当前支持自动补全扩展名
                    let extensions = this.options.resolve.extensions;
                    // 获取依赖的模块的绝对路径
                    depModulePath = tryExtensions(depModulePath, extensions);
                    // 把此依赖文件添加到依赖数组里，当文件变化了，会重新启动编译 ，创建一个新的Compilation
                    this.fileDependencies.push(depModulePath);
                    // 获取依赖模块的模块id，也就是相对于根目录的相对路径
                    let depModuleId = './' + path.relative(baseDir, depModulePath);
                    // 修改AST语法对，把require方法的参数变成依赖的模块ID
                    node.arguments = [types.stringLiteral(depModuleId)];
                    // 把依赖模块信息添加到依赖数组里
                    module.dependencies.push({ depModuleId, depModulePath });
                }
            }
        });

        let { code } = generator(ast);
        module._source = code;

        // 递归编译本模块的依赖模块
        module.dependencies.forEach(({ depModuleId, depModulePath }) => {
            let buildedModule = this.buildedDepModules.find(module => module.id === depModuleId);
            if (buildedModule) {
                // title这个module.names = [entry1,entry2];
                buildedModule.names.push(name);
            } else {
                let depModule = this.buildModule(name, depModulePath);
                this.buildedDepModules.push(depModule);
            }
        });
        return module;
    }
}
/**
 * 尝试给当前的路径添加扩展名，直到找到存在的文件为止
 * @param {*} modulePath 
 * @param {*} extensions 
 */
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
    throw new Error(`找不到${modulePath}`);
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
module.exports = Compilation;