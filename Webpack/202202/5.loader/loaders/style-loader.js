/**
 * style-loader
      不在loader函数里面添加style标签了，而是在pitch里面提前使用require('!!../loaders/less-loader.js!./index.less')
      的形式只使用内联loader(../loaders/less-loader.js)处理less文件了
 */

/**
 * 创建一个style标签，把CSS文本放在style标签里面，然后插入页面
 * @param {*} css 
 */

// 不管什么样的模块，最左侧的loader一定返回的是一个JS模块代码；所以在style-loader的loader函数里不好处理less-loader返回的内容，改用loader.pitch处理
function loader(css) {
    /*  let script = `
         let style = document.createElement('style');
         style.innerHTML = ${JSON.stringify(css)};
         document.head.appendChild(style);
     `;
     return script; */
}
/**
 * 
 * @param {*} remainingRequest 剩下的请求 [less-loader,index.less]
 * @param {*} previousRequest 之前的请求 []
 * @param {*} data 当前loader的数据对象 {}
 */
loader.pitch = function (remainingRequest) {
    console.log('remainingRequest', remainingRequest); // C:\Users\5.loader\loaders\less-loader.js!C:\users\5.loader\src\index.less
    
    // 把绝对路径变成可以在本模块内加载的相对路径
    let request = JSON.stringify(
        this.utils.contextify(this.context, '!!' + remainingRequest) // 加上!!只使用内联loader
    );
    console.log(request); // '!!../loaders/less-loader.js!./index.less'

    // 使用内联loader：require('!!../loaders/less-loader.js!./index.less')，这样执行流程就是 style-loader的pitch => less-loader的normal执行顺序了
    let script = `
        let style = document.createElement('style');
        style.innerHTML = require(${request});
        document.head.appendChild(style);
     `;
    return script;
}

module.exports = loader;