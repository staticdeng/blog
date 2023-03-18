let a = 1;
let obj = { a: ()=>a };
console.log(obj.a());
a = 2;
console.log(obj.a());