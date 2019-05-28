# 前端性能优化专题之重绘和回流

在浏览器中，css性能会让javascript变慢，这是因为css线程(ui线程)和javascript线程是互斥关系。这是因为javascript引擎可能需要css渲染的结果，获取css相关样式，然后去作相应的处理。所以当css线程执行的时候，javascript线程被冻结直到css线程执行完，反之同理。所以如果频繁触发重绘和回流，会导致ui频繁渲染，最终导致js变慢。

## 什么是重绘和回流

* 回流reflow

当render tree中一部分（或全部）因为元素的尺寸，布局，隐藏等改变而需要重新构建，成为回流。简单来说，只要布局（元素位置、大小）发生变化了，就会产生回流。

场景：当浏览手淘页面的时候，向下滑动页面，会不断有图片加到dom树上，页面布局发生变化，会触发回流。

* 重绘repaint

当render tree中影响元素外观、风格的属性发生变化，而不会影响布局的（比如background），就会触发重绘。简单来说，当视觉效果发生改变，就会发生重绘。

回流在页面布局发生变化的同时，也会触发外观重新变化，所以**回流一定会引起重绘，而重绘不一定会引起回流**。

## 重绘和回流css属性

触发页面重新布局的属性：

* 盒子模型相关属性

```css
width height padding margin display border
```

* 定位属性及浮动

```css
top bottom left right position float clear
```

* 改变节点内部文字结构等属性

```css
text-align line-height overflow font-family font-size font-weight
```

只触发重绘的属性：

```css
color border-radius visibility background outline box-shadow
```

## 重绘和回流的性能优化

* 避免使用触发重绘回流的css属性

* 将重绘、回流的影响控制在**单独的图层**之内

在chrome浏览器的调试模式下，勾选DevTools--More tools--Layers，在手淘页面下，就可以看到很多layers，这就是图层。
 
所以，可以通过下面的方式来进行重绘和回流的性能优化：

* 用translate代替top改变

* 用opacity代替visibility

* 不要一条一条地修改dom的样式，预先定义好class，然后修改dom的className

* 把dom离线后修改

* 不要把dom节点的属性值放到一个循环里当成循环里的变量

* 不要使用table布局，可能很小的一个小改动会造成整个table的重新布局

* 动画实现的速度的选择

* 对于动画新建图层

* 启用GPU硬件加速

参考文档：

[你真的了解回流和重绘吗-腾讯IVWEB团队](https://juejin.im/post/5c6cb7b4f265da2dae511a3d)

[渲染机制及重绘和回流](https://juejin.im/post/5c6c182ee51d45760b1c8e30)