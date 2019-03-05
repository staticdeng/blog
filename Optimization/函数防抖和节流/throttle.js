/**
 * 时间戳实现节流函数：
 */
/*
function throttle(fn, delay) {
    var previous = 0;
    // 使用闭包返回一个函数并且用到闭包函数外面的变量previous
    return function() {
        var _this = this;
        var args = arguments;
        var now = new Date();
        if(now - previous > delay) {
            fn.apply(_this, args);
            previous = now;
        }
    }
}

// test
function testThrottle(e, content) {
    console.log(e, content);
}
var testThrottleFn = throttle(testThrottle, 1000); // 节流函数
document.onmousemove = function (e) {
    testThrottleFn(e, 'throttle'); // 给节流函数传参
}
*/

/**
 * 定时器实现节流函数：
 */

function throttle2(fn, delay) {
    var timer;
    return function () {
        var _this = this;
        var args = arguments;
        if (timer) {
            return;
        }
        timer = setTimeout(function () {
            fn.apply(_this, args);
            timer = null; // 在delay后执行完fn之后清空timer，此时timer为假，throttle触发可以进入计时器
        }, delay)
    }
}

// test
function testThrottle2(e, content) {
    console.log(e, content);
}
var testThrottleFn2 = throttle2(testThrottle2, 1000); // 节流函数
document.onmousemove = function (e) {
    testThrottleFn2(e, 'throttle2'); // 给节流函数传参
}
