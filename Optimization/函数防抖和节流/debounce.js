/**
 * 第一版函数防抖：
    var timer; // 维护同一个timer
    function debounce(fn, delay) {
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn();
        }, delay);
    }

    // test
    function testDebounce() {
        console.log('test');
    }
    document.onmousemove = () => {
        debounce(testDebounce, 1000);
    }
 * 
 */

// 优化后的防抖函数
function debounce(fn, delay) {
    var timer; // 维护一个 timer
    return function () {
        var _this = this; // 取debounce执行作用域的this
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            fn.apply(_this, args); // 用apply指向调用debounce的对象，相当于_this.fn(args);
        }, delay);
    };
}

// test
function testDebounce(e, content) {
    console.log(e, content);
}
var testDebounceFn = debounce(testDebounce, 1000); // 节流函数
document.onmousemove = function (e) {
    testDebounceFn(e, 'debounce'); // 给节流函数传参
}



