# vue模版编译原理和虚拟dom原理

* 模板引擎的实现原理就是 with  + new Function

## 1. 解析模板参数

将vue数据渲染到视图中：

* 1. 使用模板引擎：需要正则匹配替换；1.0的时候，没有引入虚拟DOM的改变，每次拿到模板引擎进行数据替换，性能差

* 2. vue2 采用虚拟DOM， 数据变化后比较虚拟DOM的差异，最后更新需要更新的地方
    
* 3. 核心就是需要将模板变成我们的js语法， 通过js语法生成虚拟DOM

#### 1.1 先获取模板参数：

* 获取模板的顺序为：有render使用render，否则使用template，最后使用html

将含有编译器的入口文件 entry-runtime-with-compiler.js 作为打包入口文件，vm.$mount实现挂载写在这里。

src/platforms/web/entry-runtime-with-compiler.js

```js
+import Vue from 'core/index';
+import { compileToFunctions } from 'compiler/index';

// $mount实现挂载
+Vue.prototype.$mount = function (el) {
+  const vm = this;
+  el = document.querySelector(el);
+  if (!el) return;

+  let options = vm.$options;
+  if (!options.render) { // 先看有没有render函数 
+   let template; // 没有render看一下是否写了tempate, 没写template采用外部的html
+    if (!options.template) { // 没有写模板但是写了el
+      template = el.outerHTML
+    } else {
+      template = options.template // 有temlate则采用temlate的内容
+    }

+    if (template) {
+      // 对模板进行编译 
+      const render = compileToFunctions(template);
+      options.render = render; // jsx 最终会被编译成h('xxx')
+    }
+  }
+}
export default Vue;
```

entry-runtime-with-compiler.js 的作用是带模板编译(编译器)的入口文件。

vue的打包文件：

• script 标签引用的vue.global.js, 这个编译过程是在浏览器运行的, 含编译器, 打包入口为entry-runtime-with-compiler.js

• runtime是不包含模板编译的, 不含编译器, 整个编译是打包的时候通过loader来转义.vue文件的, 将vue文件内容转换为 render 函数的形式

#### 1.2 $mount挂载

```html
<script>
const vm = new Vue({
  data: {
    name: 'xiaoming',
    age: 20,
    address: {
      num: 30,
    },
    arr: [1, { a: 1 }],
  },
  // template:'<div>hello</div>'
  el: '#app', // 将数据解析到el元素上
});
// vm.$mount('#app');
</script>
```

可以`vm.$mount('#app')`挂载, 也可以直接 `el: '#app'` 写在选项里, 此时需要在初始化 initMixin 中调用 $mount

src/core/instance/init.js

```js
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options; // 将用户的选项挂载到实例上

    // 初始化状态（进行数据劫持）
    initState(vm);
    
+   if (options.el) {
+    vm.$mount(options.el); // 如果选项有el, 调用$mount挂载数据
+   }
  }
}
```

## 2. 编译模版转为ast语法树

## 3. ast语法树生成模板引擎/render函数 (代码生成)

## 4. render函数转为虚拟dom

## 5. 虚拟dom转为真实dom
