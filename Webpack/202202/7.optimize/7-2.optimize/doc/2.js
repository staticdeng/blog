function createHash() {
    return require('crypto').createHash('md5');
}
const entry1Module = { id: 'entry1Module', content: 'entry1Modul' };
const entry1DepModule = { id: 'entry1Module', content: 'eentry1DepModule' };
const entry2Module = { id: 'entry1Module', content: 'entry2Modul' };
const entry2DepModule = { id: 'entry1Module', content: 'eentry2DepModule' };
let entry = {
    entry1: entry1Module,
    entry2: entry2Module
}
/* //hash跟所有的模块有关，任何一个模块发生改变，hash就会发生改变 
let hash = createHash()
    .update(entry1Module)
    .update(entry2Module)
    .update(entry1DepModule)
    .update(entry2DepModule)
    .digest('hex');
console.log(hash);

let entry1ChunkHash = createHash()
    .update(entry1Module).update(entry1DepModule.id)
    .digest('hex');
console.log(entry1ChunkHash);

let entry2ChunkHash = createHash()
    .update(entry2Module).update(entry2DepModule.id)
    .digest('hex');
console.log(entry2ChunkHash);
 */

let entry1ContentHash = createHash()
    .update(entry1Module.content + entry1DepModule.content)
    .digest('hex');
console.log(entry1ContentHash);

let entry2ContentHash = createHash()
    .update(entry2Module.content + entry2DepModule.content)
    .digest('hex');
console.log(entry2ContentHash);