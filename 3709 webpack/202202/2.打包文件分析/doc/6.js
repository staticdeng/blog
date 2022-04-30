let promise = Promise.resolve('1');
promise.then(() => {
    return '1内容';
}).then(result => { console.log(result) });
