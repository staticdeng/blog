# Vue.mixin和生命周期原理

## 1. Vue.mixin 的实现

### 1.1 用法

Vue.mixin 混合 可以混入一些公共方法，用法如下

例子1：

```js
<script>
  // 1. Vue.options = {}  {created(){}}
  Vue.mixin({
    created() {
      console.log('mixin1-created')
    },
  })
  //  2 Vue.options = {created:[fn]}  {created(){}}
  Vue.mixin({
    created() {
      console.log('mixin2-created')
    },
  })
  Vue.mixin({
    created() {
      console.log('mixin3-created')
    },
  })
  Vue.mixin({
    mounted() {
      console.log('mixin1-mounted')
    },
  })
  // 发布订阅  -》  订阅
  console.log('Vue.options =>', Vue.options)

  // 内部会将多个created 合并成一个队列 依次执行 
  const vm = new Vue({
    // Vue.options = {created:[fn,fn]}  {created:fn(){}}
    created() {
      console.log('created')
    }
  });

  // vue.mixin 混合 可以混入一些公共方法

</script>
```

### 1.2 Vue.mixin 实现

#### 1.2.1 Vue.mixin 合并

在src/core/global-api/mixin.js 定义了 Vue.mixin 全局方法

src/core/global-api/mixin.js

```js
import { mergeOptions } from '../util/options';

export function initMixin(Vue) {
  Vue.options = {}

  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  }
}
```

每次调用 Vue.mixin(mixin) 传入的mixin参数都会和前面传入的mixin参数进行合并，最后放在了Vue.options中

来看看 mergeOptions 是怎么进行对象的key合并的

src/core/util/options.js

```js
const strats = {};
const LIFECYCLE = [
  'beforeCreate',
  'created'
];
LIFECYCLE.forEach(hook => {
  // 将生命周期方法合并成一个队列
  strats[hook] = function (p, c) {
    // p: {} c: {created:function(){}}  => {created:[fn]}
    // p: {created:[fn]}  c: {created:function(){}} => {created:[fn,fn]}
    
    if (c) { // 如果儿子有, 父亲有, 让父亲和儿子拼在一起
      if (p) {
        return p.concat(c);
      } else {
        return [c]; // 儿子有父亲没有, 则将儿子包装成数组
      }
    } else {
      return p; // 如果儿子没有则用父亲即可
    }
  }
});

export function mergeOptions(parent, child) {
  // console.log(parent, child);
  const options = {};
  for (let key in parent) { // 遍历老的key
    mergeField(key);
  }
  for (let key in child) { // 遍历新的key
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式, 用策略模式减少if /else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 如果不在策略中则以儿子为主
      options[key] = child[key] || parent[key]; // 优先采用儿子，在采用父亲
    }
  }
  
  return options;
}
```

mergeOptions 通过对老对象和新对象的 key 值遍历，取出新老对象的 value 根据定义的策略 strats 进行对象的 value 合并

在上面例子1中，打印出的 Vue.options 的值为：

```js
Vue.options => {created: [f, f, f], mounted: ƒ}
```

#### 1.2.2 Vue.options 和用户的选项合并

src/core/instance/init.js

```js
+import { mergeOptions } from '../util/options';
export function initMixin(Vue) { // 就是给Vue增加init方法的
  Vue.prototype._init = function (options) { // 用于初始化操作
    const vm = this;
-   vm.$options = options; // 将用户的选项挂载到实例上
+   vm.$options = mergeOptions(this.constructor.options, options); // 将全局指令(如Vue.mixin)和用户的选项合并，挂载到实例上

    // 初始化状态（进行数据劫持）
    initState(vm);

    if (options.el) {
      vm.$mount(options.el); // 如果选项有el, 调用$mount挂载数据
    }
  }
}
```
这样，vm.$options 里就合并包含了用户的 options 和 Vue.mixin 的 options 了

## 2. 生命周期的实现

vm.$options 对象就包含了选项里的生命周期函数，只用在特定时机触发生命周期函数队列即可

src/core/instance/lifecycle.js

```js
export function callHook(vm, hook) { // 定义钩子函数
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach(handler => handler.call(vm));
  }
}
```

调用钩子函数

```js
import { initState } from './state';
import { mergeOptions } from '../util/options';
+import { callHook } from './lifecycle';

export function initMixin(Vue) { // 就是给Vue增加init方法的
  Vue.prototype._init = function (options) { // 用于初始化操作
    const vm = this;
    // vm.$options = options; // 将用户的选项挂载到实例上
    vm.$options = mergeOptions(this.constructor.options, options); // 将全局指令(如Vue.mixin)和用户的选项合并，挂载到实例上

    // 初始化状态前调用 beforeCreate 生命周期
+   callHook(vm, 'beforeCreate');
    // 初始化状态（进行数据劫持）
    initState(vm);
    // 初始化状态后调用 created 生命周期
+   callHook(vm, 'created');
    
    if (options.el) {
      vm.$mount(options.el); // 如果选项有el, 调用$mount挂载数据
    }
  }
}
```

使用 callHook 在特定时机触发生命周期钩子 hook 就实现了 vue 中的生命周期



