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
lazyload()//刚开始还没滚动屏幕时，要先触发一次函数，初始化首页的页面图片
document.addEventListener('scroll', lazyload)
