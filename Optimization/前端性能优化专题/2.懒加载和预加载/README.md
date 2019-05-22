# 前端性能优化专题之懒加载和预加载

在web性能优化中，还有一类和图片分不开的优化技术叫懒加载和预加载。

## 懒加载

懒加载也称延迟加载，是指图片进入可视区域之后才请求图片，这样可以提升用户体验，减少无效资源的加载，防止并发加载的资源过多而阻塞js的加载。

### 懒加载的原理

* 先把需要懒加载图片的src属性设置为空，这样图片就不会自动加载，图片的真实路径放到data-original属性中

* 获取有data-original和lazyload属性的所有图片，在浏览器scroll事件中监听，当图片的top到可视区域的距离小于可视区域的高度，则图片进入可视区域，将图片的 src属性设置为data-original的值

* 用getBoundingClientRect()可以获取图片相对浏览器可视区域的左右上下的距离

### 懒加载的实现

html结构如下：

```html
<style>
    .image-item {
        display: block;
        margin-bottom: 50px;
        height: 300px;
        width: 100%;
        background: #ccc;
        /* 需要加图片高度 */
    }
</style>
<img src="" class="image-item" lazyload="true" data-original="http://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig.jpg" />
<img src="" class="image-item" lazyload="true" data-original="http://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig-001.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig-002.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig-003.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig-004.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/26/haian_fengjig-008.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/09/xiaoxi_liushui-001.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201810/09/xiaoxi_liushui-004.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201712/29/dahai-005.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201712/29/dahai-006.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201712/29/dahai-007.jpg" />
<img src="" class="image-item" lazyload="true" data-original="https://img.ivsky.com/img/tupian/pre/201712/29/dahai-008.jpg" />

<script src="./lozyload.js"></script>
```

lozyload.js：

```js
var viewHeight = document.documentElement.clientHeight //获取可视区高度
function lazyload() {
    var imgs = document.querySelectorAll('img[data-original][lazyload]')
    Array.prototype.forEach.call(imgs, function (item, index) {
        if (item.dataset.original === '') return
        var rect = item.getBoundingClientRect() // 用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
        if (rect.bottom >= 0 && rect.top < viewHeight) { // 当图片的top到可视区域的距离小于可视区域的高度并且图片的bottom在可视区域里
            !function () {
                var img = new Image()
                img.src = item.dataset.original
                img.onload = function () {
                    item.src = img.src
                }
                item.removeAttribute('data-original')//移除属性，下次不再遍历
                item.removeAttribute('lazyload')
            }()
        }
    })
}
lazyload() // 刚开始还没滚动屏幕时，要先触发一次函数，初始化首页的页面图片
document.addEventListener('scroll', lazyload)
```

## 预加载

预加载和懒加载相反，提前加载，是指图片等静态资源在使用之前提前请求，使用时能从缓存中加载，提升用户体验。

### 预加载的实现

* 使用HTML标签，将需要预加载的图片通过img标签加载并隐藏，使用的时候就直接从缓存里面读取

<img src="http://pic26.nipic.com/20121213/6168183 0044449030002.jpg" style="display:none"/>

* 使用Image对象

```js
var image= new Image()
image.src="http://pic26.nipic.com/20121213/6168183 004444903000 2.jpg"
```

* 使用XMLHttpRequest对象，存在跨域问题需要解决跨域，但会精细控制预加载过程，如可以获取加载进度

```js
var xmlhttprequest = new XMLHttpRequest();
xmlhttprequest.onreadystatechange = callback;
xmlhttprequest.onprogress = progressCallback;
xmlhttprequest.open("GET", "http://image.baidu.com/mouse,jpg", true);
xmlhttprequest.send();
function callback() {
    if (xmlhttprequest.readyState == 4 && xmlhttprequest.status == 200) {
        var responseText = xmlhttprequest.responseText;
    } else {
        console.log("Request was unsuccessful:" + xmlhttprequest.status);
    }
}
function progressCallback(e) {
    e = e || event;
    if (e.lengthComputable) {
        console.log("Received" + e.loaded + "of" + e.total + "bytes")
    }
}
```

* 使用第三方库：[PreloadJS库](https://createjs.com/preloadjs)

## 懒加载和预加载的对比

两者都是提高页面性能有效的办法，两者主要区别是一个是迟缓甚至不加载，一个是提前加载。懒加载对服务器前端有一定的缓解压力作用，预加载则会增加服务器前端压力。

参考链接：

[懒加载和预加载](https://juejin.im/post/5b0c3b53f265da09253cbed0)