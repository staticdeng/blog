/**
 * 打包zip插件
 */
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