let obj = {};
let ageValue = 10;

Object.defineProperty(obj, 'age', {
    get() {
        return ageValue;
    },
    set(newValue) {
        ageValue = newValue;
    },
    enumerable: true,//是否可枚举
    configurable:true//是否可配置
});
console.log(obj.age);
obj.age = 20;
console.log(obj.age);