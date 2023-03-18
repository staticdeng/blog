/**
 *  "./src/hello.js", 23
 * @param {*} value ./src/hello.js
 * @param {*} mode 23 10111 16+4+2+1
 * @returns 
 * 1  1
 * 2  10
 * 4  100
 * 8  1000
 * 16 10000
 */
function t(value, mode) {
    //如果1为真，需要require,说明传过来的是一个模块ID，需要加载一下
    if (mode & 1) value = require(value);
    //如果1000为真，则直接返回value,因为当前8这位为假，所以不能直接返回，其实就 需要包装成es module
    if (mode & 8) return value;
    if (typeof value === 'object' && value) {
        //如果已经是一个es module了，就直接返顺
        if ((mode & 4) && value.__esModule) return value;
        //如果16 是真，并且value是一个promise就直接返回
        if ((mode & 16) && typeof value.then === 'function') return value;
    }
    //需要自己包装成es module
    var ns = Object.create(null);
    //ns.__esModule=true
    require.r(ns);
    var def = {};
   /*  leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
    for (var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
        Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
    } */
    //给ns定义一个default属性，值是一个getter函数，getter函数返回一个value值
    def['default'] = () => (value);
    require.d(ns, def);
    return ns;
};
//require.t方法就是保证返回一个es module 
console.log(23..toString(2));