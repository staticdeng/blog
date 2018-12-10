console.log('script begin')
setTimeout(() => {
    console.log('setTimeout')
},0)

new Promise((resolve) => {
    // setTimeout(() => {
    //     console.log('setTimeout promise begin')
    // },0)
    console.log('promise begin')
    for(let i = 0; i < 1000; i++) {
        i == 999 && resolve()
    }
}).then(() => {
    console.log('promise then')
})

console.log('script end')