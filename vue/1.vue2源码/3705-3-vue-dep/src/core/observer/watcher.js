/**
 * 渲染vm._update(vm._render()), 收集dep
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/watcher.js
 */
import Dep from './dep';
let id = 0;

/**
 * 观察者模式
 * 每个属性有一个dep, 属性就是被观察者, watcher就是观察者（属性变化了会通知观察者来更新）=> 观察者模式
*/

// 不同组件有不同的watcher  目前只有一个渲染根实例的
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    
    this.deps = [];  // 让watcher记住dep集合；实现计算属性，和一些清理工作需要用到
    this.depsId = new Set(); // 去重

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