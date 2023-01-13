/**
 * 转换 HTML 为 AST 入口
 * https://github.com/vuejs/vue/blob/2.6/src/compiler/parser/index.js
 */
import { parseHTML } from './html-parser';

export function parse (template) {
  return parseHTML(template);
};
