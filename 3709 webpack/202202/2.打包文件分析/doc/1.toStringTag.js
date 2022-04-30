console.log(Object.prototype.toString.call('foo'));//[object String]
console.log(Object.prototype.toString.call([1,2,3]));
console.log(Object.prototype.toString.call(3));
console.log(Object.prototype.toString.call(true));
console.log(Object.prototype.toString.call(undefined));
console.log(Object.prototype.toString.call(null));

let obj = {};
Object.defineProperty(obj,Symbol.toStringTag,{value:'Module'});
console.log(Object.prototype.toString.call(obj));

