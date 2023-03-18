
function loader(source) {
    //console.log(this);
    console.log('inline1');
    return source + '//inline1';
}
loader.pitch = function () {
    console.log('inline1 pitch');
}
//当raw=false的时候，webpack会把源文件内容转成字符串传给loader
//当raw=true的时候，webpack会把源文件转成Buffer传进来  file-loader url-loader
//loader.raw = true;

module.exports = loader;