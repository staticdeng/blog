//require.d(getter, { a: getter });

let getter = {};
Object.defineProperty(getter, 'a', {
    get: () => { // getter
        return 'aValue'
    }
});

console.log(getter.a());

require.n = (exports) => {
    var getter = () => exports;
    return getter;
}
//xx就是一个普通函数，不是一个getter
var xx = () => 'aValue';
console.log(xx());
