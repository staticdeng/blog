/**
 * 收集watcher，通知watcher
 * https://github.com/vuejs/vue/blob/2.6/src/core/observer/dep.js
 */
let id = 0;
class Dep {
  constructor() {
    this.id = id++; // 属性的dep要收集watcher
    this.subs = []; // 这里存放着当前属性对应的watcher有哪些
  }
  depend() {
    // dep 记住 watcher
    // this.addSub(Dep.target);

    // dep 和 watcher是一个多对多的关系
    // 一个组件中由多个属性组成 （一个 watcher 对应多个dep）
    // 一个属性可以在多个组件中使用 (一个dep 对应多个watcher)
    Dep.target.addDep(this); // 让watcher记住dep
  }
  addSub(watcher) {
    // dep 记住 watcher
    this.subs.push(watcher);
  }
  notify() {
    console.log('notify', this.subs);
    this.subs.forEach(watcher => watcher.update()); // 告诉watcher要更新了
  }
}

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

export default Dep;