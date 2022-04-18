const postcssPresetEnv = require('postcss-preset-env');
module.exports = {
    plugins: [
        postcssPresetEnv({
            browsers: 'last 5 version'
        })
    ]
}