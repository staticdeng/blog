/**
 * https://github.com/vuejs/vue/blob/2.6/src/compiler/index.js
 * 编译器：
    • 转换 HTML 为 AST

 */
import { parse } from './parser/index';

export function compileToFunctions(template) {
  // 1. 转换 template 为 ast 语法树
  const ast = parse(template.trim());
  console.log(ast);
}
