# vue依赖收集原理

#### 依赖收集原理总结

* 初始化响应式数据阶段给每个属性添加一个收集器dep实例负责收集依赖和通知依赖更新，随后的组件初始化渲染阶段 mountComponent 中 new 一个 Watcher 负责渲染 (一个组件对应一个watcher)

* watcher 的渲染函数vm._render， 会触发响应式数据属性的get监听；get 里通过dep实例收集依赖记住当前watcher，set 里dep.notify通知watcher重新渲染更新

* 所以vue中可以做到局部渲染更新，一个组件对应一个watcher，<b>vue可以通过拆分组件减小更新范围</b>；而react中则是整个组件树的渲染

## 1.观察者模式实现依赖收集

数据变化，想要自动更新视图：

* 我们可以给模板中的属性增加一个收集器 dep

* 页面渲染的时候，我们将渲染逻辑封装到watcher中   vm._update(vm._render())

* 让dep记住这个watcher即可，稍后属性变化了可以找到对应的dep中存放的watcher进行重新渲染

上面实现了观察者模式

* 每个属性有一个dep, 属性就是被观察者, watcher就是观察者（属性变化了会通知观察者来更新）=> 观察者模式

#### 1.1 渲染逻辑封装到watcher中

初始化组件渲染将vm._update(vm._render())当作参数传入Watcher，watcher.getter 接收：

src/core/observer/watcher.js

```js
import Dep from './dep'; // 稍后实现
let id = 0;

// 不同组件有不同的watcher  目前只有一个渲染根实例的
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.get();
  }

  get() {
    // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值走到响应式数据的get上，通过Dep.target 取到watcher实例收集
    Dep.target = this; // 静态属性就是只有一份
    this.getter(); // 会去vm上取值  vm._update(vm._render) 取name 和age
    Dep.target = null; // 渲染完毕后就清空
  }

  update() {
    this.get(); // getter重新渲染
  }
}

export default Watcher
```

在初始化挂载组件mountComponent中传入vm._update(vm._render)：

```js
export function mountComponent(vm, el) { // 这里的el 是通过querySelector处理过的
  vm.$el = el;
  // vm._update(vm._render()); // vm.$options.render() 虚拟节点

+ const updateComponent = ()=>{
+   vm._update(vm._render());
+ }
+ const watcher = new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher
+ console.log(watcher);
}
```

这样Watcher实例的this.getter()就有了渲染组件的功能

#### 1.2 dep收集依赖和通知更新

dep 负责收集watcher，通知watcher更新：

src/core/observer/dep.js

```js
let id = 0;
class Dep {
  constructor() {
    this.id = id++; // 属性的dep要收集watcher
    this.subs = []; // 这里存放着当前属性对应的watcher有哪些
  }
  depend() {
    // dep 记住 watcher
    this.addSub(Dep.target);
  }
  addSub(watcher) {
    // dep 记住 watcher
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach(watcher => watcher.update()); // 告诉watcher要更新了
  }
}
Dep.target = null;

export default Dep;
```

#### 1.3 给模板中的每个属性增加一个收集器 dep

需要给每个属性增加一个dep，目的就是收集watcher

在响应式数据中，每一个属性对应一个dep，在get的时候dep收集watcher，在set时dep通知watcher更新：

src/core/observer/index.js

```js
+import Dep from './dep';
function defineRective(target, key, value) { // value一直被使用，闭包
  observe(value); // 对深层对象都进行属性劫持

  let dep = new Dep(); // 每一个属性都有一个dep
  Object.defineProperty(target, key, {
    get() { // 取值的时候会执行get
      // console.log('get', value);
+     if (Dep.target){
+       dep.depend(); // 让这个属性的收集器dep记住当前的watcher
+     }
      return value;
    },
    set(newValue) { // 修改的时候会执行set
      console.log('set', newValue);
      if (newValue === value) return;

      observe(newValue); // 设置值为新的Object劫持新的Object属性

      value = newValue;

+     dep.notify(); // dep通知更新
    }
  });
}
```

这样就实现了数据变化，自动更新视图了。

#### 1.4 dep 和 watcher 多对多关系

* 一个组件中有多个属性(dep)，一个组件中只有一个watcher实例；所以一个 watcher 对应多个 dep

* 1个属性可以用在多个组件中；所以1个dep对应多个watcher

在dep中记住了watcher，watcher中也需要记录dep，用于后续计算属性或者数据清理：

src/core/observer/watcher.js

```js
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    
+   this.deps = [];  // 让watcher记住dep集合；实现计算属性，和一些清理工作需要用到
+   this.depsId = new Set(); // 去重

    this.get();
  }

  get() {
    Dep.target = this; // 静态属性就是只有一份
    this.getter(); // 会去vm上取值  vm._update(vm._render) 取name 和age
    Dep.target = null; // 渲染完毕后就清空
  }

  update() {
    this.get(); // 重新渲染
  }

+ addDep(dep) { // 一个组件对应着多个属性
+   let id = dep.id;
+   // 重复的属性不记录
+   if (!this.depsId.has(id)) {
+     this.deps.push(dep);
+     this.depsId.add(id);
+     dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住watcher
+   }
+ }
}

export default Watcher
```
src/core/observer/dep.js

```js
let id = 0;
class Dep {

  depend() {
    // dep 记住 watcher
-   // this.addSub(Dep.target);

    // dep 和 watcher是一个多对多的关系
    // 一个组件中由多个属性组成 （一个 watcher 对应多个dep）
    // 一个属性可以在多个组件中使用 (一个dep 对应多个watcher)
+   Dep.target.addDep(this); // 让watcher记住dep
  }

  addSub(watcher) {
    // dep 记住 watcher
    this.subs.push(watcher);
  }
}
```

## 2.异步更新与nextTick原理

```js
const vm = new Vue({
  data: {
    name: 'xiaoming',
    age: 20,
  },
  el: '#app',
});

// 自动更新视图
setTimeout(() => {
  vm.age = 28;
  vm.age = 29;
  vm.age = 30;
}, 2000);
```

上面例子中多次更新属性age，会触发多次更新视图，性能浪费。

遇到这种情况，如何处理呢？

* 多次执行需要合并为一次，弄个变量开个异步 (任务放入缓存队列，弄个变量防抖，开个异步执行缓存队列任务)

这样同步代码执行完，异步更新就只需一次了

#### 2.1 缓存watcher, 异步更新

多次更新，把watcher缓存起来，等同步执行后再执行异步更新

src/core/observer/watcher.js

```js
+import { queueWatcher } from './scheduler';
class Watcher {
  ...
  update() {
-   // this.get();
+   queueWatcher(this); // 把当前的watcher 暂存起来
  }

+ run() {
+   this.get(); // 缓存起来，异步更新队列只会执行一次，不再多次渲染了
+ }
}
```

src/core/observer/scheduler.js

```js
let queue = []; // 队列
let has = {}; // 去重
let waiting = false; // 防抖

// 执行缓存队列
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  waiting = false;
  flushQueue.forEach(q => q.run()); // 在刷新的过程中可能还有新的watcher，重新放到queue中
}

export function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) { // 去重watcher
      has[id] = true;
      queue.push(watcher); // 缓存watcher
      // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
      if (!waiting) {
        setTimeout(flushSchedulerQueue, 0);
        waiting = true;
      }
  }
}
```

这样把watcher缓存起来，异步更新队列只会执行一次watcher渲染，不会多次渲染了

#### 2.2 nextTick原理

nextTick 和上面逻辑类似，也是多个nextTick的回调任务执行合并为一次执行

* 多次任务执行合并为一次：任务加入队列，弄个变量加个异步

src/core/util/next-tick.js

将多次任务执行合并为一次执行抽离：

```js
let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach(cb => cb()); // 按照顺序依次执行
}

export function nextTick(cb) { // 先内部还是先用户的？
  callbacks.push(cb); // 维护nextTick中的cakllback方法
  if (!waiting) {
    Promise.resolve().then(flushCallbacks);
    waiting = true;
  }
}
```

queueWatcher使用nextTick：

src/core/observer/scheduler.js

```js
+import { nextTick } from '../util/next-tick';

let queue = []; // 队列
let has = {}; // 去重
-let waiting = false; // 防抖

// 执行缓存队列
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
- waiting = false;
  flushQueue.forEach(q => q.run()); // 在刷新的过程中可能还有新的watcher，重新放到queue中
}

export function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) { // 去重watcher
    has[id] = true;
    queue.push(watcher); // 缓存watcher
    // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
-   if (!waiting) {
-    setTimeout(flushSchedulerQueue, 0);
-     waiting = true;
-   }

+   nextTick(flushSchedulerQueue);
  }
}
```

在组件中使用nextTick:

src/core/instance/index.js

```js
import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
+import { nextTick } from '../util/next-tick';

// 避免将所有的方法都耦合在一起，使用构造函数的方式，不使用类的方式
function Vue(options) { 
  // options就是用户的选项
  this._init(options); // 默认就调用了init
}

+Vue.prototype.$nextTick = nextTick;

initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

export default Vue;
```

组件中使用$nextTick:

```js
const vm = new Vue({
  data: {
    name: 'xiaoming',
    age: 20,
  },
  el: '#app',
});

vm.age = 30;
console.log('获取不到新的dom', app.innerHTML);

// nextTick不是创建了一个异步任务，而是将这个任务维护到了队列中而已 
vm.$nextTick(()=>{
  console.log('获取到新的dom', app.innerHTML);
});
```

* 所以，vue组件中nextTick不是创建了一个异步任务，而是将这个任务维护到了队列中而已
