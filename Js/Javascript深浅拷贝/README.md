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

参考资料：

[冴羽-JavaScript专题之深浅拷贝](https://github.com/mqyqingfeng/Blog/issues/32)

[对象深拷贝和浅拷贝](https://juejin.im/post/5c26dd8fe51d4570c053e08b#heading-0)