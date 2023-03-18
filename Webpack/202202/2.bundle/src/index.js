// import name, { age } from "./title";
// console.log(name);
// console.log(age);

import(/* webpackChunkName: "hello" */'./hello').then(result => {
    console.log(result);
});