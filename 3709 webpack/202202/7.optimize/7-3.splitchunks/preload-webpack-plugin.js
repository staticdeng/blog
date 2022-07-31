const HtmlWebpackPlugin = require('html-webpack-plugin');
class PreloadWebpackPlugin {
    constructor(options) {
        this.options = options;//{rel,include}
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(
            this.constructor.name,
            compilation => {
                //在产出的html标签生成前确定要生成哪些代码块的link
                HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(this.constructor.name,
                    (htmlPluginData, callback) => {
                        this.generateLinks(compilation, htmlPluginData);
                        callback();
                    });
                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(this.constructor.name,
                    (htmlPluginData) => {
                        if (this.resourceHints) {
                            htmlPluginData.assetTags.styles = [
                                ...htmlPluginData.assetTags.styles,
                                ...this.resourceHints
                            ];
                            return htmlPluginData;
                        }

                    });
            }
        );
    }
    generateLinks(compilation) {
        const { rel = 'preload', include } = this.options;
        //获取本次编译产出了哪些代码
        let chunks = compilation.chunks;
        //或者没有指定包含的代码块，或者传了asyncChunks只包含异步代码块
        if (!include || include === 'asyncChunks') {
            //过滤一下代码块数组，只要那些不能作为初次加载的同步代码块
            chunks = chunks.filter(chunk => !chunk.canBeInitial());
        }
        const allFiles = chunks.reduce((accumulated, chunk) => {
            //给老的数组累加上当前代码块包含的文件
            return accumulated.concat(chunk.files);
        }, []);
        const uniqueFiles = new Set(allFiles);
        const links = [];
        for (const file of uniqueFiles) {
            const href = file;
            const attributes = { href, rel };
            links.push({
                tagName: 'link',
                attributes
            })
        }
        this.resourceHints = links;
    }
}
module.exports = PreloadWebpackPlugin;