class AssetPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        // 每当compiler开始一次新的构建，创建一个新的compilation实例，会触发一个钩子事件
        compiler.hooks.compilation.tap('AssetPlugin', (compilation) => {
            // chunk代码块asset产出的资源文件
            compilation.hooks.chunkAsset.tap('AssetPlugin', (chunk, filename) => {
                console.log('代码块对应文件', chunk.name, filename);
            });
        });
    }
}
module.exports = AssetPlugin;