# vue模版编译原理和虚拟dom原理

#### 转换模版为 ast 语法树的过程

* 1. 使用正则将 html 当做字符串进行匹配，匹配开始标签、结束标签和文本

* 2. 将匹配的结果保存，并从原来 html 字符串中删除，不断地匹配

* 3. 利用栈型结构构造一颗树：

  * 遇到开始标签入栈，遇到结束标签出栈, currentParent入栈和出栈都更新为当前栈中最后一个元素;

  * 匹配到开始标签时构造ast语法树为node (即node = createASTElement(tag, attrs));

  * 在匹配到开始标签和文本节点时currentParent.children.push(node)

#### 模板引擎的实现原理

就是 with  + new Function

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

## 2. 编译模版转为 ast 语法树

vue2 采用正则对模板进行编译处理, vue3 采用的不是使用正则.

#### 2.1 转换模版为 ast 语法树的过程

* 1. 使用正则将 html 当做字符串进行匹配，匹配开始标签、结束标签和文本

* 2. 将匹配的结果保存，并从原来 html 字符串中删除，不断地匹配

* 3. 利用栈型结构构造一颗树：

  * 遇到开始标签入栈，遇到结束标签出栈, currentParent入栈和出栈都更新为当前栈中最后一个元素;

  * 匹配到开始标签时构造ast语法树为node (即node = createASTElement(tag, attrs));

  * 在匹配到开始标签和文本节点时currentParent.children.push(node)

这样，html 就被编译为一颗 ast 语法树

#### 2.2 代码实现

src/compiler/index.js

```js
+import { parse } from './parser/index';

export function compileToFunctions(template) {
+  // 1. 转换 template 为 ast 语法树
+  const ast = parse(template.trim());
+  console.log(ast);
}

```

src/compiler/parser/index.js

```js
+import { parseHTML } from './html-parser';

+export function parse (template) {
+  return parseHTML(template);
+}

```

src/compiler/parser/html-parser.js

转换 HTML 为 AST：

```js
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/; // <div> <br/>

// vue3 采用的不是使用正则
// vue2 采用正则对模板进行编译处理  
export function parseHTML(html) { // html最开始肯定是一个  </div>

  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; // 用于存放元素的
  let currentParent; // 指向的是栈中的最后一个
  let root;

  // 最终需要转化成一颗 AST 抽象语法树
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }
  // 利用栈型结构构造一颗树：
  // 遇到开始标签入栈，遇到结束标签出栈, currentParent入栈和出栈都更新为当前栈中最后一个元素;
  // 匹配到开始标签时构造ast语法树为node (即node = createASTElement(tag, attrs));
  // 在匹配到开始标签和文本节点时currentParent.children.push(node)
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs); // 创造一个ast节点
    if (!root) { // 看一下是否是空树
      root = node; // 如果为空则当前是树的根节点
    }
    if (currentParent) {
      node.parent = currentParent; // 只赋予了parent属性
      currentParent.children.push(node); // 还需要让父亲记住自己
    }
    stack.push(node);
    currentParent = node; // currentParent为栈中的最后一个
  }

  function chars(text) { // 文本直接放到当前指向的节点中
    text = text.replace(/\s/g, ' '); // 如果空格超过2就删除2个以上的
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    });
  }

  function end(tag) {
    let node = stack.pop(); // 弹出最后一个, 校验标签是否合法
    currentParent = stack[stack.length - 1];
  }

  // 前进一步，删除匹配过的
  function advance(n) {
    html = html.substring(n);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      advance(start[0].length);
      // 如果不是开始标签的结束, 就一直匹配下去
      let attr, end
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true
        });
      }
      if (end) {
        advance(end[0].length)
      }
      return match;
    }
    return false; // 不是开始标签
  }
  while (html) {
    // 如果textEnd 为0 说明是一个开始标签或者结束标签
    // 如果textEnd > 0说明就是文本的结束位置
    let textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配结果
      if (startTagMatch) { // 解析到的开始标签
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chars(text);
        advance(text.length); // 解析到的文本 
      }
    }
  }

  return root;
}
```

## 3. ast语法树生成模板引擎/render函数 (代码生成)

ast语法树里面还有 `{{}}` 里的数据需要解析，也就是转成render函数，供后面生成虚拟dom使用

将ast语法树生成代码(render函数):

src/compiler/codegen/index.js

```js
function genProps(attrs) {
  let str = '' // {name,value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      // color:red;background:red => {color:'red'}
      let obj = {};
      attr.value.split(';').forEach(item => { // qs 库
        let [key, value] = item.split(':');
        obj[key] = value;
      });
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},` // a:b,c:d,
  }
  return `{${str.slice(0, -1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量
function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    // 文本
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      //_v( _s(name)+'hello' + _s(name))
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      // split
      while (match = defaultTagRE.exec(text)) {
        let index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
  return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
  let children = genChildren(ast.children);
  let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
      }${ast.children.length ? `,${children}` : ''
      })`);
  return code;
}

export function generate(ast) {
  const state = codegen(ast);
  return state;
}
```

调用generate：

src/compiler/index.js

```js
import { parse } from './parser/index';
+import { generate } from './codegen/index';

export function compileToFunctions(template) {
  // 1. 转换 template 为 ast 语法树
  const ast = parse(template.trim());
  console.log('ast', ast);

  // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
+ let code = generate(ast);
  //  _c('div',{id:'app'},_c('div',{style:{color:'red'}}, _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))
  // 模板引擎的实现原理 就是 with  + new Function
+ code = `with(this){return ${code}}`;
+ let render = new Function(code); // 根据代码生成render函数
  console.log('render', render);
+ return render;
}
```

使用下面模板：

```html
<div id="app" style="color:red;background:yellow">
  <div style="color:green" key="123">
    {{ name }} hello {{age}}
  </div>
  <li> world </li>
</div>
<script src="vue.js"></script>
<script>
  const vm = new Vue({
    data: {
      name: 'xiaoming',
      age: 20,
    },
    el: '#app', // 将数据解析到el元素上
  });
</script>
```

最后render函数为：

```js
(function anonymous(
) {
with(this){return _c('div',{id:"app",style:{"color":"red","background":"yellow"}},_v("     "),_c('div',{style:{"color":"green"},key:"123"},_v("       "+_s(name)+" hello "+_s(age)+"     ")),_v("     "),_c('li',null,_v(" world ")),_v("   "))}
})
```

可以发现 _c 函数第一个参数为tag, 第二个参数为props, 第三个为...children; 

* _c 函数用来生成元素
* _v 函数用来生成文本
* _s 函数用来生成数据

## 4. render函数转为虚拟dom

在render函数生成后，就需要转为虚拟dom，进行dom diff后生成真实dom。

#### 4.1 初始化lifecycleMixin和renderMixin

调用mountComponent挂载：

```js
import Vue from 'core/index';
import { compileToFunctions } from 'compiler/index';
+import { mountComponent } from 'core/instance/lifecycle';

// $mount实现挂载
Vue.prototype.$mount = function (el) {
  ...
    if (template) {
      // 对模板进行编译 
      const render = compileToFunctions(template);
      options.render = render; // jsx 最终会被编译成h('xxx')
    }
  ...

+  mountComponent(vm, el); // 组件的挂载
}
export default Vue;
```

mountComponent 需要调用`vm._render()`方法产生虚拟节点虚拟DOM，`vm._update` 虚拟DOM产生真实DOM插入el元素中：

src/core/instance/lifecycle.js

```js
export function mountComponent(vm, el) { // 这里的el是通过querySelector处理过的
  vm.$el = el;

  // 1.调用render方法产生虚拟节点虚拟DOM
  // 2.根据虚拟DOM产生真实DOM，插入el元素中
  vm._update(vm._render()); // vm.$options.render() 虚拟节点
}
```

需要两个实例方法vm._update和vm._render()，分别写在lifecycleMixin和renderMixin中：

在初始化时调用 lifecycleMixin 和 renderMixin:

src/core/instance/index.js

```js
import { initMixin } from './init';
+ import { lifecycleMixin } from './lifecycle';
+ import { renderMixin } from './render';

// 避免将所有的方法都耦合在一起，使用构造函数的方式，不使用类的方式
function Vue(options) { 
  // options就是用户的选项
  this._init(options); // 默认就调用了init
}

initMixin(Vue);
+ lifecycleMixin(Vue);
+ renderMixin(Vue);

export default Vue;
```

#### 4.2 vm._render 生成虚拟dom

在renderMixin中定义vm._render:

src/core/instance/render.js

```js
import { createElementVNode, createTextVNode } from '../vdom/vnode';

export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const { render } = this.$options;

    // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
    const vnode = render.call(this);
    return vnode;
  }

  // _c('div',{},...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
};
```

在vnode.js中，转换vnode:

src/core/vdom/vnode.js

```js
// h()  _c()
export function createElementVNode(vm, tag, data, ...children) {
  if (data == null) {
    data = {}
  }
  let key = data.key;
  if (key) {
    delete data.key
  }
  return vnode(vm, tag, key, data, children);
}
// _v()
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
// 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
    // ....
  }
}
```

调用 `vm._render()` 就可以生成虚拟dom.

## 5. 虚拟dom转为真实dom

#### 5.1 vm._render 更新dom

在lifecycleMixin中，定义vm._render 接收虚拟dom:

```js
+import { patch } from '../vdom/patch';

+export function lifecycleMixin(Vue) {
+  Vue.prototype._update = function (vnode) { // 将vnode转化成真实dom
+    console.log('_update', vnode);

+    const vm = this;
+    const el = vm.$el;

    // patch既有初始化的功能，又有更新 
+    vm.$el = patch(el, vnode);
+  }
+}

export function mountComponent(vm, el) { // 这里的el 是通过querySelector处理过的
  vm.$el = el;

  // 1.调用render方法产生虚拟节点虚拟DOM
  // 2.根据虚拟DOM产生真实DOM，插入el元素中
  vm._update(vm._render()); // vm.$options.render() 虚拟节点
}
```

#### 5.2 patch 生成真实dom

patch既有初始化生成真实dom的功能，又有更新的功能；patch 中dom-diff后续再讲，这里先讲初渲染流程生成真实dom。

src/core/vdom/patch.js

```js
function createElm(vnode) {
  let {
    tag,
    data,
    children,
    text
  } = vnode;
  if (typeof tag === 'string') { // 标签
    vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，后续如果修改属性了
    patchProps(vnode.el, data);
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    });
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') { // style{color:'red'}
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

export function patch(oldVNode, vnode) {
  // 写的是初渲染流程 
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; // 获取真实元素
    const parentElm = elm.parentNode; // 拿到父元素
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling);
    parentElm.removeChild(elm); // 删除老节点

    return newElm
  } else {
    // diff算法
  }
}
```

#### 5.3 手动更新视图

有了vm._update和vm._render后，可以手动更新视图了。

```html
<div id="app" style="color:red;background:yellow">
  <div style="color:green" key="123">
    {{ name }} hello {{age}}
  </div>
  <li> world </li>
</div>
<script src="vue.js"></script>
<script>
  const vm = new Vue({
    data: {
      name: 'xiaoming',
      age: 20,
    },
    // template:'<div>hello</div>'
    el: '#app', // 将数据解析到el元素上
  });

  // 手动更新视图
  setTimeout(() => {
    vm.name = 'xiaohu';
    vm.age = 28
    vm._update(vm._render()); // 重新根据数据渲染出一个虚拟dom
  }, 2000);
</script>
```

2s后通过手动代码`vm._update(vm._render())`触发，就可以更新视图；后续属性和我们的视图关联起来，就可以做到数据变化可以自动更新视图。