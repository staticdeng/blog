# computed和watch原理

#### computed原理总结

1. computed 对比 watch 来说，computed 有缓存

2. 原理实现过程

* 计算属性就是一个defineProperty的重新定义

* 计算属性使用dirty来控制缓存; dirty初始化为ture, 模板取值执行一次计算属性getter并保存该值，然后dirty为false，下一次的模板取值ditry为flase则不执行getter

* 计算属性实现视图更新：在模板取值阶段，利用栈，计算属性的依赖属性dep，将计算属性watcher和渲染watcher收集起来；在依赖属性更新时，dep依次通知计算属性watcher更新dirty为ture，渲染watcher重新渲染视图，模板重新取值计算属性的getter，视图更新

#### watch 原理总结

## 一、computed 原理

### 1.1 用法

* computed 有 `fullname` 和 `fullname2` 两种形式的写法

* computed 有缓存，表现为模板中多次调用 `fullname`，日志只会打印一次 `run fullname getter`

例子1：

```html
<div id="app">
  {{fullname}} {{fullname}} {{fullname2}}
</div>
```

```js
<script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.14/vue.js"></script>
<script>
  const vm = new Vue({
    el: '#app',
    data: {
      firstname: 'xiao',
      lastname: 'ming',
    },
    computed: {
      // 写法1
      fullname() { // defineProperty中的get方法
        console.log('computed =>', 'fullname getter'); // computed 有缓存，模板多次调用只会执行一次该日志
        return this.firstname + this.lastname
      },
      // 写法2
      fullname2: {
        get(){
          console.log('computed =>', 'fullname2 getter');
          return this.firstname + this.lastname
        },
        set(newVal){
          console.log(newVal)
        }
      }
    }
  });

  setTimeout(() => {
    vm.lastname = 'hu'; // 会执行什么？ 执行计算属性watcher更新操作  dirty = true;
  }, 1000)
```

### 1.2 计算属性就是一个defineProperty

计算属性和data响应式一样，都是用Object.defineProperty实现数据的更新

computed 配置项的对象 key 值会被遍历监听：

在初始化 initState 方法中，增加初始化 initComputed; 

src/core/instance/state.js

```js
export function initState(vm) {
  const opts = vm.$options; // 获取所有的选项
  if (opts.data) {
    initData(vm);
  }

+ if (opts.computed) {
+   initComputed(vm);
+ }
}
```

initComputed 中，遍历 computed 选项，使用Object.defineProperty 监听计算属性的 key，放到 vm 上；这样模板中就可以直接拿到计算属性

```js
function initComputed(vm) {
  const computed = vm.$options.computed;
  
  for (let key in computed) {
    let userDef = computed[key];

    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const getter = typeof userDef === 'function' ? userDef : userDef.get;
  const setter = userDef.set || (() => { });

  // 可以通过vm拿到对应的计算属性
  Object.defineProperty(target, key, {
    get: getter,
    set: setter
  })
}
```

但是这样实现的计算属性，在模板中多次调用同一个属性，计算属性会取多次值，造成性能浪费

### 1.3 计算属性增加缓存

```html
<div id="app">
  {{fullname}} {{fullname}}
</div>
```

在模板中多次调用同一个计算属性，控制台输出多次日志：

```js
computed => fullname getter
computed => fullname getter
```

计算属性依赖的值发生变化才会重新执行用户的方法；计算属性中要维护一个dirty属性，默认计算属性不会立刻执行，当模板中使用的时候才会执行计算属性的getter

生成一个计算属性watcher，传入计算属性的getter、dirty：

```js
+import Watcher from '../observer/watcher';

function initComputed(vm) {
  const computed = vm.$options.computed;
+ const watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上
  for (let key in computed) {
    let userDef = computed[key];

    // 计算属性中的getter
+   let fn = typeof userDef === 'function' ? userDef : userDef.get

    // 将计算属性和计算属性watcher对应起来，传入dirty
+   watchers[key] = new Watcher(vm, fn, { dirty: true })

    defineComputed(vm, key, userDef);
  }
}

```

在Watcher中，通过dirty控制getter的执行：

```js
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    // this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.deps = [];  // 让watcher记住dep集合；实现计算属性，和一些清理工作需要用到
    this.depsId = new Set(); // 去重

+   this.dirty = options.dirty; // 计算属性缓存值
+   this.vm = vm;
-   // this.get();
+   this.value = this.dirty ? undefined : this.get(); // 计算属性则不立即执行getter
  }

  // dirty 控制缓存
+ evaluate() {
+  this.value = this.get();
+  this.dirty = false; // dirty: false 下次就不执行该计算属性，加了缓存
+ }

  get() {
    // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值走到响应式数据的get上，通过Dep.target 取到watcher实例收集
    Dep.target = this; // 静态属性就是只有一份
-   // this.getter();
+   let value = this.getter.call(this.vm);
    Dep.target = null; // 渲染完毕后就清空
+   return value;
  }

  ...
}

export default Watcher
```

在计算属性的getter中，dirty 为 true 执行计算属性，为 false 则为缓存状态：

```js
function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => { });

  // 可以通过vm拿到对应的计算属性
  Object.defineProperty(target, key, {
+   get: createComputedGetter(key),
    set: setter
  })
}

+function createComputedGetter(key) {
+ return function () {
+   // 获取到对应属性的watcher
+   const watcher = this._computedWatchers[key];
+   // 缓存：dirty 为 true 执行计算属性，为 false 则为缓存状态
+   if (watcher.dirty) {
+     // 如果是脏的就执行计算属性watcher的fn
+     watcher.evaluate();
+   }
    
+   return watcher.value;
+ }
+}
```

加上缓存后，在模板中多次调用同一个计算属性，控制台只输出1次日志：

```js
computed => fullname getter
computed => fullname getter
```

### 1.4 计算属性watcher和渲染watcher

Dep.target 是一个全局变量，既有计算属性watcher又有渲染watcher；想要维护同一个全局变量 Dep.target，则需要栈.

src/core/observer/dep.js

```js
Dep.target = null;
let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
  // console.log('pushTarget', stack, Dep.target);
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
  // console.log('popTarget', stack, Dep.target);
}
```

在 Watcher 类中，栈来收集 watcher:

src/core/observer/watcher.js

```js
+import Dep, { popTarget, pushTarget } from './dep';
class Watcher {
  ...
  get() {
    // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值走到响应式数据的get上，通过Dep.target 取到watcher实例收集
-   // Dep.target = this; // 静态属性就是只有一份
+   pushTarget(this);
    let value = this.getter.call(this.vm); // 会去vm上取值  vm._update(vm._render) 取name 和age
-   // Dep.target = null; // 渲染完毕后就清空
+   popTarget(); // 渲染完毕后就清空
    return value;
  }
  ...
}
```

此时计算属性 watcher 的依赖属性 dep 已经收集了计算属性 watcher；在栈的出栈过程中，继续让依赖属性收集渲染 watcher:

src/core/instance/state.js

```js
function createComputedGetter(key) {
  return function () {
    // 获取到对应属性的watcher
    const watcher = this._computedWatchers[key];
    // 缓存：dirty 为 true 执行计算属性，为 false 则为缓存状态
    if (watcher.dirty) {
      // 如果是脏的就执行计算属性watcher的fn
      watcher.evaluate();
    }
    
+   if (Dep.target) { // 此时计算属性watcher出栈了, Dep.target 为渲染watcher
+     // 计算属性watcher出栈后，还需要让计算属性watcher里面的依赖属性，也去收集上一层的渲染watcher
+     watcher.depend();
+   }
    return watcher.value;
  }
}
```

计算属性watcher里面的依赖属性，收集上一层的渲染watcher:

```js
class Watcher {
  ...
  // 计算属性的 depend 方法
+ depend() {
+   let i = this.deps.length;
+   while (i--) {
+     // 计算属性的依赖属性，在这里收集渲染watcher
+     this.deps[i].depend();
+   }
+ }
  ...
}
```

此时，计算属性的依赖属性已经收集了计算属性 watcher 和渲染 watcher；在依赖属性发生更新时，在计算属性 watcher 的update方法里将dirty缓存打开：

```js
class Watcher {
  ...
  update() {
    // this.get();
+   if (this.lazy) { // 是否是计算属性watcher
+     // 计算属性getter里依赖的值变化了，就触发计算属性watcher的update
+     // 标识计算属性是脏值了dirty: true，后续渲染模板重新执行计算属性的getter
+     this.dirty = true;
    } else {
      queueWatcher(this); // 把当前的watcher 暂存起来
    }
  }
  ...
}
```

此后，页面计算属性缓存失效，视图发生更新。

