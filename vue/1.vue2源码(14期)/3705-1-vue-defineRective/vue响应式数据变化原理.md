# vue响应式数据变化原理

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

dist/index.html

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

```html
<script>
  const vm = new Vue({
    data: {
      arr: [1, 2, 3],
    }
  });
  console.log(vm.arr);
</script>
```

如果还是按照劫持对象的方式来劫持数组的每一项，数组arr的每一项都被劫持会浪费性能，但是修改数组却很少用索引来操作数组；

修改数组都是通过方法来修改，push shift...等，所以需要重写数组上的方法，在重写的数组方法里对新增的数据进行劫持。

src/core/observer/index.js

```js
+import { newArrayProto } from './array';

// 劫持类
class Observer {
  constructor(data) {
    // data.__ob__ = this; // 这样写可枚举遍历到，会递归this可不行，需要设置为不可枚举
    // data.__ob__ = this 作用1.给数据加了一个标识，如果数据上有__ob__ 则说明这个属性被观测过了
    // data.__ob__ = this 作用2.在data.__ob__上挂载Observer的实例，可以供newArrayProto里面取observeArray方法

    // data.__ob__ = this改写为：
+   Object.defineProperty(data, '__ob__', {
+     value: this,
+     enumerable: false // 将__ob__ 变成不可枚举 （循环的时候无法获取到）
+   });

    // 数组劫持
+   if (Array.isArray(data)) {
+     // 在数据的实例原型上重写数组的部分方法，并且保留数组原有的特性
+     data.__proto__ = newArrayProto;
+     // 不用劫持数组的每一项，只用劫持数组中的对象
+     this.observeArray(data);
+   } else {
      // 对象属性劫持
      this.walk(data);
    }
  }
  // 遍历对象，对属性依次劫持
  walk(data) {
    // "重新定义"所有的属性，在vue2中性能差
    Object.keys(data).forEach(key => defineRective(data, key, data[key]));
  }
  // 劫持数组中的对象
+ observeArray(data) {
+   data.forEach(v => observe(v));
+ }
}


// 属性劫持(重新定义对象属性为响应式)
// Object.defineProperty只能劫持已经存在的属性，后增的或者删除的属性不会监听到（vue2里面会为此单独写一些api，如$set $delete）
function defineRective(target, key, value) { // value一直被使用，闭包
  ....
}

// 劫持入口
export function observe(data) {
  // 只对对象进行劫持
  if (typeof data !== 'object' || data === null) return;

+ // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)
+ if (data.__ob__ instanceof Observer) {
+   return data.__ob__;
+ }

  return new Observer(data);
}
```

重写数组的部分方法，并且保留数组原有的特性：

src/core/observer/array.js

```js
let oldArrayProto = Array.prototype; // 获取数组的原型

// 不要直接重写Array.prototype.push，否则会影响原生Array的push
export const newArrayProto = Object.create(oldArrayProto); // 拷贝一份，不影响数组原型上的方法
// 等价于newArrayProto.__proto__  = oldArrayProto

let methods = [ // 找到所有的变异方法
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
] // concat slice 都不会改变原数组

methods.forEach(method => {
  newArrayProto[method] = function (...args) { // 重写了数组的方法
    const result = oldArrayProto[method].call(this, ...args); // 内部调用原来的方法，函数的劫持
    // 需要对新增的数据再次进行劫持
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift': // arr.unshift(1,2,3)
        inserted = args;
        break;
      case 'splice':  // arr.splice(0,1,{a:1},{a:1})
        inserted = args.slice(2);
      default:
        break;
    }
    console.log('array inserted', inserted); // 新增的内容
    if(inserted) {
      // 对新增的内容再次进行观测  
      ob.observeArray(inserted);
    }
    return result;
  }
})
```

至此，实现了数组的方法劫持

