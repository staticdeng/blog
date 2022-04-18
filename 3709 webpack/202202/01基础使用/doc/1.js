class Person {
    PI = 3.14;
}

// es6 es5
//When true,
//class properties are compiled to use an assignment expression instead of Object.defineProperty.
//loose=false
let p = new Person();
Object.defineProperty(p, 'PI', { value: 3.14 })
//loose=true
p.PI = 3.14;