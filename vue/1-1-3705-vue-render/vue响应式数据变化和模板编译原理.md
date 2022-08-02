# vue响应式数据变化和模板编译原理

## 1. 初始化state

#### 1.1.1 从vue入口文件看起，入口文件导出 Vue 构造函数：

src/core/index.js 

```js
import Vue from './instance/index'

export default Vue
```

src/core/instance/index.js

```js
import { initMixin } from './init';

// 避免将所有的方法都耦合在一起，使用构造函数的方式，不使用类的方式
function Vue(options) { 
  // options就是用户的选项
  this._init(options); // 默认就调用了init
}

initMixin(Vue);

export default Vue;
```

#### 1.1.2 initMixin

在initMixin中，挂载vm.$options, 依次初始化initLifecycle, initEvents, initRender, initState等:

src/core/instance/init.js

```js
import { initState } from './state';

export function initMixin(Vue) { // 就是给Vue增加init方法的
  Vue.prototype._init = function (options) { // 用于初始化操作
    // vue  vm.$options 就是获取用户的配置 
    // 我们使用的 vue的时候 $nextTick $data $attr.....
    const vm = this;
    vm.$options = options; // 将用户的选项挂载到实例上

    // 初始化状态（进行数据劫持）
    initState(vm);
  }
}

```

#### 1.1.3 initState

initState中，初始化获取vm.$options上的选项data，然后进行数据劫持和响应式数据变化处理。

src/core/instance/state.js

```js
export function initState(vm) {
  const opts = vm.$options; // 获取所有的选项
  if (opts.data) {
    initData(vm);
  }
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data; // data可能是函数和对象
  data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象
  vm._data = data; // 我将返回的对象放到了_data上
  console.log(data)
}
```

