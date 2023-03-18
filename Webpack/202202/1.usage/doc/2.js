class Foo {
    #bar = "bar";

    test(obj) {
        return #bar in obj;
    }
}

let foo = new Foo();
console.log(foo.bar);

class Counter {


    #clicked() {

    }
}
let counter = new Counter();
console.log(counter.clicked);
