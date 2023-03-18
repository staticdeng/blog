class AssetPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('AssetPlugin', compilation => {
            compilation.hooks.chunkAsset.tap('AssetPlugin', (chunk, filename) => {
                console.log(chunk.name);
            });
        });
    }
}
module.exports = AssetPlugin;