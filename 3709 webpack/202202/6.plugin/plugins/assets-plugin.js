/**
 * Compilation插件，用来打印每次编译产出的代码块和文件
 */
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