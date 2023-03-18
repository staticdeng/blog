/**
 * 渲染vm._update(vm._render()), 收集dep
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/watcher.js
 */
import Dep, { popTarget, pushTarget } from './dep';
import { queueWatcher } from './scheduler';

let id = 0;

/**
 * 观察者模式
 * 每个属性有一个dep, 属性就是被观察者, watcher就是观察者（属性变化了会通知观察者来更新）=> 观察者模式
*/

// 不同组件有不同的watcher  目前只有一个渲染根实例的
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    // this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
  
    this.deps = [];  // 让watcher记住dep集合；实现计算属性，和一些清理工作需要用到
    this.depsId = new Set(); // 去重

    this.lazy = options.dirty;
    this.dirty = this.lazy; // 计算属性缓存值
    this.vm = vm;
    // this.get();
    this.value = this.dirty ? undefined : this.get(); // 计算属性则不立即执行getter
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false; // dirty: false 下次就不执行该计算属性，加了缓存
  }

  get() {
    // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值走到响应式数据的get上，通过Dep.target 取到watcher实例收集
    // Dep.target = this; // 静态属性就是只有一份
    pushTarget(this);
    let value = this.getter.call(this.vm); // 会去vm上取值  vm._update(vm._render) 取name 和age
    // Dep.target = null; // 渲染完毕后就清空
    popTarget(); // 渲染完毕后就清空
    return value;
  }

  // 计算属性的 depend 方法
  depend() {
    let i = this.deps.length;
    while (i--) {
      // 计算属性的依赖属性，在这里收集渲染watcher
      this.deps[i].depend();
    }
  }

  update() {
    // this.get();
    if (this.lazy) { // 是否是计算属性watcher
      // 计算属性getter里依赖的值变化了，就触发计算属性watcher的update
      // 标识计算属性是脏值了dirty: true，后续渲染模板重新执行计算属性的getter
      this.dirty = true;
    } else {
      queueWatcher(this); // 把当前的watcher 暂存起来
    }
  }

  run() {
    // console.log('run');
    this.get(); // 重新渲染
  }

  addDep(dep) { // 一个组件对应着多个属性
    let id = dep.id;
    // 重复的属性不记录
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住watcher
    }
  }
}

export default Watcher