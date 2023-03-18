/**
 * mergeOptions 合并对象
 */

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