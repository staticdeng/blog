/**
 * promise同步方式
 */
// 烧水
let boilWater = function() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('boilWater')
        }, 5000)
    })
}

// 洗杯子
let washGlass = function() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('washGlass')
        }, 1000)
    })
}

// 茶叶
let prepareTealeaves = function() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('prepareTealeaves')
        }, 2000)
    })
}

{
    var result = []
    console.time('promiseSync')
    boilWater().then(function(boilWater) {
        result.push(boilWater)
        return washGlass()
    }).then(function(washGlass) {
        result.push(washGlass)
        return prepareTealeaves()
    }).then(function(prepareTealeaves) {
        result.push(prepareTealeaves)
        console.log(result)
        console.timeEnd('promiseSync')
    })
}

// promise同步方式执行时间大于等于8s
// 怎么让执行时间大于等于5s?

/**
 * promise异步方式all
 */
{
    console.time('promiseAsync')
    Promise.all([boilWater(), washGlass(), prepareTealeaves()]).then(function(result){
        console.log(result)
        console.timeEnd('promiseAsync')
    })
}