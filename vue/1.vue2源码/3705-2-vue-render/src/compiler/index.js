/**
 * https://github.com/vuejs/vue/blob/2.6/src/compiler/index.js
 * 编译器：
    • 转换 HTML 为 AST
    • 生成render函数
 */
import { parse } from './parser/index';
import { generate } from './codegen/index';

export function compileToFunctions(template) {
  // 1. 转换 template 为 ast 语法树
  const ast = parse(template.trim());
  console.log('ast', ast);

  // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
  let code = generate(ast);
  //  _c('div',{id:'app'},_c('div',{style:{color:'red'}}, _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))
  // 模板引擎的实现原理 就是 with  + new Function
  code = `with(this){return ${code}}`;
  let render = new Function(code); // 根据代码生成render函数
  console.log('render', render);

  return render;
}
