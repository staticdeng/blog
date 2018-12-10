/**
 * es5是通过回调来解决异步问题
 * 不止一个异步的时候，就要频繁嵌套，造成回调/嵌套地狱
 */
{
    function Hello(){
        setTimeout(function(){
            console.log('Hello')
        },1000)
    }
    function Word(){
        console.log('Word')
    }
    Hello()
    Word()
    // 输出
    // Word
    // Hello
}

{
    function Hello(fn){
        setTimeout(function(){
            console.log('Hello')
            fn() // 把函数放在异步里并且最后执行，解决异步问题
        },1000)
    }
    function Word(){
        console.log('Word')
    }
    Hello(function(){
        Word()
    })
    // 输出
    // Hello
    // Word
}

{
    // 多个异步就需要频繁嵌套，造成嵌套地狱
    function Hello(fn){
        setTimeout(function(){
            console.log('Hello')
            fn()
        },1000)
    }
    function Word(fn){
        setTimeout(function(){
            console.log('Word')
            fn()
        },1000)
    }
    function language(){
        console.log('language')
    }
    Hello(function(){
        Word(function(){
            language()
        })
    })
}