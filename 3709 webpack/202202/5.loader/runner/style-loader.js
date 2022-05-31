/**
 * 1.不管什么样的模块，最左侧的loader一定要返回一个JS模块代码
 * 创建一个style标签，把CSS文本放在style标签里面，然后插入页面
 * @param {*} css 
 */
function loader(css) {
    let moduleScript = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(css)};
        document.head.appendChild(style);
    `;
    return moduleScript;
}
module.exports = loader;