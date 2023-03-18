/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _initClass, _init_PI;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createMetadataMethodsForProperty(metadataMap, kind, property) { return { getMetadata: function getMetadata(key) { if ("symbol" != _typeof(key)) throw new TypeError("Metadata keys must be symbols, received: " + key); var metadataForKey = metadataMap[key]; if (void 0 !== metadataForKey) if (1 === kind) { var pub = metadataForKey["public"]; if (void 0 !== pub) return pub[property]; } else if (2 === kind) { var priv = metadataForKey["private"]; if (void 0 !== priv) return priv.get(property); } else if (Object.hasOwnProperty.call(metadataForKey, "constructor")) return metadataForKey.constructor; }, setMetadata: function setMetadata(key, value) { if ("symbol" != _typeof(key)) throw new TypeError("Metadata keys must be symbols, received: " + key); var metadataForKey = metadataMap[key]; if (void 0 === metadataForKey && (metadataForKey = metadataMap[key] = {}), 1 === kind) { var pub = metadataForKey["public"]; void 0 === pub && (pub = metadataForKey["public"] = {}), pub[property] = value; } else if (2 === kind) { var priv = metadataForKey.priv; void 0 === priv && (priv = metadataForKey["private"] = new Map()), priv.set(property, value); } else metadataForKey.constructor = value; } }; }

function convertMetadataMapToFinal(obj, metadataMap) { var parentMetadataMap = obj[Symbol.metadata || Symbol["for"]("Symbol.metadata")], metadataKeys = Object.getOwnPropertySymbols(metadataMap); if (0 !== metadataKeys.length) { for (var i = 0; i < metadataKeys.length; i++) { var key = metadataKeys[i], metaForKey = metadataMap[key], parentMetaForKey = parentMetadataMap ? parentMetadataMap[key] : null, pub = metaForKey["public"], parentPub = parentMetaForKey ? parentMetaForKey["public"] : null; pub && parentPub && Object.setPrototypeOf(pub, parentPub); var priv = metaForKey["private"]; if (priv) { var privArr = Array.from(priv.values()), parentPriv = parentMetaForKey ? parentMetaForKey["private"] : null; parentPriv && (privArr = privArr.concat(parentPriv)), metaForKey["private"] = privArr; } parentMetaForKey && Object.setPrototypeOf(metaForKey, parentMetaForKey); } parentMetadataMap && Object.setPrototypeOf(metadataMap, parentMetadataMap), obj[Symbol.metadata || Symbol["for"]("Symbol.metadata")] = metadataMap; } }

function createAddInitializerMethod(initializers) { return function (initializer) { assertValidInitializer(initializer), initializers.push(initializer); }; }

function memberDecCtx(base, name, desc, metadataMap, initializers, kind, isStatic, isPrivate) { var kindStr; switch (kind) { case 1: kindStr = "accessor"; break; case 2: kindStr = "method"; break; case 3: kindStr = "getter"; break; case 4: kindStr = "setter"; break; default: kindStr = "field"; } var metadataKind, metadataName, ctx = { kind: kindStr, name: isPrivate ? "#" + name : name, isStatic: isStatic, isPrivate: isPrivate }; if (0 !== kind && (ctx.addInitializer = createAddInitializerMethod(initializers)), isPrivate) { metadataKind = 2, metadataName = Symbol(name); var access = {}; 0 === kind ? (access.get = desc.get, access.set = desc.set) : 2 === kind ? access.get = function () { return desc.value; } : (1 !== kind && 3 !== kind || (access.get = function () { return desc.get.call(this); }), 1 !== kind && 4 !== kind || (access.set = function (v) { desc.set.call(this, v); })), ctx.access = access; } else metadataKind = 1, metadataName = name; return Object.assign(ctx, createMetadataMethodsForProperty(metadataMap, metadataKind, metadataName)); }

function assertValidInitializer(initializer) { if ("function" != typeof initializer) throw new Error("initializers must be functions"); }

function assertValidReturnValue(kind, value) { var type = _typeof(value); if (1 === kind) { if ("object" !== type || null === value) throw new Error("accessor decorators must return an object with get, set, or initializer properties or void 0"); } else if ("function" !== type) throw 0 === kind ? new Error("field decorators must return a initializer function or void 0") : new Error("method decorators must return a function or void 0"); }

function applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, metadataMap, initializers) { var desc, initializer, value, decs = decInfo[0]; isPrivate ? desc = 0 === kind || 1 === kind ? { get: decInfo[3], set: decInfo[4] } : 3 === kind ? { get: decInfo[3] } : 4 === kind ? { set: decInfo[3] } : { value: decInfo[3] } : 0 !== kind && (desc = Object.getOwnPropertyDescriptor(base, name)), 1 === kind ? value = { get: desc.get, set: desc.set } : 2 === kind ? value = desc.value : 3 === kind ? value = desc.get : 4 === kind && (value = desc.set); var newValue, get, set, ctx = memberDecCtx(base, name, desc, metadataMap, initializers, kind, isStatic, isPrivate); if ("function" == typeof decs) void 0 !== (newValue = decs(value, ctx)) && (assertValidReturnValue(kind, newValue), 0 === kind ? initializer = newValue : 1 === kind ? (initializer = newValue.initializer, get = newValue.get || value.get, set = newValue.set || value.set, value = { get: get, set: set }) : value = newValue);else for (var i = decs.length - 1; i >= 0; i--) { var newInit; if (void 0 !== (newValue = (0, decs[i])(value, ctx))) assertValidReturnValue(kind, newValue), 0 === kind ? newInit = newValue : 1 === kind ? (newInit = newValue.initializer, get = newValue.get || value.get, set = newValue.set || value.set, value = { get: get, set: set }) : value = newValue, void 0 !== newInit && (void 0 === initializer ? initializer = newInit : "function" == typeof initializer ? initializer = [initializer, newInit] : initializer.push(newInit)); } if (0 === kind || 1 === kind) { if (void 0 === initializer) initializer = function initializer(instance, init) { return init; };else if ("function" != typeof initializer) { var ownInitializers = initializer; initializer = function initializer(instance, init) { for (var value = init, i = 0; i < ownInitializers.length; i++) { value = ownInitializers[i].call(instance, value); } return value; }; } else { var originalInitializer = initializer; initializer = function initializer(instance, init) { return originalInitializer.call(instance, init); }; } ret.push(initializer); } 0 !== kind && (1 === kind ? (desc.get = value.get, desc.set = value.set) : 2 === kind ? desc.value = value : 3 === kind ? desc.get = value : 4 === kind && (desc.set = value), isPrivate ? 1 === kind ? (ret.push(function (instance, args) { return value.get.call(instance, args); }), ret.push(function (instance, args) { return value.set.call(instance, args); })) : 2 === kind ? ret.push(value) : ret.push(function (instance, args) { return value.call(instance, args); }) : Object.defineProperty(base, name, desc)); }

function applyMemberDecs(ret, Class, protoMetadataMap, staticMetadataMap, decInfos) { for (var protoInitializers = [], staticInitializers = [], existingProtoNonFields = new Map(), existingStaticNonFields = new Map(), i = 0; i < decInfos.length; i++) { var decInfo = decInfos[i]; if (Array.isArray(decInfo)) { var base, metadataMap, initializers, kind = decInfo[1], name = decInfo[2], isPrivate = decInfo.length > 3, isStatic = kind >= 5; if (isStatic ? (base = Class, metadataMap = staticMetadataMap, kind -= 5, initializers = staticInitializers) : (base = Class.prototype, metadataMap = protoMetadataMap, initializers = protoInitializers), 0 !== kind && !isPrivate) { var existingNonFields = isStatic ? existingStaticNonFields : existingProtoNonFields, existingKind = existingNonFields.get(name) || 0; if (!0 === existingKind || 3 === existingKind && 4 !== kind || 4 === existingKind && 3 !== kind) throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + name); !existingKind && kind > 2 ? existingNonFields.set(name, kind) : existingNonFields.set(name, !0); } applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, metadataMap, initializers); } } protoInitializers.length > 0 && pushInitializers(ret, protoInitializers), staticInitializers.length > 0 && pushInitializers(ret, staticInitializers); }

function pushInitializers(ret, initializers) { initializers.length > 0 ? (initializers = initializers.slice(), ret.push(function (instance) { for (var i = 0; i < initializers.length; i++) { initializers[i].call(instance, instance); } return instance; })) : ret.push(function (instance) { return instance; }); }

function applyClassDecs(ret, targetClass, metadataMap, classDecs) { for (var initializers = [], newClass = targetClass, name = targetClass.name, ctx = Object.assign({ kind: "class", name: name, addInitializer: createAddInitializerMethod(initializers) }, createMetadataMethodsForProperty(metadataMap, 0, name)), i = classDecs.length - 1; i >= 0; i--) { newClass = classDecs[i](newClass, ctx) || newClass; } ret.push(newClass), initializers.length > 0 ? ret.push(function () { for (var i = 0; i < initializers.length; i++) { initializers[i].call(newClass, newClass); } }) : ret.push(function () {}); }

function _applyDecs(targetClass, memberDecs, classDecs) { var ret = [], staticMetadataMap = {}; if (memberDecs) { var protoMetadataMap = {}; applyMemberDecs(ret, targetClass, protoMetadataMap, staticMetadataMap, memberDecs), convertMetadataMapToFinal(targetClass.prototype, protoMetadataMap); } return classDecs && applyClassDecs(ret, targetClass, staticMetadataMap, classDecs), convertMetadataMapToFinal(targetClass, staticMetadataMap), ret; }

function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }

/**
 * 
 * @param {*} target 装饰的目标
 * @param {*} key 属性
 * @param {*} descriptor 属性描述器 
 */
function readonly(target, key, descriptor) {
  descriptor.writable = false;
}

function withLog(target, key, descriptor) {}

var _Person;

var Person = /*#__PURE__*/_createClass(function Person() {
  _classCallCheck(this, Person);

  this.PI = _init_PI(this, 3.14);
});

(function () {
  var _applyDecs2 = _applyDecs(Person, [[readonly, 0, "PI"]], [withLog]);

  var _applyDecs3 = _slicedToArray(_applyDecs2, 3);

  _init_PI = _applyDecs3[0];
  _Person = _applyDecs3[1];
  _initClass = _applyDecs3[2];
})();

(function () {
  _initClass();
})();

var person = new _Person();
person.PI = 3.15;
console.log(person.PI);
var a = 1;
var b = 2;
var c = 3;
4, _readOnlyError("c");
window.a = 1;
/******/ })()
;