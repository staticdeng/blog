# Javascript深浅拷贝

js深浅拷贝在平时的开发中很常见，为了更彻底了解深浅拷贝，我们先来看看引用类型的值是如何复制的，由此引出js中的数据类型。

## js数据类型

js数据类型可分为两种：

* 基本类型：undefined,null,Boolean,String,Number,Symbol

* 引用类型：Object,Array,Date,Function,RegExp等

其中这两种不同类型的值的复制方式不同，区别在于**引用类型的值的复制是内存地址的复制**，而不是像基本类型进行值的复制，内存地址其实是一个指针，指向存储在堆内存中的同一个对象。所以**引用类型的值的复制仅仅是复制了引用，彼此之间的操作会互相影响**。

```js
let obj = {
    key: 1
}
let obj2 = obj

// 改变obj变量的值会影响obj2变量的值
obj.key = 2
console.log(obj) // -> { key: 2 }
console.log(obj2) // -> { key: 2 }

console.log(obj === obj2) // 同一个内存地址 -> true
```

上面仅仅改变了obj.name的值，结果obj2.name的值也跟着改变了。

再来看一个例子：

```js
let obj = {
    key: 1
}
let obj2 = {
    key: 1
}
console.log(obj === obj2) // 不同的内存地址 -> false
```
新建两个一样的对象obj和obj2，而不是通过引用赋值的方式，结果obj !== obj2，这是因为这种情况下obj和obj2的内存地址是两个不同的地址，所以不相等，如果是基本类型的值就相等了。

## 浅拷贝和深拷贝

上面引用类型的值的复制，其实就是浅拷贝，清楚了什么是浅拷贝，来看看浅拷贝的深拷贝的区别：

* 浅拷贝：仅仅是复制了引用，彼此之间的操作会互相影响

* 深拷贝：在堆中重新分配内存，不同的内存地址，互不影响

## js原生方法中的深浅拷贝

以下是一些JavaScript提供的浅拷贝方法：

### Object.assign

`Object.assign`方法用于对象的合并，将源对象（source）的所有可枚举属性，复制到目标对象（target）。

语法：

```js
Object.assign(target, source1, source2);
```

Object.assign方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。

```js
var obj = { a: 1, b: { c: 1 } }
var obj2 = {}
Object.assign(obj2, obj)
obj.a = 2
console.log(obj) // {a:2,b:{c:1}}
console.log(obj2) // {a:1,b:{c:1}}

obj.b.c = 2;
console.log(obj); // {a:2,b:{c:2}}
console.log(obj2); // {a:1,b:{c:2}}
```

上面的代码可以看到，如果Object.assign的源对象某个属性的值是基本类型的值，会直接进行拷贝；如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。所以Object.assign() 只是一级属性复制，比浅拷贝多深拷贝了一层而已。

### 扩展运算符

利用扩展运算符可以在构造字面量对象时,进行克隆或者属性拷贝

```js
var obj = { a: 1, b: { c: 1 } }
var obj2 = {...obj}
obj.a = 2
console.log(obj) // {a:2,b:{c:1}}
console.log(obj2) // {a:1,b:{c:1}}

obj.b.c = 2;
console.log(obj); // {a:2,b:{c:2}}
console.log(obj2); // {a:1,b:{c:2}}
```

扩展运算符Object.assign()有同样的缺陷，对于属性的值是对象的情况，拷贝得到的是这个对象的引用，无法完全拷贝成2个不同对象。

### Array.prototype.slice

```js
let a = [[1, 2], 3, 4];
let b = a.slice();
console.log(a === b); // -> false

a[0][0] = 0;
console.log(a); // -> [[0, 2], 3, 4]
console.log(b); // -> [[0, 2], 3, 4]
```

Array的slice方法并不是真正的深拷贝，对于Array的第一层的元素是深拷贝，而Array的第二层slice方法是复制引用。

### Array.prototype.concat

Array的concat方法和slice类似，也是浅拷贝。

```js
let a = [[1, 2], 3, 4];
let b = a.concat();
console.log(a === b); // -> false

a[0][0] = 0;
console.log(a); // -> [[0, 2], 3, 4]
console.log(b); // -> [[0, 2], 3, 4]
```

js也提供了深拷贝的方法：

### JSON.stringify()和JSON.parse()

JSON.stringify()是目前前端开发过程中最常用的深拷贝方式，原理是把一个对象序列化成为一个JSON字符串，将对象的内容转换成字符串的形式再保存在磁盘上，再用JSON.parse()反序列化将JSON字符串变成一个新的对象。

```js
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}
```
但是这种方式无法拷贝不可枚举的属性，无法拷贝对象的原型链；拷贝的对象的值中如果有函数,undefined,symbol则经过JSON.stringify()序列化后的JSON字符串中这个键值对会消失等问题。


## 动手实现深浅拷贝

下面动手来实现一个对象或者数组的浅拷贝。

### 浅拷贝的实现

数组或对象的浅拷贝的原理是，遍历对象，然后把属性和属性值都放在一个新的对象返回。

```js
var shallowCopy = function(obj) {
    // 只拷贝对象
    if (typeof obj !== 'object') return;
    // 根据obj的类型判断是新建一个数组还是对象
    var newObj = obj instanceof Array ? [] : {};
    // 遍历obj，并且判断是obj的属性才拷贝
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}
```

### 深拷贝的实现

那如何实现一个深拷贝呢？说起来也好简单，我们在拷贝的时候判断一下属性值的类型，如果是对象，我们递归调用深拷贝函数不就好了~

```js
var deepCopy = function(obj) {
    if (typeof obj !== 'object') return;
    var newObj = obj instanceof Array ? [] : {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
        }
    }
    return newObj;
}
```

尽管使用深拷贝会完全的克隆一个新对象，不会产生副作用，但是深拷贝因为使用递归，性能会不如浅拷贝，在开发中，还是要根据实际情况进行选择。

参考资料：

[冴羽-JavaScript专题之深浅拷贝](https://github.com/mqyqingfeng/Blog/issues/32)

[对象深拷贝和浅拷贝](https://juejin.im/post/5c26dd8fe51d4570c053e08b#heading-0)

[JavaScript深浅拷贝](https://juejin.im/post/5b00e85af265da0b7d0ba63f)