
/**
 * 1.返回值只依赖参数
 * 2.不修改作用域之外的变量
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function sum(a, b) {
    global.x = 1;
    return a + b + Math.random();
}

