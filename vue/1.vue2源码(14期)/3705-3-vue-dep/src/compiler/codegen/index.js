/**
 * 将ast语法树生成代码(render函数)
 * https://github.com/vuejs/vue/blob/2.6/src/compiler/codegen/index.js
 */

function genProps(attrs) {
  let str = '' // {name,value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      // color:red;background:red => {color:'red'}
      let obj = {};
      attr.value.split(';').forEach(item => { // qs 库
        let [key, value] = item.split(':');
        obj[key] = value;
      });
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},` // a:b,c:d,
  }
  return `{${str.slice(0, -1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量
function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    // 文本
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      //_v( _s(name)+'hello' + _s(name))
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      // split
      while (match = defaultTagRE.exec(text)) {
        let index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
  return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
  let children = genChildren(ast.children);
  let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
      }${ast.children.length ? `,${children}` : ''
      })`);
  return code;
}

export function generate(ast) {
  const state = codegen(ast);
  return state;
}