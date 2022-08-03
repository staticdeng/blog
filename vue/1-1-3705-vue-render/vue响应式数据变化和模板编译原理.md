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

## 2. 响应式原理

vue 响应式数据变化原理也就是数据变化了可以监控到数据的变化，数据的取值和更改值需要监控到；响应式就是对象属性的劫持和数组方法的劫持

### 2.1 属性/数据代理

```html
<script src="vue.js"></script>
<script>
  const vm = new Vue({
    data: {
      name: 'xiaoming'
    }
  });
</script>
```

在实例化vue后，因为把数据放到了vm._data上，vm._data.name才能访问name，直接vm.name则需要属性代理

src/core/instance/state.js

```js
function initData(vm) {
  let data = vm.$options.data; // data可能是函数和对象
  data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象
  vm._data = data; // 我将返回的对象放到了_data上
  // console.log(data);

+ for(let key in data) {
+   proxy(vm, '_data', key);
+ }

}

// 属性/数据代理：将vm.key的取值和设置值代理到vm._data.key上
+function proxy(vm, sourceKey, key) {
+  Object.defineProperty(vm, key, {
+   get() {
+      return vm[sourceKey][key];
+    },
+    set(newValue) {
+      vm[sourceKey][key] = newValue;
+    }
+  })
+}
```

当vm.name访问数据的时候，实际上代理到vm._data.name上了，这就是属性代理，设置值同理

### 2.1 对象属性的劫持

初始化数据时，需要初始化使用Obejct.defineProperty重新定义所有的对象属性来监听劫持后面可能发生的数据变化

src/core/instance/state.js

```js
+import { observe } from '../observer/index';

export function initState(vm) {
  ...
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data; // data可能是函数和对象
  data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象
  vm._data = data; // 我将返回的对象放到了_data上

  // 初始化数据劫持：vue 里采用了一个api defineProperty
+ observe(data);

  for(let key in data) {
    proxy(vm, '_data', key);
  }
}
```

对象属性劫持和数组方法劫持写于Observer/index.js

src/core/Observer/index.js

```js
// 劫持类
class Observer{
  constructor(data) {
    // 对象属性劫持
    this.walk(data);
  }
  // 遍历对象属性，对属性依次劫持
  walk(data) {
    // "重新定义"所有的属性，在vue2中性能差
    Object.keys(data).forEach(key => defineRective(data, key, data[key]));
  }
}


// 属性劫持(重新定义对象属性为响应式)
function defineRective(target, key, value) { // value一直被使用，闭包
  observe(value); // 对深层对象都进行属性劫持

  Object.defineProperty(target, key, {
    get() { // 取值的时候会执行get
      console.log('get', value);
      return value;
    },
    set(newValue) { // 修改的时候会执行set
      console.log('set', newValue);
      if (newValue === value) return;

      observe(newValue); // 设置值为新的Object劫持新的Object属性

      value = newValue;
    }
  });
}

// 劫持入口
export function observe(data) {
  // 只对对象进行劫持
  if (typeof data !== 'object' || data === null) return;

  return new Observer(data);
}
```

测试验证：

dist/1.html

```html
<script>
const vm = new Vue({
  data: {
    name: 'xiaoming',
    address: {
      num: 30,
    },
  }
});

vm._data.name = 'xiaohu'; // 数据代理，下面直接vm.name
vm.name = 'xiaohu'; // 修改触发set
// 设置值为新的Object也要进行新Object的劫持
vm.address = {
  num: 20
}
console.log(vm); // 查看控制台，所有属性都被监听劫持有get和set
</script>
```

### 2.2 数组方法的劫持

