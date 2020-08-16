(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("curvature/base/Bag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var toId = function toId(_int) {
  return Number(_int).toString(36);
};

var fromId = function fromId(id) {
  return parseInt(id, 36);
};

var Bag = /*#__PURE__*/function () {
  function Bag() {
    var changeCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    _classCallCheck(this, Bag);

    this.meta = Symbol('meta');
    this.content = new Map();
    this.list = _Bindable.Bindable.makeBindable({});
    this.current = 0;
    this.type = undefined;
    this.changeCallback = changeCallback;
  }

  _createClass(Bag, [{
    key: "add",
    value: function add(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be added to Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be added to this Bag."));
      }

      if (this.content.has(item)) {
        return;
      }

      var id = toId(this.current++);
      this.content.set(item, id);
      this.list[id] = item;

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_ADDED, id);
      }
    }
  }, {
    key: "remove",
    value: function remove(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be removed from Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be removed from this Bag."));
      }

      if (!this.content.has(item)) {
        if (this.changeCallback) {
          this.changeCallback(item, this.meta, 0, undefined);
        }

        return false;
      }

      var id = this.content.get(item);
      delete this.list[id];
      this.content["delete"](item);

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_REMOVED, id);
      }

      return item;
    }
  }, {
    key: "items",
    value: function items() {
      return Array.from(this.content.entries()).map(function (entry) {
        return entry[0];
      });
    }
  }]);

  return Bag;
}();

exports.Bag = Bag;
Object.defineProperty(Bag, 'ITEM_ADDED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: 1
});
Object.defineProperty(Bag, 'ITEM_REMOVED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: -1
});
  })();
});

require.register("curvature/base/Bindable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bindable = void 0;

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Ref = Symbol('ref');
var Deck = Symbol('deck');
var Binding = Symbol('binding');
var BindingAll = Symbol('bindingAll');
var IsBindable = Symbol('isBindable');
var Executing = Symbol('executing');
var Stack = Symbol('stack');
var ObjSymbol = Symbol('object');
var Wrapped = Symbol('wrapped');

var Bindable = /*#__PURE__*/function () {
  function Bindable() {
    _classCallCheck(this, Bindable);
  }

  _createClass(Bindable, null, [{
    key: "isBindable",
    value: function isBindable(object) {
      if (!object[Binding]) {
        return false;
      }

      return object[Binding] === Bindable;
    }
  }, {
    key: "makeBindable",
    value: function makeBindable(object) {
      return this.make(object);
    }
  }, {
    key: "make",
    value: function make(object) {
      var _this = this;

      if (!object || !(object instanceof Object) || object instanceof Node || object instanceof IntersectionObserver || Object.isSealed(object) || !Object.isExtensible(object)) {
        // console.log('Cannot bind to object', object);
        return object;
      }

      if (object[Ref]) {
        // console.log('Already bound to object', object[Ref]);
        return object;
      }

      if (object[Binding]) {
        return object;
      }

      Object.defineProperty(object, Ref, {
        configurable: false,
        enumerable: false,
        writable: true,
        value: object
      });
      Object.defineProperty(object, Deck, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, Binding, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, BindingAll, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, IsBindable, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: Bindable
      });
      Object.defineProperty(object, Executing, {
        enumerable: false,
        writable: true
      });
      Object.defineProperty(object, Stack, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___before___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___after___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, Wrapped, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });

      var bindTo = function bindTo(property) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var bindToAll = false;

        if (property instanceof Function) {
          options = callback || {};
          callback = property;
          bindToAll = true;
        }

        if (options.delay >= 0) {
          callback = _this.wrapDelayCallback(callback, options.delay);
        }

        if (options.throttle >= 0) {
          callback = _this.wrapThrottleCallback(callback, options.throttle);
        }

        if (options.wait >= 0) {
          callback = _this.wrapWaitCallback(callback, options.wait);
        }

        if (options.frame) {
          callback = _this.wrapFrameCallback(callback, options.frame);
        }

        if (options.idle) {
          callback = _this.wrapIdleCallback(callback);
        }

        if (bindToAll) {
          var _bindIndex = object[BindingAll].length;
          object[BindingAll].push(callback);

          for (var i in object) {
            callback(object[i], i, object, false);
          }

          return function () {
            delete object[BindingAll][_bindIndex];
          };
        }

        if (!object[Binding][property]) {
          object[Binding][property] = [];
        }

        var bindIndex = object[Binding][property].length;
        object[Binding][property].push(callback);
        callback(object[property], property, object, false);
        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;

          if (!object[Binding][property]) {
            return;
          }

          delete object[Binding][property][bindIndex];
        };
      };

      Object.defineProperty(object, 'bindTo', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: bindTo
      });

      var ___before = function ___before(callback) {
        var beforeIndex = object.___before___.length;

        object.___before___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___before___[beforeIndex];
        };
      };

      var ___after = function ___after(callback) {
        var afterIndex = object.___after___.length;

        object.___after___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___after___[afterIndex];
        };
      };

      Object.defineProperty(object, 'bindChain', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function value(path, callback) {
          var parts = path.split('.');
          var node = parts.shift();
          var subParts = parts.slice(0);
          var debind = [];
          debind.push(object.bindTo(node, function (v, k, t, d) {
            var rest = subParts.join('.');

            if (subParts.length === 0) {
              callback(v, k, t, d);
              return;
            }

            if (v === undefined) {
              v = t[k] = _this.makeBindable({});
            }

            debind = debind.concat(v.bindChain(rest, callback));
          })); // console.log(debind);

          return function () {
            return debind.map(function (x) {
              return x();
            });
          };
        }
      });
      Object.defineProperty(object, '___before', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___before
      });
      Object.defineProperty(object, '___after', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___after
      });

      var isBound = function isBound() {
        for (var i in object[BindingAll]) {
          if (object[BindingAll][i]) {
            return true;
          }
        }

        for (var _i in object[Binding]) {
          for (var j in object[Binding][_i]) {
            if (object[Binding][_i][j]) {
              return true;
            }
          }
        }

        return false;
      };

      Object.defineProperty(object, 'isBound', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: isBound
      });

      for (var i in object) {
        if (object[i] && object[i] instanceof Object && !object[i] instanceof Node && !object[i] instanceof Promise) {
          object[i] = Bindable.make(object[i]);
        }
      }

      var set = function set(target, key, value) {
        if (object[Deck][key] === value) {
          return true;
        }

        if (typeof key === 'string' && key.substring(0, 3) === '___' && key.slice(-3) === '___') {
          return true;
        }

        if (target[key] === value) {
          return true;
        }

        if (value && value instanceof Object && !(value instanceof Node)) {
          if (value.___isBindable___ !== Bindable) {
            value = Bindable.makeBindable(value);

            if (_this.isBindable(value)) {
              for (var _i2 in value) {
                if (value[_i2] && value[_i2] instanceof Object) {
                  value[_i2] = Bindable.makeBindable(value[_i2]);
                }
              }
            }
          }
        }

        object[Deck][key] = value;

        for (var _i3 in object[BindingAll]) {
          if (!object[BindingAll][_i3]) {
            continue;
          }

          object[BindingAll][_i3](value, key, target, false);
        }

        var stop = false;

        if (key in object[Binding]) {
          for (var _i4 in object[Binding][key]) {
            if (!object[Binding][key]) {
              continue;
            }

            if (!object[Binding][key][_i4]) {
              continue;
            }

            if (object[Binding][key][_i4](value, key, target, false, target[key]) === false) {
              stop = true;
            }
          }
        }

        delete object[Deck][key];

        if (!stop) {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          var excluded = target instanceof File && key == 'lastModifiedDate';

          if (!excluded && (!descriptor || descriptor.writable) && target[key] === value) {
            target[key] = value;
          }
        }

        return Reflect.set(target, key, value);
      };

      var deleteProperty = function deleteProperty(target, key) {
        if (!(key in target)) {
          return true;
        }

        for (var _i5 in object[BindingAll]) {
          object[BindingAll][_i5](undefined, key, target, true, target[key]);
        }

        if (key in object[Binding]) {
          for (var _i6 in object[Binding][key]) {
            if (!object[Binding][key][_i6]) {
              continue;
            }

            object[Binding][key][_i6](undefined, key, target, true, target[key]);
          }
        }

        delete target[key];
        return true;
      };

      var get = function get(target, key) {
        if (key === Ref || key === 'isBound') {
          return target[key];
        }

        if (target[key] instanceof Function) {
          if (target[Wrapped][key]) {
            return target[Wrapped][key];
          }

          var descriptor = Object.getOwnPropertyDescriptor(object, key);

          if (descriptor && !descriptor.configurable && !descriptor.writable) {
            target[Wrapped][key] = target[key];
            return target[Wrapped][key];
          }

          target[Wrapped][key] = function () {
            target[Executing] = key;
            target[Stack].unshift(key);

            for (var _len = arguments.length, providedArgs = new Array(_len), _key = 0; _key < _len; _key++) {
              providedArgs[_key] = arguments[_key];
            }

            for (var _i7 in target.___before___) {
              target.___before___[_i7](target, key, target[Stack], object, providedArgs);
            }

            var objRef = object instanceof Promise || object instanceof EventTarget ? object : object[Ref];
            var ret = target[key].apply(objRef, providedArgs);

            for (var _i8 in target.___after___) {
              target.___after___[_i8](target, key, target[Stack], object, providedArgs);
            }

            target[Executing] = null;
            target[Stack].shift();
            return ret;
          };

          return target[Wrapped][key];
        }

        if (target[key] instanceof Object && !target[key][Ref]) {
          Bindable.make(target[key]);
        }

        return target[key];
      };

      var construct = function construct(target, args) {
        var key = 'constructor';

        for (var _i9 in target.___before___) {
          target.___before___[_i9](target, key, target[Stack], undefined, args);
        }

        var instance = Bindable.make(_construct(target, _toConsumableArray(args)));

        for (var _i10 in target.___after___) {
          target.___after___[_i10](target, key, target[Stack], instance, args);
        }

        return instance;
      };

      object[Ref] = new Proxy(object, {
        deleteProperty: deleteProperty,
        construct: construct,
        get: get,
        set: set
      });
      return object[Ref];
    }
  }, {
    key: "clearBindings",
    value: function clearBindings(object) {
      var clearObj = function clearObj(o) {
        return Object.keys(o).map(function (k) {
          return delete o[k];
        });
      };

      var maps = function maps(func) {
        return function () {
          for (var _len2 = arguments.length, os = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            os[_key2] = arguments[_key2];
          }

          return os.map(func);
        };
      };

      var clearObjs = maps(clearObj);
      clearObjs(object[Wrapped], object[Binding], object[BindingAll], object.___after___, object.___before___ // , object[Ref]
      ); // object[BindingAll]  = [];
      // object.___after___  = [];
      // object.___before___ = [];
      // object[Ref]         = {};
      // object[Wrapped]     = {};
      // object[Binding]     = {};
    }
  }, {
    key: "resolve",
    value: function resolve(object, path) {
      var owner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // console.log(path, object);
      var node;
      var pathParts = path.split('.');
      var top = pathParts[0];

      while (pathParts.length) {
        if (owner && pathParts.length === 1) {
          var obj = this.makeBindable(object);
          return [obj, pathParts.shift(), top];
        }

        node = pathParts.shift();

        if (!node in object || !object[node] || !(object[node] instanceof Object)) {
          object[node] = {};
        }

        object = this.makeBindable(object[node]);
      }

      return [this.makeBindable(object), node, top];
    }
  }, {
    key: "wrapDelayCallback",
    value: function wrapDelayCallback(callback, delay) {
      return function (v, k, t, d) {
        setTimeout(function () {
          return callback(v, k, t, d, t[k]);
        }, delay);
      };
    }
  }, {
    key: "wrapThrottleCallback",
    value: function wrapThrottleCallback(callback, throttle) {
      return function (callback) {
        var throttle = false;
        return function (v, k, t, d) {
          if (throttle) {
            return;
          }

          callback(v, k, t, d, t[k]);
          throttle = true;
          setTimeout(function () {
            throttle = false;
          }, throttle);
        };
      }(callback);
    }
  }, {
    key: "wrapWaitCallback",
    value: function wrapWaitCallback(callback, wait) {
      var waiter = false;
      return function (v, k, t, d) {
        if (waiter) {
          clearTimeout(waiter);
          waiter = false;
        }

        waiter = setTimeout(function () {
          return callback(v, k, t, d, t[k]);
        }, wait);
      };
    }
  }, {
    key: "wrapFrameCallback",
    value: function wrapFrameCallback(callback, frames) {
      return function (v, k, t, d, p) {
        requestAnimationFrame(function () {
          return callback(v, k, t, d, p);
        });
      };
    }
  }, {
    key: "wrapIdleCallback",
    value: function wrapIdleCallback(callback) {
      return function (v, k, t, d, p) {
        requestIdleCallback(function () {
          return callback(v, k, t, d, p);
        });
      };
    }
  }]);

  return Bindable;
}();

exports.Bindable = Bindable;
  })();
});

require.register("curvature/base/Cache.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cache = /*#__PURE__*/function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, null, [{
    key: "store",
    value: function store(key, value, expiry) {
      var bucket = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'standard';
      var expiration = 0;

      if (expiry) {
        expiration = expiry * 1000 + new Date().getTime();
      } // console.log(
      // 	`Caching ${key} until ${expiration} in ${bucket}.`
      // 	, value
      // 	, this.bucket
      // );


      if (!this.bucket) {
        this.bucket = {};
      }

      if (!this.bucket[bucket]) {
        this.bucket[bucket] = {};
      }

      this.bucket[bucket][key] = {
        expiration: expiration,
        value: value
      };
    }
  }, {
    key: "load",
    value: function load(key) {
      var defaultvalue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var bucket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'standard';

      // console.log(
      // 	`Checking cache for ${key} in ${bucket}.`
      // 	, this.bucket
      // );
      if (this.bucket && this.bucket[bucket] && this.bucket[bucket][key]) {
        // console.log(this.bucket[bucket][key].expiration, (new Date).getTime());
        if (this.bucket[bucket][key].expiration == 0 || this.bucket[bucket][key].expiration > new Date().getTime()) {
          return this.bucket[bucket][key].value;
        }
      }

      return defaultvalue;
    }
  }]);

  return Cache;
}();

exports.Cache = Cache;
  })();
});

require.register("curvature/base/Config.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ConfigData = {};

try {
  var AppConfig = require('Config').Config || {};
  Object.assign(ConfigData, AppConfig);
} catch (error) {
  console.warn(error);
}

var Config = /*#__PURE__*/function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, null, [{
    key: "get",
    value: function get(name) {
      return this.data[name];
    }
  }, {
    key: "set",
    value: function set(name, value) {
      this.data[name] = value;
      return this;
    }
  }, {
    key: "dump",
    value: function dump() {
      return this.data;
    }
  }, {
    key: "init",
    value: function init() {
      for (var _len = arguments.length, configBlobs = new Array(_len), _key = 0; _key < _len; _key++) {
        configBlobs[_key] = arguments[_key];
      }

      for (var i in configBlobs) {
        var configBlob = configBlobs[i];

        if (typeof configBlob === 'string') {
          configBlob = JSON.parse(configBlob);
        }

        for (var name in configBlob) {
          var value = configBlob[name];
          return this.data[name] = value;
        }
      }

      return this;
    }
  }]);

  return Config;
}();

exports.Config = Config;
Config.data = ConfigData || {};
  })();
});

require.register("curvature/base/Dom.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dom = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var traversals = 0;

var Dom = /*#__PURE__*/function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: "mapTags",
    value: function mapTags(doc, selector, callback, startNode, endNode) {
      var result = [];
      var started = true;

      if (startNode) {
        started = false;
      }

      var ended = false;
      var treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: function acceptNode(node, walker) {
          if (!started) {
            if (node === startNode) {
              started = true;
            } else {
              return NodeFilter.FILTER_SKIP;
            }
          }

          if (endNode && node === endNode) {
            ended = true;
          }

          if (ended) {
            return NodeFilter.FILTER_SKIP;
          }

          if (selector) {
            if (node instanceof Element) {
              if (node.matches(selector)) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }

            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }, false);
      var traversal = traversals++;

      while (treeWalker.nextNode()) {
        result.push(callback(treeWalker.currentNode, treeWalker));
      }

      return result;
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(doc, event) {
      doc.dispatchEvent(event);
      Dom.mapTags(doc, false, function (node) {
        node.dispatchEvent(event);
      });
    }
  }]);

  return Dom;
}();

exports.Dom = Dom;
  })();
});

require.register("curvature/base/Mixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mixin = void 0;

var _Bindable = require("./Bindable");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Mixin = /*#__PURE__*/function () {
  function Mixin() {
    _classCallCheck(this, Mixin);
  }

  _createClass(Mixin, null, [{
    key: "mix",
    value: function mix(mixinTo) {
      var constructors = [];
      var allStatic = {};
      var allInstance = {};

      var mixable = _Bindable.Bindable.makeBindable(mixinTo);

      var _loop = function _loop(base) {
        var instanceNames = Object.getOwnPropertyNames(base.prototype);
        var staticNames = Object.getOwnPropertyNames(base);
        var prefix = /^(before|after)__(.+)/;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop3 = function _loop3() {
            var methodName = _step.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allStatic[methodName]) {
              return "continue";
            }

            if (typeof base[methodName] !== 'function') {
              return "continue";
            }

            allStatic[methodName] = base[methodName];
          };

          for (var _iterator = staticNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _ret = _loop3();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop4 = function _loop4() {
            var methodName = _step2.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allInstance[methodName]) {
              return "continue";
            }

            if (typeof base.prototype[methodName] !== 'function') {
              return "continue";
            }

            allInstance[methodName] = base.prototype[methodName];
          };

          for (var _iterator2 = instanceNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _ret2 = _loop4();

            if (_ret2 === "continue") continue;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      };

      for (var base = this; base && base.prototype; base = Object.getPrototypeOf(base)) {
        _loop(base);
      }

      for (var methodName in allStatic) {
        mixinTo[methodName] = allStatic[methodName].bind(mixinTo);
      }

      var _loop2 = function _loop2(_methodName) {
        mixinTo.prototype[_methodName] = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return allInstance[_methodName].apply(this, args);
        };
      };

      for (var _methodName in allInstance) {
        _loop2(_methodName);
      }

      return mixable;
    }
  }]);

  return Mixin;
}();

exports.Mixin = Mixin;
  })();
});

require.register("curvature/base/Router.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = void 0;

var _View = require("./View");

var _Cache = require("./Cache");

var _Config = require("./Config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Router = /*#__PURE__*/function () {
  function Router() {
    _classCallCheck(this, Router);
  }

  _createClass(Router, null, [{
    key: "wait",
    value: function wait(view) {
      var _this = this;

      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'DOMContentLoaded';
      var node = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
      node.addEventListener(event, function () {
        _this.listen(view);
      });
    }
  }, {
    key: "listen",
    value: function listen(mainView) {
      var _this2 = this;

      var routeHistory = [location.toString()];
      var prevHistoryLength = history.length;
      var route = location.pathname + location.search;

      if (location.hash) {
        route += location.hash;
      }

      Object.assign(Router.query, Router.queryOver({}));
      window.addEventListener('popstate', function (event) {
        event.preventDefault();

        if (routeHistory.length && prevHistoryLength == history.length) {
          if (location.toString() == routeHistory[routeHistory.length - 2]) {
            routeHistory.pop();
          } else {
            routeHistory.push(location.toString());
          }
        } else {
          routeHistory.push(location.toString());
          prevHistoryLength = history.length;
        }

        _this2.match(location.pathname, mainView);

        for (var i in _this2.query) {
          delete _this2.query[i];
        }

        Object.assign(Router.query, Router.queryOver({}));
      });
      this.go(route);
    }
  }, {
    key: "go",
    value: function go(route, silent) {
      var _this3 = this;

      var configTitle = _Config.Config.get('title');

      if (configTitle) {
        document.title = configTitle;
      }

      setTimeout(function () {
        if (silent === 2) {
          history.replaceState(null, null, route);
        } else {
          history.pushState(null, null, route);
        }

        if (!silent) {
          if (silent === false) {
            _this3.path = null;
          }

          window.dispatchEvent(new Event('popstate'));

          if (route.substring(0, 1) === '#') {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        }

        for (var i in _this3.query) {
          delete _this3.query[i];
        }

        Object.assign(Router.query, Router.queryOver({}));
      }, 0);
    }
  }, {
    key: "match",
    value: function match(path, view) {
      var _this4 = this;

      var forceRefresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.path === path && !forceRefresh) {
        return;
      }

      var eventStart = new CustomEvent('cvRouteStart', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });
      var current = view.args.content;
      var routes = view.routes;
      this.path = path; // this.query  = {};

      for (var i in this.query) {
        delete this.query[i];
      }

      var query = new URLSearchParams(location.search);
      this.queryString = location.search;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var pair = _step.value;
          this.query[pair[0]] = pair[1];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var args = {},
          selected = false,
          result = '';
      path = path.substr(1).split('/');

      for (var _i in this.query) {
        args[_i] = this.query[_i];
      }

      L1: for (var _i2 in routes) {
        var route = _i2.split('/');

        if (route.length < path.length && route[route.length - 1] !== '*') {
          continue;
        }

        L2: for (var j in route) {
          if (route[j].substr(0, 1) == '%') {
            var argName = null;
            var groups = /^%(\w+)\??/.exec(route[j]);

            if (groups && groups[1]) {
              argName = groups[1];
            }

            if (!argName) {
              throw new Error("".concat(route[j], " is not a valid argument segment in route \"").concat(_i2, "\""));
            }

            if (!path[j]) {
              if (route[j].substr(route[j].length - 1, 1) == '?') {
                args[argName] = '';
              } else {
                continue L1;
              }
            } else {
              args[argName] = path[j];
            }
          } else if (route[j] !== '*' && path[j] !== route[j]) {
            continue L1;
          }
        }

        if (!forceRefresh && current && routes[_i2] instanceof Object && current instanceof routes[_i2] && !(routes[_i2] instanceof Promise) && current.update(args)) {
          view.args.content = current;
          return true;
        }

        selected = _i2;
        result = routes[_i2];

        if (route[route.length - 1] === '*') {
          args.pathparts = path.slice(route.length - 1);
        }

        break;
      }

      document.dispatchEvent(eventStart);

      if (selected in routes && routes[selected] instanceof Object && routes[selected].isView && routes[selected].isView()) {
        result = new routes[selected](args);

        result.root = function () {
          return view;
        };
      } else if (routes[selected] instanceof Function) {
        result = '';

        var _result = routes[selected](args);

        if (_result instanceof Promise) {
          result = false;

          _result.then(function (x) {
            _this4.update(view, path, x);
          })["catch"](function (x) {
            _this4.update(view, path, x);
          });
        } else {
          result = _result;
        }
      } else if (routes[selected] instanceof Promise) {
        result = false;
        routes[selected].then(function (x) {
          _this4.update(view, path, x);
        })["catch"](function (x) {
          _this4.update(view, path, x);
        });
      } else if (routes[selected] instanceof Object) {
        result = new routes[selected](args);
      } else if (typeof routes[selected] == 'string') {
        result = routes[selected];
      }

      this.update(view, path, result); // if(view.args.content instanceof View)
      // {
      // 	// view.args.content.pause(true);
      // 	view.args.content.remove();
      // }
      // if(result !== false)
      // {
      // 	if(document.dispatchEvent(event))
      // 	{
      // 		view.args.content = result;
      // 	}
      // }

      if (result instanceof _View.View) {
        result.pause(false);
        result.update(args, forceRefresh);
      }

      return selected !== false;
    }
  }, {
    key: "update",
    value: function update(view, path, result) {
      var event = new CustomEvent('cvRoute', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });
      var eventEnd = new CustomEvent('cvRouteEnd', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });

      if (result !== false) {
        if (view.args.content instanceof _View.View) {
          // view.args.content.pause(true);
          view.args.content.remove();
        }

        if (document.dispatchEvent(event)) {
          view.args.content = result;
        }

        document.dispatchEvent(eventEnd);
      }
    }
  }, {
    key: "clearCache",
    value: function clearCache() {// this.cache = {};
    }
  }, {
    key: "queryOver",
    value: function queryOver() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var params = new URLSearchParams(location.search);
      var finalArgs = {};
      var query = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = params[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var pair = _step2.value;
          query[pair[0]] = pair[1];
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      for (var i in query) {
        finalArgs[i] = query[i];
      }

      for (var _i3 in args) {
        finalArgs[_i3] = args[_i3];
      }

      delete finalArgs['api'];
      return finalArgs;
    }
  }, {
    key: "queryToString",
    value: function queryToString() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var fresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var parts = [],
          finalArgs = args;

      if (!fresh) {
        finalArgs = this.queryOver(args);
      }

      for (var i in finalArgs) {
        if (finalArgs[i] === '') {
          continue;
        }

        parts.push(i + '=' + encodeURIComponent(finalArgs[i]));
      }

      return parts.join('&');
    }
  }, {
    key: "setQuery",
    value: function setQuery(name, value, silent) {
      var args = this.queryOver();
      args[name] = value;

      if (value === undefined) {
        delete args[name];
      }

      var queryString = this.queryToString(args, true);
      this.go(location.pathname + (queryString ? '?' + queryString : ''), silent);
    }
  }]);

  return Router;
}();

exports.Router = Router;
Object.defineProperty(Router, 'query', {
  configurable: false,
  writeable: false,
  value: {}
});
  })();
});

require.register("curvature/base/RuleSet.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuleSet = void 0;

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _View = require("./View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RuleSet = /*#__PURE__*/function () {
  function RuleSet() {
    _classCallCheck(this, RuleSet);
  }

  _createClass(RuleSet, [{
    key: "add",
    value: function add(selector, callback) {
      this.rules = this.rules || {};
      this.rules[selector] = this.rules[selector] || [];
      this.rules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      RuleSet.apply(doc, view);

      for (var selector in this.rules) {
        for (var i in this.rules[selector]) {
          var callback = this.rules[selector][i];
          var wrapped = RuleSet.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var node = _step.value;
              wrapped(node);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
    }
  }], [{
    key: "add",
    value: function add(selector, callback) {
      this.globalRules = this.globalRules || {};
      this.globalRules[selector] = this.globalRules[selector] || [];
      this.globalRules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      for (var selector in this.globalRules) {
        for (var i in this.globalRules[selector]) {
          var callback = this.globalRules[selector][i];
          var wrapped = this.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var node = _step2.value;
              wrapped(node);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
    }
  }, {
    key: "wait",
    value: function wait() {
      var _this = this;

      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'DOMContentLoaded';
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

      var listener = function (event, node) {
        return function () {
          node.removeEventListener(event, listener);
          return _this.apply();
        };
      }(event, node);

      node.addEventListener(event, listener);
    }
  }, {
    key: "wrap",
    value: function wrap(doc, callback) {
      var view = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (callback instanceof _View.View || callback && callback.prototype && callback.prototype instanceof _View.View) {
        callback = function (callback) {
          return function () {
            return callback;
          };
        }(callback);
      }

      return function (element) {
        if (typeof element.___cvApplied___ === 'undefined') {
          Object.defineProperty(element, '___cvApplied___', {
            enumerable: false,
            writable: false,
            value: []
          });
        }

        for (var i in element.___cvApplied___) {
          if (callback == element.___cvApplied___[i]) {
            return;
          }
        }

        var direct, parentView;

        if (view) {
          direct = parentView = view;

          if (view.viewList) {
            parentView = view.viewList.parent;
          }
        }

        var tag = new _Tag.Tag(element, parentView, null, undefined, direct);
        var parent = tag.element.parentNode;
        var sibling = tag.element.nextSibling;
        var result = callback(tag);

        if (result !== false) {
          element.___cvApplied___.push(callback);
        }

        if (result instanceof HTMLElement) {
          result = new _Tag.Tag(result);
        }

        if (result instanceof _Tag.Tag) {
          if (!result.element.contains(tag.element)) {
            while (tag.element.firstChild) {
              result.element.appendChild(tag.element.firstChild);
            }

            tag.remove();
          }

          if (sibling) {
            parent.insertBefore(result.element, sibling);
          } else {
            parent.appendChild(result.element);
          }
        }

        if (result && result.prototype && result.prototype instanceof _View.View) {
          result = new result();
        }

        if (result instanceof _View.View) {
          if (view) {
            view.cleanup.push(function (r) {
              return function () {
                r.remove();
              };
            }(result));
            result.parent = view;
            view.cleanup.push(view.args.bindTo(function (v, k, t) {
              t[k] = v;
              result.args[k] = v;
            }));
            view.cleanup.push(result.args.bindTo(function (v, k, t, d) {
              t[k] = v;
              view.args[k] = v;
            }));
          }

          tag.clear();
          result.render(tag.element);
        }
      };
    }
  }]);

  return RuleSet;
}();

exports.RuleSet = RuleSet;
  })();
});

require.register("curvature/base/Tag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Tag = /*#__PURE__*/function () {
  function Tag(element, parent, ref, index, direct) {
    _classCallCheck(this, Tag);

    this.element = _Bindable.Bindable.makeBindable(element);
    this.parent = parent;
    this.direct = direct;
    this.ref = ref;
    this.index = index;
    this.cleanup = [];
    this.proxy = _Bindable.Bindable.makeBindable(this); // this.detachListener = (event) => {
    // 	return;
    // 	if(event.target != this.element)
    // 	{
    // 		return;
    // 	}
    // 	if(event.path[event.path.length -1] !== window)
    // 	{
    // 		return;
    // 	}
    // 	this.element.removeEventListener('cvDomDetached', this.detachListener);
    // 	this.remove();
    // };
    // this.element.addEventListener('cvDomDetached', this.detachListener);
    // return this.proxy;
  }

  _createClass(Tag, [{
    key: "remove",
    value: function remove() {
      _Bindable.Bindable.clearBindings(this);

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup();
      }

      this.clear();

      if (!this.element) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');
      this.element.dispatchEvent(detachEvent);
      this.element.remove();
      this.element = this.ref = this.parent = null;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!this.element) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');

      while (this.element.firstChild) {
        this.element.firstChild.dispatchEvent(detachEvent);
        this.element.removeChild(this.element.firstChild);
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    }
  }]);

  return Tag;
}();

exports.Tag = Tag;
  })();
});

require.register("curvature/base/View.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _Bindable = require("./Bindable");

var _ViewList = require("./ViewList");

var _Router = require("./Router");

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _Bag = require("./Bag");

var _RuleSet = require("./RuleSet");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var dontParse = Symbol('dontParse');
var moveIndex = 0;

var View = /*#__PURE__*/function () {
  _createClass(View, [{
    key: "_id",
    get: function get() {
      if (!this.__id) {
        Object.defineProperty(this, '__id', {
          configurable: false,
          writable: false,
          value: this.uuid()
        });
      }

      return this.__id;
    }
  }]);

  function View() {
    var _this2 = this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var mainView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, View);

    Object.defineProperty(this, '___VIEW___', {
      enumerable: false,
      writable: true
    });
    this.___VIEW___ = View;
    Object.defineProperty(this, 'args', {
      configurable: false,
      writable: false,
      value: _Bindable.Bindable.make(args)
    });

    var _this = this;

    if (!this.args._id) {
      Object.defineProperty(this.args, '_id', {
        configurable: false,
        get: function get() {
          return _this._id;
        }
      });
    }

    this.template = "";
    this.document = "";
    this.firstNode = null;
    this.lastNode = null;
    this.nodes = null;
    this.cleanup = [];
    this._onRemove = new _Bag.Bag(function (i, s, a) {// console.log('View _onRemove', i, s, a);
    });
    this.attach = new _Bag.Bag(function (i, s, a) {});
    this.detach = new _Bag.Bag(function (i, s, a) {});
    this.eventCleanup = [];
    this.mainView = null;
    this.parent = mainView;
    this.viewList = null;
    this.viewLists = {};
    this.withViews = {};
    this.tags = _Bindable.Bindable.makeBindable({});
    this.intervals = [];
    this.timeouts = [];
    this.frames = [];
    this.ruleSet = new _RuleSet.RuleSet();
    this.preRuleSet = new _RuleSet.RuleSet();
    this.subBindings = {};
    this.subTemplates = {};
    this.removed = false;
    this.preserve = false;
    this.interpolateRegex = /(\[\[((?:\$+)?[\w\.\|]+)\]\])/g;
    this.rendered = new Promise(function (accept, reject) {
      Object.defineProperty(_this2, 'renderComplete', {
        configurable: false,
        writable: false,
        value: accept
      });
    });
    return _Bindable.Bindable.make(this);
  }

  _createClass(View, [{
    key: "onFrame",
    value: function onFrame(callback) {
      var _this3 = this;

      var stopped = false;

      var cancel = function cancel() {
        stopped = true;
      };

      var c = function c(timestamp) {
        if (_this3.removed || stopped) {
          return;
        }

        callback(Date.now());
        requestAnimationFrame(c);
      };

      requestAnimationFrame(function () {
        return c(Date.now());
      });
      return cancel;
    }
  }, {
    key: "onNextFrame",
    value: function onNextFrame(callback) {
      return requestAnimationFrame(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onIdle",
    value: function onIdle(callback) {
      return requestIdleCallback(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onTimeout",
    value: function onTimeout(time, callback) {
      var _this4 = this;

      var wrappedCallback = function wrappedCallback() {
        _this4.timeouts[index].fired = true;
        _this4.timeouts[index].callback = null;
        callback();
      };

      var timeout = setTimeout(wrappedCallback, time);
      var index = this.timeouts.length;
      this.timeouts.push({
        timeout: timeout,
        callback: wrappedCallback,
        time: time,
        fired: false,
        created: new Date().getTime(),
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearTimeout",
    value: function (_clearTimeout) {
      function clearTimeout(_x) {
        return _clearTimeout.apply(this, arguments);
      }

      clearTimeout.toString = function () {
        return _clearTimeout.toString();
      };

      return clearTimeout;
    }(function (timeout) {
      for (var i in this.timeouts) {
        if (timeout === this.timeouts[i].timeout) {
          clearTimeout(this.timeouts[i].timeout);
          delete this.timeouts[i];
        }
      }
    })
  }, {
    key: "onInterval",
    value: function onInterval(time, callback) {
      var timeout = setInterval(callback, time);
      this.intervals.push({
        timeout: timeout,
        callback: callback,
        time: time,
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearInterval",
    value: function (_clearInterval) {
      function clearInterval(_x2) {
        return _clearInterval.apply(this, arguments);
      }

      clearInterval.toString = function () {
        return _clearInterval.toString();
      };

      return clearInterval;
    }(function (timeout) {
      for (var i in this.intervals) {
        if (timeout === this.intervals[i].timeout) {
          clearInterval(this.intervals[i].timeout);
          delete this.intervals[i];
        }
      }
    })
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (paused === undefined) {
        this.paused = !this.paused;
      }

      this.paused = paused;

      if (this.paused) {
        for (var i in this.timeouts) {
          if (this.timeouts[i].fired) {
            delete this.timeouts[i];
            continue;
          }

          clearTimeout(this.timeouts[i].timeout);
        }

        for (var _i in this.intervals) {
          clearInterval(this.intervals[_i].timeout);
        }
      } else {
        for (var _i2 in this.timeouts) {
          if (!this.timeouts[_i2].timeout.paused) {
            continue;
          }

          if (this.timeouts[_i2].fired) {
            delete this.timeouts[_i2];
            continue;
          }

          this.timeouts[_i2].timeout = setTimeout(this.timeouts[_i2].callback, this.timeouts[_i2].time);
        }

        for (var _i3 in this.intervals) {
          if (!this.intervals[_i3].timeout.paused) {
            continue;
          }

          this.intervals[_i3].timeout.paused = false;
          this.intervals[_i3].timeout = setInterval(this.intervals[_i3].callback, this.intervals[_i3].time);
        }
      }

      for (var _i4 in this.viewLists) {
        if (!this.viewLists[_i4]) {
          return;
        }

        this.viewLists[_i4].pause(!!paused);
      }

      for (var _i5 in this.tags) {
        if (Array.isArray(this.tags[_i5])) {
          for (var j in this.tags[_i5]) {
            this.tags[_i5][j].pause(!!paused);
          }

          continue;
        }

        this.tags[_i5].pause(!!paused);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$nodes;

      var parentNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var insertPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var ref = _Bindable.Bindable.make(this);

      if (parentNode instanceof View) {
        parentNode = parentNode.firstNode.parentNode;
      }

      if (insertPoint instanceof View) {
        insertPoint = insertPoint.firstNode;
      }

      if (this.firstNode) {
        return this.reRender(parentNode, insertPoint);
      }

      var templateParsed = this.template instanceof DocumentFragment ? this.template.cloneNode(true) : View.templates.has(this.template);
      var subDoc = templateParsed ? this.template instanceof DocumentFragment ? templateParsed : View.templates.get(this.template).cloneNode(true) : document.createRange().createContextualFragment(this.template);

      if (!templateParsed && !(this.template instanceof DocumentFragment)) {
        View.templates.set(this.template, subDoc.cloneNode(true));
      }

      this.mainView || this.preRuleSet.apply(subDoc, this);
      this.mapTags(subDoc);
      this.mainView || this.ruleSet.apply(subDoc, this);
      this.nodes = [];

      if (window['devmode'] === true) {
        this.firstNode = document.createComment("Template ".concat(this._id, " Start"));
        this.lastNode = document.createComment("Template ".concat(this._id, " End"));
      } else {
        this.firstNode = document.createTextNode('');
        this.lastNode = document.createTextNode('');
      }

      (_this$nodes = this.nodes).push.apply(_this$nodes, [this.firstNode].concat(_toConsumableArray(Array.from(subDoc.childNodes)), [this.lastNode]));

      if (parentNode) {
        var rootNode = parentNode.getRootNode();
        var toRoot = false;
        var moveType = 'internal';

        if (rootNode === document) {
          toRoot = true;
          moveType = 'external';
        }

        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        moveIndex++;

        if (toRoot) {
          ref.attached(rootNode, parentNode);
          var attach = this.attach.items();

          for (var i in attach) {
            attach[i](rootNode, parentNode);
          }

          this.nodes.filter(function (n) {
            return n.nodeType !== Node.COMMENT_NODE;
          }).map(function (child) {
            child.dispatchEvent(new Event('cvDomAttached', {
              bubbles: true,
              target: child
            }));
          });
        }
      }

      this.renderComplete(this.nodes);
      this.postRender(parentNode);
      return this.nodes;
    }
  }, {
    key: "reRender",
    value: function reRender(parentNode, insertPoint) {
      var subDoc = new DocumentFragment();

      if (this.firstNode.getRootNode() === document) {
        var detach = this.detach.items();

        for (var i in detach) {
          detach[i]();
        }

        this.nodes.filter(function (n) {
          return n.nodeType === Node.ELEMENT_NODE;
        }).map(function (child) {
          child.dispatchEvent(new Event('cvDomDetached', {
            bubbles: true,
            target: child
          }));
        });
      }

      subDoc.append.apply(subDoc, _toConsumableArray(this.nodes)); // subDoc.appendChild(this.firstNode);
      // subDoc.appendChild(this.lastNode);

      if (parentNode) {
        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        var rootNode = parentNode.getRootNode();

        if (rootNode === document) {
          this.nodes.filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          }).map(function (child) {
            child.dispatchEvent(new Event('cvDomAttached', {
              bubbles: true,
              target: child
            }));
          });
          var attach = this.attach.items();

          for (var _i6 in attach) {
            attach[_i6](rootNode, parentNode);
          }
        }
      }

      return this.nodes;
    }
  }, {
    key: "mapTags",
    value: function mapTags(subDoc) {
      var _this5 = this;

      _Dom.Dom.mapTags(subDoc, false, function (tag, walker) {
        if (tag[dontParse]) {
          return;
        }

        if (tag.matches) {
          tag = _this5.mapInterpolatableTag(tag);
          tag = tag.matches('[cv-template]') && _this5.mapTemplateTag(tag) || tag;
          tag = tag.matches('[cv-slot]') && _this5.mapSlotTag(tag) || tag;
          tag = tag.matches('[cv-prerender]') && _this5.mapPrendererTag(tag) || tag;
          tag = tag.matches('[cv-link]') && _this5.mapLinkTag(tag) || tag;
          tag = tag.matches('[cv-attr]') && _this5.mapAttrTag(tag) || tag;
          tag = tag.matches('[cv-expand]') && _this5.mapExpandableTag(tag) || tag;
          tag = tag.matches('[cv-ref]') && _this5.mapRefTag(tag) || tag;
          tag = tag.matches('[cv-on]') && _this5.mapOnTag(tag) || tag;
          tag = tag.matches('[cv-each]') && _this5.mapEachTag(tag) || tag;
          tag = tag.matches('[cv-bind]') && _this5.mapBindTag(tag) || tag;
          tag = tag.matches('[cv-if]') && _this5.mapIfTag(tag) || tag;
          tag = tag.matches('[cv-with]') && _this5.mapWithTag(tag) || tag;
        } else {
          tag = _this5.mapInterpolatableTag(tag);
        }

        if (tag !== walker.currentNode) {
          walker.currentNode = tag;
        }
      });
    }
  }, {
    key: "mapExpandableTag",
    value: function mapExpandableTag(tag) {
      var _this6 = this;

      /*/
      const tagCompiler = this.compileExpandableTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var expandProperty = tag.getAttribute('cv-expand');

      var expandArg = _Bindable.Bindable.makeBindable(this.args[expandProperty] || {});

      tag.removeAttribute('cv-expand');

      var _loop = function _loop(i) {
        if (i === 'name' || i === 'type') {
          return "continue";
        }

        var debind = expandArg.bindTo(i, function (tag, i) {
          return function (v) {
            tag.setAttribute(i, v);
          };
        }(tag, i));

        _this6.onRemove(function () {
          debind();

          if (expandArg.isBound()) {
            _Bindable.Bindable.clearBindings(expandArg);
          }
        });
      };

      for (var i in expandArg) {
        var _ret = _loop(i);

        if (_ret === "continue") continue;
      }

      return tag; //*/
    }
  }, {
    key: "compileExpandableTag",
    value: function compileExpandableTag(sourceTag) {
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        var expandProperty = tag.getAttribute('cv-expand');

        var expandArg = _Bindable.Bindable.makeBindable(bindingView.args[expandProperty] || {});

        tag.removeAttribute('cv-expand');

        var _loop2 = function _loop2(i) {
          if (i === 'name' || i === 'type') {
            return "continue";
          }

          var debind = expandArg.bindTo(i, function (tag, i) {
            return function (v) {
              tag.setAttribute(i, v);
            };
          }(tag, i));
          bindingView.onRemove(function () {
            debind();

            if (expandArg.isBound()) {
              _Bindable.Bindable.clearBindings(expandArg);
            }
          });
        };

        for (var i in expandArg) {
          var _ret2 = _loop2(i);

          if (_ret2 === "continue") continue;
        }

        return tag;
      };
    }
  }, {
    key: "mapAttrTag",
    value: function mapAttrTag(tag) {
      //*/
      var tagCompiler = this.compileAttrTag(tag);
      var newTag = tagCompiler(this);
      tag.replaceWith(newTag);
      return newTag;
      /*/
      	let attrProperty = tag.getAttribute('cv-attr');
      	tag.removeAttribute('cv-attr');
      	let pairs = attrProperty.split(',');
      let attrs = pairs.map((p) => p.split(':'));
      	for (let i in attrs)
      {
      	let proxy        = this.args;
      	let bindProperty = attrs[i][1];
      	let property     = bindProperty;
      		if(bindProperty.match(/\./))
      	{
      		[proxy, property] = Bindable.resolve(
      			this.args
      			, bindProperty
      			, true
      		);
      	}
      		let attrib = attrs[i][0];
      		this.onRemove(proxy.bindTo(
      		property
      		, (v)=>{
      			if(v == null)
      			{
      				tag.setAttribute(attrib, '');
      				return;
      			}
      			tag.setAttribute(attrib, v);
      		}
      	));
      }
      	return tag;
      	//*/
    }
  }, {
    key: "compileAttrTag",
    value: function compileAttrTag(sourceTag) {
      var attrProperty = sourceTag.getAttribute('cv-attr');
      var pairs = attrProperty.split(',');
      var attrs = pairs.map(function (p) {
        return p.split(':');
      });
      sourceTag.removeAttribute('cv-attr');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);

        var _loop3 = function _loop3(i) {
          var bindProperty = attrs[i][1];

          var _Bindable$resolve = _Bindable.Bindable.resolve(bindingView.args, bindProperty, true),
              _Bindable$resolve2 = _slicedToArray(_Bindable$resolve, 2),
              proxy = _Bindable$resolve2[0],
              property = _Bindable$resolve2[1];

          var attrib = attrs[i][0];
          bindingView.onRemove(proxy.bindTo(property, function (v) {
            if (v == null) {
              tag.setAttribute(attrib, '');
              return;
            }

            tag.setAttribute(attrib, v);
          }));
        };

        for (var i in attrs) {
          _loop3(i);
        }

        return tag;
      };
    }
  }, {
    key: "mapInterpolatableTag",
    value: function mapInterpolatableTag(tag) {
      var _this7 = this;

      var regex = this.interpolateRegex;

      if (tag.nodeType === Node.TEXT_NODE) {
        var original = tag.nodeValue;

        if (!this.interpolatable(original)) {
          return tag;
        }

        var header = 0;
        var match;

        var _loop4 = function _loop4() {
          var bindProperty = match[2];
          var unsafeHtml = false;
          var unsafeView = false;
          var propertySplit = bindProperty.split('|');
          var transformer = false;

          if (propertySplit.length > 1) {
            transformer = _this7.stringTransformer(propertySplit.slice(1));
            bindProperty = propertySplit[0];
          }

          if (bindProperty.substr(0, 2) === '$$') {
            unsafeHtml = true;
            unsafeView = true;
            bindProperty = bindProperty.substr(2);
          }

          if (bindProperty.substr(0, 1) === '$') {
            unsafeHtml = true;
            bindProperty = bindProperty.substr(1);
          }

          if (bindProperty.substr(0, 3) === '000') {
            expand = true;
            bindProperty = bindProperty.substr(3);
            return "continue";
          }

          var staticPrefix = original.substring(header, match.index);
          header = match.index + match[1].length;
          var staticNode = document.createTextNode(staticPrefix);
          staticNode[dontParse] = true;
          tag.parentNode.insertBefore(staticNode, tag);
          var dynamicNode = void 0;

          if (unsafeHtml) {
            dynamicNode = document.createElement('div');
          } else {
            dynamicNode = document.createTextNode('');
          }

          dynamicNode[dontParse] = true;
          var proxy = _this7.args;
          var property = bindProperty;

          if (bindProperty.match(/\./)) {
            var _Bindable$resolve3 = _Bindable.Bindable.resolve(_this7.args, bindProperty, true);

            var _Bindable$resolve4 = _slicedToArray(_Bindable$resolve3, 2);

            proxy = _Bindable$resolve4[0];
            property = _Bindable$resolve4[1];
          }

          tag.parentNode.insertBefore(dynamicNode, tag);
          var debind = proxy.bindTo(property, function (v, k, t) {
            if (t[k] instanceof View && t[k] !== v) {
              if (!t[k].preserve) {
                t[k].remove();
              }
            }

            dynamicNode.nodeValue = '';

            if (unsafeView && !(v instanceof View)) {
              var unsafeTemplate = v;
              v = new View(_this7.args, _this7);
              v.template = unsafeTemplate;
            }

            if (v instanceof View) {
              var onAttach = function onAttach(parentNode) {
                v.attached(parentNode);
              };

              _this7.attach.add(onAttach);

              v.render(tag.parentNode, dynamicNode);

              var cleanup = function cleanup() {
                if (!v.preserve) {
                  v.remove();
                }
              };

              _this7.onRemove(cleanup);

              v.onRemove(function () {
                _this7.attach.remove(onAttach);

                _this7._onRemove.remove(cleanup);
              });
            } else {
              if (transformer) {
                v = transformer(v);
              }

              if (v instanceof Object && v.__toString instanceof Function) {
                v = v.__toString();
              }

              if (unsafeHtml) {
                dynamicNode.innerHTML = v;
              } else {
                dynamicNode.nodeValue = v;
              }

              dynamicNode[dontParse] = true;
            }
          });

          _this7.onRemove(function () {
            debind();

            if (!proxy.isBound()) {
              _Bindable.Bindable.clearBindings(proxy);
            }
          });
        };

        while (match = regex.exec(original)) {
          var _ret3 = _loop4();

          if (_ret3 === "continue") continue;
        }

        var staticSuffix = original.substring(header);
        var staticNode = document.createTextNode(staticSuffix);
        staticNode[dontParse] = true;
        tag.parentNode.insertBefore(staticNode, tag);
        tag.nodeValue = '';
      }

      if (tag.nodeType === Node.ELEMENT_NODE) {
        var _loop5 = function _loop5(i) {
          if (!_this7.interpolatable(tag.attributes[i].value)) {
            // console.log('!!', tag.attributes[i].value);
            return "continue";
          } // console.log(tag.attributes[i].value);


          var header = 0;
          var match = void 0;
          var original = tag.attributes[i].value;
          var attribute = tag.attributes[i];
          var bindProperties = {};
          var segments = [];

          while (match = regex.exec(original)) {
            segments.push(original.substring(header, match.index));

            if (!bindProperties[match[2]]) {
              bindProperties[match[2]] = [];
            }

            bindProperties[match[2]].push(segments.length);
            segments.push(match[1]);
            header = match.index + match[1].length;
          }

          segments.push(original.substring(header));

          var _loop6 = function _loop6(j) {
            var proxy = _this7.args;
            var property = j;
            var propertySplit = j.split('|');
            var transformer = false;
            var longProperty = j;

            if (propertySplit.length > 1) {
              transformer = _this7.stringTransformer(propertySplit.slice(1));
              property = propertySplit[0];
            }

            if (property.match(/\./)) {
              var _Bindable$resolve5 = _Bindable.Bindable.resolve(_this7.args, property, true);

              var _Bindable$resolve6 = _slicedToArray(_Bindable$resolve5, 2);

              proxy = _Bindable$resolve6[0];
              property = _Bindable$resolve6[1];
            } // if(property.match(/\./))
            // {
            // 	[proxy, property] = Bindable.resolve(
            // 		this.args
            // 		, property
            // 		, true
            // 	);
            // }
            // console.log(this.args, property);


            var matching = [];
            var bindProperty = j;
            var matchingSegments = bindProperties[longProperty];

            _this7.onRemove(proxy.bindTo(property, function (v, k, t, d) {
              if (transformer) {
                v = transformer(v);
              }

              for (var _i7 in bindProperties) {
                for (var _j in bindProperties[longProperty]) {
                  segments[bindProperties[longProperty][_j]] = t[_i7];

                  if (k === property) {
                    segments[bindProperties[longProperty][_j]] = v;
                  }
                }
              }

              tag.setAttribute(attribute.name, segments.join(''));
            }));

            _this7.onRemove(function () {
              if (!proxy.isBound()) {
                _Bindable.Bindable.clearBindings(proxy);
              }
            });
          };

          for (var j in bindProperties) {
            _loop6(j);
          }
        };

        for (var i = 0; i < tag.attributes.length; i++) {
          var _ret4 = _loop5(i);

          if (_ret4 === "continue") continue;
        }
      }

      return tag;
    }
  }, {
    key: "mapRefTag",
    value: function mapRefTag(tag) {
      var refAttr = tag.getAttribute('cv-ref');

      var _refAttr$split = refAttr.split(':'),
          _refAttr$split2 = _slicedToArray(_refAttr$split, 3),
          refProp = _refAttr$split2[0],
          refClassname = _refAttr$split2[1],
          refKey = _refAttr$split2[2];

      if (!refClassname) {
        refClassname = 'curvature/base/Tag';
      }

      var refClass = this.stringToClass(refClassname);
      tag.removeAttribute('cv-ref');
      Object.defineProperty(tag, '___tag___', {
        enumerable: false,
        writable: true
      });
      this.onRemove(function () {
        tag.___tag___ = null;
        tag.remove();
      });
      var parent = this;
      var direct = this;

      if (this.viewList) {
        parent = this.viewList.parent; // if(!this.viewList.parent.tags[refProp])
        // {
        // 	this.viewList.parent.tags[refProp] = [];
        // }
        // let refKeyVal = this.args[refKey];
        // this.viewList.parent.tags[refProp][refKeyVal] = new refClass(
        // 	tag, this, refProp, refKeyVal
        // );
      } else {// this.tags[refProp] = new refClass(
          // 	tag, this, refProp
          // );
        }

      var tagObject = new refClass(tag, this, refProp, undefined, direct);
      tag.___tag___ = tagObject;
      this.tags[refProp] = tag;

      while (parent) {
        if (!parent.parent) {}

        var refKeyVal = this.args[refKey];

        if (refKeyVal !== undefined) {
          if (!parent.tags[refProp]) {
            parent.tags[refProp] = [];
          }

          parent.tags[refProp][refKeyVal] = tagObject;
        } else {
          parent.tags[refProp] = tagObject;
        }

        parent = parent.parent;
      }

      return tag;
    }
  }, {
    key: "mapBindTag",
    value: function mapBindTag(tag) {
      var _this8 = this;

      var bindArg = tag.getAttribute('cv-bind');
      var proxy = this.args;
      var property = bindArg;
      var top = null;

      if (bindArg.match(/\./)) {
        var _Bindable$resolve7 = _Bindable.Bindable.resolve(this.args, bindArg, true);

        var _Bindable$resolve8 = _slicedToArray(_Bindable$resolve7, 3);

        proxy = _Bindable$resolve8[0];
        property = _Bindable$resolve8[1];
        top = _Bindable$resolve8[2];
      }

      if (proxy !== this.args) {
        this.subBindings[bindArg] = this.subBindings[bindArg] || [];
        this.onRemove(this.args.bindTo(top, function () {
          while (_this8.subBindings.length) {
            _this8.subBindings.shift()();
          }
        }));
      }

      var unsafeHtml = false;

      if (property.substr(0, 1) === '$') {
        property = property.substr(1);
        unsafeHtml = true;
      }

      var debind = proxy.bindTo(property, function (v, k, t, d, p) {
        if (p instanceof View && p !== v) {
          p.remove();
        }

        var autoChangedEvent = new CustomEvent('cvAutoChanged', {
          bubbles: true
        });

        if (tag.tagName === 'INPUT' || tag.tagName === 'SELECT' || tag.tagName === 'TEXTAREA') {
          var _type = tag.getAttribute('type');

          if (_type && _type.toLowerCase() === 'checkbox') {
            tag.checked = !!v;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type && _type.toLowerCase() === 'radio') {
            tag.checked = v == tag.value;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type !== 'file') {
            if (tag.tagName === 'SELECT') {
              // console.log(k, v, tag.outerHTML, tag.options.length);
              for (var i in tag.options) {
                var option = tag.options[i];

                if (option.value == v) {
                  tag.selectedIndex = i;
                }
              }
            }

            tag.value = v == null ? '' : v;
            tag.dispatchEvent(autoChangedEvent);
          }
        } else {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = tag.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var node = _step.value;
              node.remove();
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          if (v instanceof View) {
            var onAttach = function onAttach(parentNode) {
              v.attached(parentNode);
            };

            _this8.attach.add(onAttach);

            v.render(tag);
            v.onRemove(function () {
              return _this8.attach.remove(onAttach);
            });
          } else if (unsafeHtml) {
            tag.innerHTML = v;
          } else {
            tag.textContent = v;
          }
        }
      });

      if (proxy !== this.args) {
        this.subBindings[bindArg].push(debind);
      }

      this.onRemove(debind);
      var type = tag.getAttribute('type');
      var multi = tag.getAttribute('multiple');

      var inputListener = function inputListener(event) {
        // console.log(event, proxy, property, event.target.value);
        if (event.target !== tag) {
          return;
        }

        if (type && type.toLowerCase() === 'checkbox') {
          if (tag.checked) {
            proxy[property] = event.target.getAttribute('value');
          } else {
            proxy[property] = false;
          }
        } else if (type === 'file' && multi) {
          var files = Array.from(event.target.files);
          var current = proxy[property] || proxy.___deck___[property];

          if (!current || !files.length) {
            proxy[property] = files;
          } else {
            var _loop7 = function _loop7(i) {
              if (files[i] !== current[i]) {
                files[i].toJSON = function () {
                  return {
                    name: file[i].name,
                    size: file[i].size,
                    type: file[i].type,
                    date: file[i].lastModified
                  };
                };

                current[i] = files[i];
                return "break";
              }
            };

            for (var i in files) {
              var _ret5 = _loop7(i);

              if (_ret5 === "break") break;
            }
          }
        } else if (type === 'file' && !multi) {
          var _file = event.target.files.item(0);

          _file.toJSON = function () {
            return {
              name: _file.name,
              size: _file.size,
              type: _file.type,
              date: _file.lastModified
            };
          };

          proxy[property] = _file;
        } else {
          proxy[property] = event.target.value;
        }
      };

      if (type === 'file' || type === 'radio') {
        tag.addEventListener('change', inputListener);
      } else {
        tag.addEventListener('input', inputListener);
        tag.addEventListener('change', inputListener);
        tag.addEventListener('value-changed', inputListener);
      }

      this.onRemove(function (tag, eventListener) {
        return function () {
          if (type === 'file' || type === 'radio') {
            tag.removeEventListener('change', inputListener);
          } else {
            tag.removeEventListener('input', inputListener);
            tag.removeEventListener('change', inputListener);
            tag.removeEventListener('value-changed', inputListener);
          }

          tag = undefined;
          eventListener = undefined;
        };
      }(tag, inputListener));
      tag.removeAttribute('cv-bind');
      return tag;
    }
  }, {
    key: "mapOnTag",
    value: function mapOnTag(tag) {
      var _this9 = this;

      var referent = String(tag.getAttribute('cv-on'));
      var action = referent.split(';').map(function (a) {
        return a.split(':');
      }).map(function (a) {
        a = a.map(function (a) {
          return a.trim();
        });
        var eventName = a[0].trim();
        var callbackName = a[1];
        var eventFlags = String(a[2] || '');
        var argList = [];
        var groups = /(\w+)(?:\(([$\w\s'",]+)\))?/.exec(callbackName);

        if (!groups) {
          throw new Error('Invalid event method referent: ' + tag.getAttribute('cv-on'));
        }

        if (groups.length) {
          callbackName = groups[1].replace(/(^[\s\n]+|[\s\n]+$)/, '');

          if (groups[2]) {
            argList = groups[2].split(',').map(function (s) {
              return s.trim();
            });
          }
        }

        if (!eventName) {
          eventName = callbackName;
        }

        var eventMethod;
        var parent = _this9;

        while (parent) {
          if (typeof parent[callbackName] === 'function') {
            var _ret6 = function () {
              var _parent = parent;
              var _callBackName = callbackName;

              eventMethod = function eventMethod() {
                _parent[_callBackName].apply(_parent, arguments);
              };

              return "break";
            }();

            if (_ret6 === "break") break;
          }

          if (parent.parent) {
            parent = parent.parent;
          } else {
            break;
          }
        }

        var eventListener = function eventListener(event) {
          var argRefs = argList.map(function (arg) {
            var match;

            if (parseInt(arg) == arg) {
              return arg;
            } else if (arg === 'event' || arg === '$event') {
              return event;
            } else if (arg === '$view') {
              return parent;
            } else if (arg === '$tag') {
              return tag;
            } else if (arg === '$parent') {
              return _this9.parent;
            } else if (arg === '$subview') {
              return _this9;
            } else if (arg in _this9.args) {
              return _this9.args[arg];
            } else if (match = /^['"](\w+?)["']$/.exec(arg)) {
              return match[1];
            }
          });

          if (!(typeof eventMethod === 'function')) {
            throw new Error("".concat(callbackName, " is not defined on View object.") + "\n" + "Tag:" + "\n" + "".concat(tag.outerHTML));
          }

          eventMethod.apply(void 0, _toConsumableArray(argRefs));
        };

        var eventOptions = {};

        if (eventFlags.includes('p')) {
          eventOptions.passive = true;
        } else if (eventFlags.includes('P')) {
          eventOptions.passive = false;
        }

        if (eventFlags.includes('c')) {
          eventOptions.capture = true;
        } else if (eventFlags.includes('C')) {
          eventOptions.capture = false;
        }

        if (eventFlags.includes('o')) {
          eventOptions.once = true;
        } else if (eventFlags.includes('O')) {
          eventOptions.once = false;
        }

        switch (eventName) {
          case '_init':
            eventListener();
            break;

          case '_attach':
            _this9.attach.add(eventListener);

            break;

          case '_detach':
            _this9.detach.add(eventListener);

            break;

          default:
            tag.addEventListener(eventName, eventListener, eventOptions);

            _this9.onRemove(function () {
              tag.removeEventListener(eventName, eventListener, eventOptions);
            });

            break;
        }

        return [eventName, callbackName, argList];
      });
      tag.removeAttribute('cv-on');
      return tag;
    }
  }, {
    key: "mapLinkTag",
    value: function mapLinkTag(tag) {
      /*/
      const tagCompiler = this.compileLinkTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var linkAttr = tag.getAttribute('cv-link');
      tag.setAttribute('href', linkAttr);

      var linkClick = function linkClick(event) {
        event.preventDefault();

        if (linkAttr.substring(0, 4) === 'http' || linkAttr.substring(0, 2) === '//') {
          window.open(tag.getAttribute('href', linkAttr));
          return;
        }

        _Router.Router.go(tag.getAttribute('href'));
      };

      tag.addEventListener('click', linkClick);
      this.onRemove(function (tag, eventListener) {
        return function () {
          tag.removeEventListener('click', eventListener);
          tag = undefined;
          eventListener = undefined;
        };
      }(tag, linkClick));
      tag.removeAttribute('cv-link');
      return tag; //*/
    }
  }, {
    key: "compileLinkTag",
    value: function compileLinkTag(sourceTag) {
      var linkAttr = sourceTag.getAttribute('cv-link');
      sourceTag.removeAttribute('cv-link');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        tag.setAttribute('href', linkAttr);
        tag.addEventListener('click', View.linkClicked);
        bindingView.onRemove(function () {
          return tag.removeEventListener(View.linkClicked);
        });
        return tag;
      };
    }
  }, {
    key: "mapPrendererTag",
    value: function mapPrendererTag(tag) {
      var prerenderAttr = tag.getAttribute('cv-prerender');
      var prerendering = window.prerenderer || navigator.userAgent.match(/prerender/i);

      if (prerendering) {
        window.prerenderer = window.prerenderer || true;
      }

      if (prerenderAttr === 'never' && prerendering || prerenderAttr === 'only' && !prerendering) {
        tag.parentNode.removeChild(tag);
      }

      return tag;
    }
  }, {
    key: "mapWithTag",
    value: function mapWithTag(tag) {
      var _this10 = this;

      var withAttr = tag.getAttribute('cv-with');
      var carryAttr = tag.getAttribute('cv-carry');
      tag.removeAttribute('cv-with');
      tag.removeAttribute('cv-carry');
      var subTemplate = new DocumentFragment();
      Array.from(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });
      var carryProps = [];

      if (carryAttr) {
        carryProps = carryAttr.split(',').map(function (s) {
          return s.trim();
        });
      }

      var debind = this.args.bindTo(withAttr, function (v, k, t, d) {
        if (_this10.withViews[k]) {
          _this10.withViews[k].remove();
        }

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        var view = new View({}, _this10);

        _this10.onRemove(function (view) {
          return function () {
            view.remove();
          };
        }(view));

        view.template = subTemplate;

        var _loop8 = function _loop8(i) {
          var debind = _this10.args.bindTo(carryProps[i], function (v, k) {
            view.args[k] = v;
          });

          view.onRemove(debind);

          _this10.onRemove(function () {
            debind();
            view.remove();
          });
        };

        for (var i in carryProps) {
          _loop8(i);
        }

        var _loop9 = function _loop9(_i8) {
          var debind = v.bindTo(_i8, function (v, k) {
            view.args[k] = v;
          });

          _this10.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }

            view.remove();
          });

          view.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }
          });
        };

        for (var _i8 in v) {
          _loop9(_i8);
        }

        view.render(tag);
        _this10.withViews[k] = view;
      });
      this.onRemove(debind);
      return tag;
    }
  }, {
    key: "mapEachTag",
    value: function mapEachTag(tag) {
      var _this11 = this;

      var eachAttr = tag.getAttribute('cv-each');
      tag.removeAttribute('cv-each');
      var subTemplate = new DocumentFragment();
      Array.from(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });

      var _eachAttr$split = eachAttr.split(':'),
          _eachAttr$split2 = _slicedToArray(_eachAttr$split, 3),
          eachProp = _eachAttr$split2[0],
          asProp = _eachAttr$split2[1],
          keyProp = _eachAttr$split2[2];

      var debind = this.args.bindTo(eachProp, function (v, k, t, d, p) {
        if (_this11.viewLists[eachProp]) {
          _this11.viewLists[eachProp].remove();
        }

        var viewList = new _ViewList.ViewList(subTemplate, asProp, v, _this11, keyProp);

        var viewListRemover = function viewListRemover() {
          return viewList.remove();
        };

        _this11.onRemove(viewListRemover);

        viewList.onRemove(function () {
          return _this11._onRemove.remove(viewListRemover);
        });

        var debindA = _this11.args.bindTo(function (v, k, t, d) {
          if (k === '_id') {
            return;
          }

          viewList.args.subArgs[k] = v;
        });

        var debindB = viewList.args.bindTo(function (v, k, t, d, p) {
          if (k === '_id' || k === 'value' || k.substring(0, 3) === '___') {
            return;
          }

          if (k in _this11.args) {
            _this11.args[k] = v;
          }
        });
        viewList.onRemove(debindA);
        viewList.onRemove(debindB);

        _this11.onRemove(debindA);

        _this11.onRemove(debindB);

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        _this11.viewLists[eachProp] = viewList;
        viewList.render(tag);
      });
      this.onRemove(debind);
      return tag;
    }
  }, {
    key: "mapIfTag",
    value: function mapIfTag(tag) {
      /*/
      const tagCompiler = this.compileIfTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      	/*/
      var sourceTag = tag;
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      sourceTag.removeAttribute('cv-if');

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      } // n => subTemplate.appendChild(n.cloneNode(true))
      );
      var bindingView = this;
      var ifDoc = new DocumentFragment();
      var view = new View(this.args, bindingView);
      view.template = subTemplate; // view.parent   = bindingView;
      // bindingView.syncBind(view);

      var proxy = bindingView.args;
      var property = ifProperty;

      if (ifProperty.match(/\./)) {
        var _Bindable$resolve9 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

        var _Bindable$resolve10 = _slicedToArray(_Bindable$resolve9, 2);

        proxy = _Bindable$resolve10[0];
        property = _Bindable$resolve10[1];
      }

      var hasRendered = false;
      var propertyDebind = proxy.bindTo(property, function (v, k) {
        if (!hasRendered) {
          var initValue = proxy[property];
          var renderDoc = !!initValue ^ !!inverted ? tag : ifDoc;
          view.render(renderDoc);
          hasRendered = true;
          return;
        }

        if (Array.isArray(v)) {
          v = !!v.length;
        }

        if (inverted) {
          v = !v;
        }

        if (v) {
          tag.appendChild(ifDoc);
        } else {
          view.nodes.map(function (n) {
            return ifDoc.appendChild(n);
          });
        }
      }); // const propertyDebind = this.args.bindChain(property, onUpdate);

      bindingView.onRemove(propertyDebind);

      var bindableDebind = function bindableDebind() {
        if (!proxy.isBound()) {
          _Bindable.Bindable.clearBindings(proxy);
        }
      };

      var viewDebind = function viewDebind() {
        propertyDebind();
        bindableDebind();

        bindingView._onRemove.remove(propertyDebind);

        bindingView._onRemove.remove(bindableDebind);
      };

      bindingView.onRemove(viewDebind);
      return tag; //*/
    }
  }, {
    key: "compileIfTag",
    value: function compileIfTag(sourceTag) {
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      sourceTag.removeAttribute('cv-if');

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n.cloneNode(true));
      });
      return function (bindingView) {
        var tag = sourceTag.cloneNode();
        var ifDoc = new DocumentFragment();
        var view = new View({}, bindingView);
        view.template = subTemplate; // view.parent   = bindingView;

        bindingView.syncBind(view);
        var proxy = bindingView.args;
        var property = ifProperty;

        if (ifProperty.match(/\./)) {
          var _Bindable$resolve11 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

          var _Bindable$resolve12 = _slicedToArray(_Bindable$resolve11, 2);

          proxy = _Bindable$resolve12[0];
          property = _Bindable$resolve12[1];
        }

        var hasRendered = false;
        var propertyDebind = proxy.bindTo(property, function (v, k) {
          if (!hasRendered) {
            var renderDoc = bindingView.args[property] || inverted ? tag : ifDoc;
            view.render(renderDoc);
            hasRendered = true;
            return;
          }

          if (Array.isArray(v)) {
            v = !!v.length;
          }

          if (inverted) {
            v = !v;
          }

          if (v) {
            tag.appendChild(ifDoc);
          } else {
            view.nodes.map(function (n) {
              return ifDoc.appendChild(n);
            });
          }
        }); // let cleaner = bindingView;
        // while(cleaner.parent)
        // {
        // 	cleaner = cleaner.parent;
        // }

        bindingView.onRemove(propertyDebind);

        var bindableDebind = function bindableDebind() {
          if (!proxy.isBound()) {
            _Bindable.Bindable.clearBindings(proxy);
          }
        };

        var viewDebind = function viewDebind() {
          propertyDebind();
          bindableDebind();

          bindingView._onRemove.remove(propertyDebind);

          bindingView._onRemove.remove(bindableDebind);
        };

        view.onRemove(viewDebind);
        return tag;
      };
    }
  }, {
    key: "mapTemplateTag",
    value: function mapTemplateTag(tag) {
      var templateName = tag.getAttribute('cv-template');
      tag.removeAttribute('cv-template');

      this.subTemplates[templateName] = function () {
        return tag.tagName === 'TEMPLATE' ? tag.content.cloneNode(true) : new DocumentFragment(tag.innerHTML);
      };

      return tag;
    }
  }, {
    key: "mapSlotTag",
    value: function mapSlotTag(tag) {
      var templateName = tag.getAttribute('cv-slot');
      var getTemplate = this.subTemplates[templateName];

      if (!getTemplate) {
        var parent = this;

        while (parent) {
          getTemplate = parent.subTemplates[templateName];

          if (getTemplate) {
            break;
          }

          parent = this.parent;
        }

        if (!getTemplate) {
          console.error("Template ".concat(templateName, " not found."));
          return;
        }
      }

      var template = getTemplate();
      tag.removeAttribute('cv-slot');

      while (tag.firstChild) {
        tag.firstChild.remove();
      }

      tag.appendChild(template);
      return tag;
    } // compileTag(sourceTag)
    // {
    // 	return (bindingView) => {
    // 		const tag = sourceTag.cloneNode(true);
    // 		return tag;
    // 	};
    // }

  }, {
    key: "syncBind",
    value: function syncBind(subView) {
      var _this12 = this;

      var debindA = this.args.bindTo(function (v, k, t, d) {
        if (k === '_id') {
          return;
        }

        if (subView.args[k] !== v) {
          subView.args[k] = v;
        }
      }); // for(let i in this.args)
      // {
      // 	if(i == '_id')
      // 	{
      // 		continue;
      // 	}
      // 	subView.args[i] = this.args[i];
      // }

      var debindB = subView.args.bindTo(function (v, k, t, d, p) {
        if (k === '_id') {
          return;
        }

        var newRef = v;
        var oldRef = p;

        if (newRef instanceof View) {
          newRef = newRef.___ref___;
        }

        if (oldRef instanceof View) {
          oldRef = oldRef.___ref___;
        }

        if (newRef !== oldRef && oldRef instanceof View) {
          p.remove();
        }

        if (k in _this12.args) {
          _this12.args[k] = v;
        }
      });
      this.onRemove(debindA);
      this.onRemove(debindB);
      subView.onRemove(function () {
        _this12._onRemove.remove(debindA);

        _this12._onRemove.remove(debindB);
      });
    }
  }, {
    key: "postRender",
    value: function postRender(parentNode) {}
  }, {
    key: "attached",
    value: function attached(parentNode) {}
  }, {
    key: "interpolatable",
    value: function interpolatable(str) {
      return !!String(str).match(this.interpolateRegex);
    }
  }, {
    key: "uuid",
    value: function uuid() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this13 = this;

      var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var remover = function remover() {
        _this13.firstNode = _this13.lastNode = undefined;

        for (var _i9 in _this13.nodes) {
          _this13.nodes[_i9].dispatchEvent(new Event('cvDomDetached'));

          _this13.nodes[_i9].remove();
        } // Bindable.clearBindings(this.args);

      };

      if (now) {
        remover();
      } else {
        requestAnimationFrame(remover);
      }

      var callbacks = this._onRemove.items();

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = callbacks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var callback = _step2.value;

          this._onRemove.remove(callback);

          callback();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup && cleanup();
      }

      for (var _i10 in this.viewLists) {
        if (!this.viewLists[_i10]) {
          continue;
        }

        this.viewLists[_i10].remove();
      }

      this.viewLists = [];

      for (var _i11 in this.timeouts) {
        clearInterval(this.timeouts[_i11].timeout);
        delete this.timeouts[_i11];
      }

      for (var i in this.intervals) {
        clearInterval(this.intervals[i].timeout);
        delete this.intervals[i];
      }

      this.removed = true;
    }
  }, {
    key: "findTag",
    value: function findTag(selector) {
      for (var i in this.nodes) {
        var result = void 0;

        if (!this.nodes[i].querySelector) {
          continue;
        }

        if (this.nodes[i].matches(selector)) {
          return this.nodes[i];
        }

        if (result = this.nodes[i].querySelector(selector)) {
          return result;
        }
      }
    }
  }, {
    key: "findTags",
    value: function findTags(selector) {
      return this.nodes, map(function (n) {
        return n.querySelectorAll(selector);
      }).flat();
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "update",
    value: function update() {}
  }, {
    key: "beforeUpdate",
    value: function beforeUpdate(args) {}
  }, {
    key: "afterUpdate",
    value: function afterUpdate(args) {}
  }, {
    key: "stringTransformer",
    value: function stringTransformer(methods) {
      var _this14 = this;

      return function (x) {
        for (var m in methods) {
          var parent = _this14;
          var method = methods[m];

          while (parent && !parent[method]) {
            parent = parent.parent;
          }

          if (!parent) {
            return;
          }

          x = parent[methods[m]](x);
        }

        return x;
      };
    }
  }, {
    key: "stringToClass",
    value: function stringToClass(refClassname) {
      if (View.refClasses.has(refClassname)) {
        return View.refClasses.get(refClassname);
      }

      var refClassSplit = refClassname.split('/');
      var refShortClassname = refClassSplit[refClassSplit.length - 1];

      var refClass = require(refClassname);

      View.refClasses.set(refClassname, refClass[refShortClassname]);
      return refClass[refShortClassname];
    }
  }, {
    key: "preventParsing",
    value: function preventParsing(node) {
      node[dontParse] = true;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.nodes.map(function (n) {
        return n.outerHTML;
      }).join(' ');
    }
  }], [{
    key: "isView",
    value: function isView() {
      return View;
    }
  }]);

  return View;
}();

exports.View = View;
Object.defineProperty(View, 'templates', {
  enumerable: false,
  writable: false,
  value: new Map()
});
Object.defineProperty(View, 'refClasses', {
  enumerable: false,
  writable: false,
  value: new Map()
});
Object.defineProperty(View, 'linkClicked', function (event) {
  event.preventDefault();
  var href = event.target.getAttribute('href');

  if (href.substring(0, 4) === 'http' || href.substring(0, 2) === '//') {
    window.open(href);
    return;
  }

  _Router.Router.go(href);
});
  })();
});

require.register("curvature/base/ViewList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewList = void 0;

var _Bindable = require("./Bindable");

var _View = require("./View");

var _Bag = require("./Bag");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ViewList = /*#__PURE__*/function () {
  function ViewList(template, subProperty, list, parent) {
    var _this = this;

    var keyProperty = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, ViewList);

    this.removed = false;
    this.args = _Bindable.Bindable.makeBindable({});
    this.args.value = _Bindable.Bindable.makeBindable(list || {});
    this.args.subArgs = _Bindable.Bindable.makeBindable({});
    this.views = [];
    this.cleanup = [];
    this._onRemove = new _Bag.Bag();
    this.template = template;
    this.subProperty = subProperty;
    this.keyProperty = keyProperty;
    this.tag = null;
    this.paused = false;
    this.parent = parent;
    this.rendered = new Promise(function (accept, reject) {
      Object.defineProperty(_this, 'renderComplete', {
        configurable: false,
        writable: true,
        value: accept
      });
    });
    this.willReRender = false;

    this.args.___before(function (t, e, s, o) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = true;
    });

    this.args.___after(function (t, e, s, o) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = s.length > 1;

      _this.reRender();
    });

    var debind = this.args.value.bindTo(function (v, k, t, d) {
      if (_this.paused) {
        return;
      }

      var kk = k;

      if (isNaN(k)) {
        kk = '_' + k;
      }

      if (d) {
        if (_this.views[kk]) {
          _this.views[kk].remove();
        }

        delete _this.views[kk]; // this.views.splice(k,1);

        for (var i in _this.views) {
          if (typeof i === 'string') {
            _this.views[i].args[_this.keyProperty] = i.substr(1);
            continue;
          }

          _this.views[i].args[_this.keyProperty] = i;
        }
      } else if (!_this.views[kk] && !_this.willReRender) {
        _this.willReRender = requestAnimationFrame(function () {
          _this.reRender();
        });
      } else if (_this.views[kk] && _this.views[kk].args) {
        _this.views[kk].args[_this.keyProperty] = k;
        _this.views[kk].args[_this.subProperty] = v;
      }
    });

    this._onRemove.add(debind);
  }

  _createClass(ViewList, [{
    key: "render",
    value: function render(tag) {
      var _this2 = this;

      var renders = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var view = _step.value;
          view.render(tag);
          renders.push(view.rendered.then(function () {
            return view;
          }));
        };

        for (var _iterator = this.views[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.tag = tag;
      Promise.all(renders).then(function (views) {
        return _this2.renderComplete(views);
      });
    }
  }, {
    key: "reRender",
    value: function reRender() {
      var _this3 = this;

      if (this.paused || !this.tag) {
        return;
      }

      var views = [];

      for (var i in this.views) {
        views[i] = this.views[i];
      }

      var finalViews = [];

      for (var _i in this.args.value) {
        var found = false;
        var k = _i;

        if (isNaN(k)) {
          k = '_' + _i;
        }

        for (var j in views) {
          if (views[j] && this.args.value[_i] !== undefined && this.args.value[_i] === views[j].args[this.subProperty]) {
            found = true;
            finalViews[k] = views[j];
            finalViews[k].args[this.keyProperty] = _i;
            delete views[j];
            break;
          }
        }

        if (!found) {
          (function () {
            var viewArgs = {};
            var view = finalViews[k] = new _View.View(viewArgs, _this3.parent);
            finalViews[k].template = _this3.template instanceof Object ? _this3.template : _this3.template; // finalViews[k].parent   = this.parent;

            finalViews[k].viewList = _this3;
            finalViews[k].args[_this3.keyProperty] = _i;
            finalViews[k].args[_this3.subProperty] = _this3.args.value[_i];
            var upDebind = viewArgs.bindTo(_this3.subProperty, function (v, k) {
              var index = viewArgs[_this3.keyProperty];
              _this3.args.value[index] = v;
            });

            var downDebind = _this3.args.subArgs.bindTo(function (v, k, t, d) {
              viewArgs[k] = v;
            });

            view.onRemove(function () {
              upDebind();
              downDebind();

              _this3._onRemove.remove(upDebind);

              _this3._onRemove.remove(downDebind);
            });

            _this3._onRemove.add(upDebind);

            _this3._onRemove.add(downDebind);

            viewArgs[_this3.subProperty] = _this3.args.value[_i];
          })();
        }
      }

      for (var _i2 in views) {
        var _found = false;

        for (var _j in finalViews) {
          if (views[_i2] === finalViews[_j]) {
            _found = true;
            break;
          }
        }

        if (!_found) {
          views[_i2].remove();
        }
      }

      if (Array.isArray(this.args.value)) {
        var renderRecurse = function renderRecurse() {
          var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var ii = finalViews.length - i - 1;

          if (!finalViews[ii]) {
            return Promise.resolve();
          }

          if (finalViews[ii] === _this3.views[ii]) {
            if (!finalViews[ii].firstNode) {
              finalViews[ii].render(_this3.tag, finalViews[ii + 1]);
              return finalViews[ii].rendered.then(function () {
                return renderRecurse(i + 1);
              });
            }

            return renderRecurse(i + 1);
          }

          finalViews[ii].render(_this3.tag, finalViews[ii + 1]);

          _this3.views.splice(ii, 0, finalViews[ii]);

          return finalViews[ii].rendered.then(function () {
            return renderRecurse(i + 1);
          });
        };

        this.rendered = renderRecurse();
      } else {
        var renders = [];
        var leftovers = Object.assign({}, finalViews);

        var _loop2 = function _loop2(_i3) {
          delete leftovers[_i3];

          if (finalViews[_i3].firstNode && finalViews[_i3] === _this3.views[_i3]) {
            return "continue";
          }

          finalViews[_i3].render(_this3.tag);

          renders.push(finalViews[_i3].rendered.then(function () {
            return finalViews[_i3];
          }));
        };

        for (var _i3 in finalViews) {
          var _ret = _loop2(_i3);

          if (_ret === "continue") continue;
        }

        for (var _i4 in leftovers) {
          delete this.args.views[_i4];
          leftovers.remove();
        }

        this.rendered = Promise.all(renders);
      }

      this.views = finalViews;

      for (var _i5 in finalViews) {
        if (isNaN(_i5)) {
          finalViews[_i5].args[this.keyProperty] = _i5.substr(1);
          continue;
        }

        finalViews[_i5].args[this.keyProperty] = _i5;
      }

      this.willReRender = false;
    }
  }, {
    key: "pause",
    value: function pause() {
      var _pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      for (var i in this.views) {
        this.views[i].pause(_pause);
      }
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "remove",
    value: function remove() {
      for (var i in this.views) {
        this.views[i].remove();
      }

      var onRemove = this._onRemove.items();

      for (var _i6 in onRemove) {
        this._onRemove.remove(onRemove[_i6]);

        onRemove[_i6]();
      }

      var cleanup;

      while (this.cleanup.length) {
        cleanup = this.cleanup.pop();
        cleanup();
      }

      this.views = [];

      while (this.tag && this.tag.firstChild) {
        this.tag.removeChild(this.tag.firstChild);
      }

      if (this.args.subArgs) {
        _Bindable.Bindable.clearBindings(this.args.subArgs);
      }

      _Bindable.Bindable.clearBindings(this.args);

      if (this.args.value && !this.args.value.isBound()) {
        _Bindable.Bindable.clearBindings(this.args.value);
      }

      this.removed = true;
    }
  }]);

  return ViewList;
}();

exports.ViewList = ViewList;
  })();
});
require.register("apps/iconExplorer/IconExplorer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconExplorer = void 0;

var _Task2 = require("task/Task");

var _Icon = require("../../icon/Icon");

var _Home = require("../../home/Home");

var _Bindable = require("curvature/base/Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var IconExplorer = /*#__PURE__*/function (_Task) {
  _inherits(IconExplorer, _Task);

  var _super = _createSuper(IconExplorer);

  function IconExplorer(taskList) {
    var _this;

    _classCallCheck(this, IconExplorer);

    _this = _super.call(this, taskList);

    _defineProperty(_assertThisInitialized(_this), "title", 'Icon Explorer');

    _defineProperty(_assertThisInitialized(_this), "icon", '/w95/3-16-4bit.png');

    _defineProperty(_assertThisInitialized(_this), "template", require('./main.tmp'));

    _this.init = Date.now();
    return _possibleConstructorReturn(_this, _Bindable.Bindable.make(_assertThisInitialized(_this)));
  }

  _createClass(IconExplorer, [{
    key: "attached",
    value: function attached() {
      var _this2 = this;

      this.window.args.icons = Array(73).fill(1).map(function (v, k) {
        var icon = new _Icon.Icon({
          action: function action(event) {
            _this2.window.args.preview = icon.args.src;
            _this2.window.args.content = icon.args.src;
            var large = new _Icon.Icon(Object.assign({}, icon.args));
            var small = new _Icon.Icon(Object.assign({}, icon.args));
            small.args.size = 16;
            _this2.window.args.large = large;
            _this2.window.args.small = small;
            _this2.window.args.smallSrc = small.args.src;
            _this2.window.args.largeSrc = large.args.src;
            _this2.window.args.icon = small.args.src;
          },
          icon: 1 + k,
          name: 1 + k
        });
        return icon;
      });

      if (this.window.tags['small-icon']) {
        var smallIcon = this.window.tags['small-icon'].element;
        smallIcon.style.width = '64px';
        smallIcon.style.height = '64px';
        smallIcon.style.display = 'flex';
        smallIcon.style.justifyContent = 'center';
      }

      if (this.window.tags['large-icon']) {
        var largeIcon = this.window.tags['large-icon'].element;
        largeIcon.style.width = '64px';
        largeIcon.style.height = '64px';
        largeIcon.style.display = 'flex';
        largeIcon.style.justifyContent = 'center';
      }

      this.window.args.bindTo('age', function (v) {// this.args.title = `Icon Explorer - Window Age: ${v}s`
      });
      this.window.onFrame(function () {
        var age = Date.now() - _this2.init;

        _this2.window.args.progr = (age / 100 % 100).toFixed(2);
        _this2.window.args.window.args.age = (age / 1000).toFixed(1);
      });
    }
  }]);

  return IconExplorer;
}(_Task2.Task);

exports.IconExplorer = IconExplorer;
});

;require.register("apps/iconExplorer/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"row\">\n\t<div class = \"spacer\"></div>\n\t<label class = \"icon-label\">16x16<br />[[smallSrc]]</label>\n\t<label class = \"inset icon-frame\" cv-ref = \"small-icon\">\n\t\t[[small]]\n\t</label>\n\t<label class = \"icon-label\">32x32<br />[[largeSrc]]</label>\n\t<label class = \"inset icon-frame\" cv-ref = \"large-icon\">\n\t\t[[large]]\n\t</label>\n</div>\n\n<div class = \"frame white inset scroll margin\">\n\t<div data-role = \"icon-list\" cv-each = \"icons:iicon:i\">[[iicon]]</div>\n</div>\n\n<div class = \"row\">\n\t<label>\n\t\t[[progr]]%\n\t</label>\n\t<progress  class = \"inset\" value=\"[[progr]]\" max=\"100\">\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">Showing: Icons</div>\n\t<div class = \"label inset\">[[age]] seconds old.</div>\n</div>\n"
});

;require.register("apps/nynepad/Nynepad.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nynepad = void 0;

var _Task2 = require("task/Task");

var _Icon = require("../../icon/Icon");

var _Home = require("../../home/Home");

var _MenuBar = require("../../window/MenuBar");

var _Bindable = require("curvature/base/Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Nynepad = /*#__PURE__*/function (_Task) {
  _inherits(Nynepad, _Task);

  var _super = _createSuper(Nynepad);

  function Nynepad(taskList) {
    var _this;

    _classCallCheck(this, Nynepad);

    _this = _super.call(this, taskList);

    _defineProperty(_assertThisInitialized(_this), "title", 'Nynepad 95');

    _defineProperty(_assertThisInitialized(_this), "icon", '/w95/60-16-4bit.png');

    _defineProperty(_assertThisInitialized(_this), "template", require('./main.tmp'));

    _this.init = Date.now();
    _this.window.args.charCount = 'initializing...';
    return _possibleConstructorReturn(_this, _Bindable.Bindable.make(_assertThisInitialized(_this)));
  }

  _createClass(Nynepad, [{
    key: "attached",
    value: function attached() {
      var _this2 = this;

      this.window.args.menuBar = new _MenuBar.MenuBar(this.args, this.window);
      this.window.args.bindTo('document', function (v, k, t, d) {
        _this2.window.args.charCount = v ? v.length : 0;
      });
    }
  }]);

  return Nynepad;
}(_Task2.Task);

exports.Nynepad = Nynepad;
});

;require.register("apps/nynepad/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<textarea cv-bind = \"document\" class = \"inset liquid\"></textarea>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">untitled</div>\n\t<div class = \"label inset\">[[charCount]]</div>\n</div>\n"
});

;require.register("apps/repoBrowser/Folder.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Folder = void 0;

var _View2 = require("curvature/base/View");

var _Bindable = require("curvature/base/Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Folder = /*#__PURE__*/function (_View) {
  _inherits(Folder, _View);

  var _super = _createSuper(Folder);

  function Folder() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Folder);

    _this = _super.call(this, args);
    _this.args.expanded = false;
    _this.args.icon = args.icon || '/w95/4-16-4bit.png';
    _this.args.name = args.name || 'Root'; // this.args.url  = args.url  || 'https://github-proxy.unholyshit.workers.dev/repos/seanmorris/nynex95/contents?ref=master';
    // this.args.url  = args.url  || 'https://red-cherry-cb88.unholyshit.workers.dev/repos/seanmorris/nynex95/contents?ref=master';

    _this.args.url = args.url || 'https://api.github.com/repos/seanmorris/nynex95/contents?ref=master';
    _this.template = require('./folder.tmp');
    return _this;
  }

  _createClass(Folder, [{
    key: "expand",
    value: function expand(event, child) {
      var _this2 = this;

      if (this.args.expanded) {
        this.args.icon = '/w95/4-16-4bit.png';
        this.args.expanded = false;
        return;
      }

      if (this.args.files) {
        this.args.icon = '/w95/5-16-4bit.png';
        this.args.expanded = true;
        return;
      }

      var url = this.args.url + '&t=' + Date.now();
      fetch(url).then(function (r) {
        return r.json();
      }).then(function (files) {
        if (!Array.isArray(files)) {
          _this2.args.browser.window.args.content = '';
          _this2.args.browser.window.args.filename = '';
          _this2.args.browser.window.args.content = 'loading...';

          var _url = files.download_url + (files.download_url.match(/\?/) ? '&t=' : '?t=') + Date.now();

          fetch(_url).then(function (r) {
            return r.text();
          }).then(function (body) {
            _this2.args.browser.window.args.content = '';
            _this2.args.browser.window.args.filename = '';
            _this2.args.browser.window.args.meta = files;
            _this2.args.browser.window.args.content = body;
            _this2.args.browser.window.args.filename = files.name;
          });
          return;
        }

        files.sort(function (a, b) {
          if (a.type !== 'dir' && b.type !== 'dir') {
            return 0;
          }

          if (a.type !== 'dir') {
            return 1;
          }

          if (b.type !== 'dir') {
            return -1;
          }
        });
        _this2.args.files = files.map(function (file) {
          var browser = _this2.args.browser;
          var url = file.url;
          var name = file.name;
          var icon = file.type === 'dir' ? '/w95/4-16-4bit.png' : '/w95/60-16-4bit.png';
          return new Folder({
            browser: browser,
            url: url,
            name: name,
            icon: icon
          });
        });
        _this2.args.icon = '/w95/5-16-4bit.png';
        _this2.args.expanded = true;
      });
    }
  }]);

  return Folder;
}(_View2.View);

exports.Folder = Folder;
});

;require.register("apps/repoBrowser/RepoBrowser.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RepoBrowser = void 0;

var _Task2 = require("task/Task");

var _Icon = require("../../icon/Icon");

var _Home = require("../../home/Home");

var _MenuBar = require("../../window/MenuBar");

var _Bindable = require("curvature/base/Bindable");

var _Folder = require("./Folder");

var _Html = require("../../control/Html");

var _Json = require("../../control/Json");

var _Image = require("../../control/Image");

var _Plaintext = require("../../control/Plaintext");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RepoBrowser = /*#__PURE__*/function (_Task) {
  _inherits(RepoBrowser, _Task);

  var _super = _createSuper(RepoBrowser);

  function RepoBrowser(taskList) {
    var _this;

    _classCallCheck(this, RepoBrowser);

    _this = _super.call(this, taskList);

    _defineProperty(_assertThisInitialized(_this), "title", 'Repo Browser');

    _defineProperty(_assertThisInitialized(_this), "icon", '/w95/73-16-4bit.png');

    _defineProperty(_assertThisInitialized(_this), "template", require('./main.tmp'));

    return _this;
  }

  _createClass(RepoBrowser, [{
    key: "attached",
    value: function attached() {
      var _this2 = this;

      this.window.args.filetype = '';
      this.window.args.chars = '';
      this.window.classes['repo-browser'] = true;
      var folder = new _Folder.Folder({
        browser: this
      });
      this.window.args.files = this.window.args.files || [];
      this.window.args.files.push(folder);
      folder.expand();
      this.window.args.bindTo('filename', function (v) {
        var filetype = (v || '').split('.').pop();

        if (_this2.window.args.control) {
          _this2.window.args.control.remove();
        }

        _this2.window.args.filetype = filetype || '';
        _this2.window.args.chars = 0;

        switch (filetype) {
          case 'md':
            _this2.window.args.control = new _Html.Html({
              srcdoc: 'loading...'
            }, _this2);
            fetch(_this2.window.args.meta.url + '&api=json', {
              headers: {
                Accept: 'application/vnd.github.v3.html+json'
              }
            }).then(function (r) {
              return r.text();
            }).then(function (r) {
              _this2.window.args.control.args.srcdoc = r;
            })["catch"](function (error) {
              _this2.window.args.control.args.srcdoc = error;
            });
            break;

          case 'ico':
          case 'gif':
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'webp':
            _this2.window.args.control = new _Image.Image({
              src: _this2.window.args.meta.download_url
            }, _this2);
            break;

          case 'json':
            _this2.window.args.control = new _Json.Json({
              expanded: 'expanded',
              tree: JSON.parse(_this2.window.args.content)
            }, _this2);
            break;

          default:
            _this2.window.args.control = new _Plaintext.Plaintext({
              content: _this2.window.args.content
            }, _this2);
            break;
        }

        _this2.window.args.chars = (_this2.window.args.content || '').length;
      });
    }
  }]);

  return RepoBrowser;
}(_Task2.Task);

exports.RepoBrowser = RepoBrowser;
});

;require.register("apps/repoBrowser/folder.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"folder\">\n\t<span cv-on = \"click:expand(event, file)\">\n\t\t<img src = \"[[icon]]\" />\n\t\t<label>[[name]]</label>\n\t</span>\n\t<span cv-if = \"expanded\">\n\t\t<div class = \"sub\" cv-each = \"files:file:f\">\n\t\t\t[[file]]\n\t\t</div>\n\t</span>\n</div>\n"
});

;require.register("apps/repoBrowser/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame cols liquid\">\n\t<div cv-each = \"files:file:f\" class = \"inset treeview\">\n\t\t<div class = \"resize\">[[file]]</div>\n\t</div>\n\t<div class = \"frame rows inset content\">\n\t\t<div class = \"pane\">File: [[filename]]</div>\n\t\t[[control]]\n\t</div>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[filename]]</div>\n\t<div class = \"label inset\">type: [[filetype]] size: [[chars]]</div>\n</div>\n"
});

;require.register("apps/taskManager/TaskManager.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskManager = void 0;

var _Task2 = require("task/Task");

var _Icon = require("../../icon/Icon");

var _Home = require("../../home/Home");

var _MenuBar = require("../../window/MenuBar");

var _Bindable = require("curvature/base/Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TaskManager = /*#__PURE__*/function (_Task) {
  _inherits(TaskManager, _Task);

  var _super = _createSuper(TaskManager);

  function TaskManager(taskList) {
    var _this;

    _classCallCheck(this, TaskManager);

    _this = _super.call(this, taskList);

    _defineProperty(_assertThisInitialized(_this), "title", 'Task Manager');

    _defineProperty(_assertThisInitialized(_this), "icon", '/w95/61-16-4bit.png');

    _defineProperty(_assertThisInitialized(_this), "template", require('./main.tmp'));

    return _this;
  }

  _createClass(TaskManager, [{
    key: "attached",
    value: function attached() {
      this.window.endTask = function (event, task) {
        task.window.close();
      };

      this.window.focusTask = function (event, task) {
        task.window.focus();
      };

      this.window.args.tasks = [];
      this.window.args.tasks = _Home.Home.instance().tasks.list;
      this.window.args.menuBar = new _MenuBar.MenuBar(this.args, this.window);
    }
  }]);

  return TaskManager;
}(_Task2.Task);

exports.TaskManager = TaskManager;
});

;require.register("apps/taskManager/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<div class = \"frame inset gridview\">\n\t\t<table>\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th>id</th>\n\t\t\t\t\t<th class = \"wide\">title</th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody cv-each = \"tasks:task:t\">\n\t\t\t\t<tr>\n\t\t\t\t\t<td>[[task.wid]]</td>\n\t\t\t\t\t<td>[[task.title]]</td>\n\n\t\t\t\t\t<td>\n\t\t\t\t\t\t<button cv-on = \"click:focusTask(event, task);\">\n\t\t\t\t\t\t\tfocus\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</td>\n\n\t\t\t\t\t<td>\n\t\t\t\t\t\t<button cv-on = \"click:endTask(event, task);\">close</button>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t</tbody>\n\t\t</table>\n\t</div>\n</div>\n"
});

;require.register("control/Html.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Html = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Html = /*#__PURE__*/function (_View) {
  _inherits(Html, _View);

  var _super = _createSuper(Html);

  function Html(args, parent) {
    var _this;

    _classCallCheck(this, Html);

    _this = _super.call(this, args, parent);
    _this.template = require('./html.tmp');
    return _this;
  }

  return Html;
}(_View2.View);

exports.Html = Html;
});

;require.register("control/Image.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Image = void 0;

var _View2 = require("curvature/base/View");

var _Home = require("../home/Home");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Image = /*#__PURE__*/function (_View) {
  _inherits(Image, _View);

  var _super = _createSuper(Image);

  function Image(args, parent) {
    var _this;

    _classCallCheck(this, Image);

    _this = _super.call(this, args, parent);
    _this.template = require('./image.tmp');
    return _this;
  }

  return Image;
}(_View2.View);

exports.Image = Image;
});

;require.register("control/Json.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Json = void 0;

var _View2 = require("curvature/base/View");

var _Bindable = require("curvature/base/Bindable");

var _Home = require("../home/Home");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Base = /*#__PURE__*/function (_View) {
  _inherits(Base, _View);

  var _super = _createSuper(Base);

  function Base(args, parent) {
    var _this;

    _classCallCheck(this, Base);

    _this = _super.call(this, args, parent);
    _this.template = require('./json.tmp');
    _this.args.expandIcon = '+';
    _this.args.expanded = args.expanded || '';
    return _this;
  }

  _createClass(Base, [{
    key: "attached",
    value: function attached() {
      var _this2 = this;

      this.args.bindTo('tree', function (v) {
        if (!v) {
          return;
        }

        _this2.args.tree = v;

        for (var i in _this2.args.tree) {
          if (_typeof(_this2.args.tree[i]) === 'object') {
            var subTree = _this2.args.tree[i];
            _this2.args.tree[i] = new Json({}, _this2);
            _this2.args.tree[i].args.tree = subTree;
          }
        }
      });

      if (!this.parent || !(this.parent instanceof Json)) {
        this.args.topLevel = 'top-level main-content';
      }
    }
  }, {
    key: "expand",
    value: function expand(event, key) {
      console.log(key);

      if (key) {
        if (!this.args.tree[key]) {
          return;
        }

        this.args.tree[key].expand(event);
        return;
      }

      this.args.expanded = this.args.expanded ? '' : 'expanded';
      this.args.expandIcon = this.args.expanded ? '+' : 'x';
    }
  }, {
    key: "type",
    value: function type(value) {
      return _typeof(value);
    }
  }]);

  return Base;
}(_View2.View);

var Json = /*#__PURE__*/function (_Base) {
  _inherits(Json, _Base);

  var _super2 = _createSuper(Json);

  function Json() {
    _classCallCheck(this, Json);

    return _super2.apply(this, arguments);
  }

  return Json;
}(Base);

exports.Json = Json;
;
});

require.register("control/Plaintext.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plaintext = void 0;

var _View2 = require("curvature/base/View");

var _Home = require("../home/Home");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Plaintext = /*#__PURE__*/function (_View) {
  _inherits(Plaintext, _View);

  var _super = _createSuper(Plaintext);

  function Plaintext(args, parent) {
    var _this;

    _classCallCheck(this, Plaintext);

    _this = _super.call(this, args, parent);
    _this.template = require('./plaintext.tmp');
    return _this;
  }

  return Plaintext;
}(_View2.View);

exports.Plaintext = Plaintext;
});

;require.register("control/html.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"html-control main-content\">\n\t<iframe\n\t\tclass = \"inset white\"\n\t\tsrcdoc = \"[[srcdoc]]\"></iframe>\n</div>>\n"
});

;require.register("control/image.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"image-control main-content\">\n\t<img class = \"inset white padded\" cv-attr = \"src:src\" />\n</div>\n\n"
});

;require.register("control/json.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"json-view [[topLevel]]\"> <span cv-on = \"click:expand(event)\" cv-bind = \"expandIcon\"></span> {\n\t<div class = \"[[expanded]]\">\n\t\t<div class = \"json-view-body\" cv-each = \"tree:value:key\">\n\t\t\t<div><span class =\"json-key\" cv-on = \"click:expand(event, key)\">[[key]]:</span><span class =\"json-value\" data-type = [[value|type]]\"\">[[value]]</span></div>\n\t\t</div>\n\t</div>\n\t}\n</div>\n"
});

;require.register("control/plaintext.tmp.html", function(exports, require, module) {
module.exports = "<pre class = \"plaintext-control white inset main-content\">[[content]]</pre>\n"
});

;require.register("desktop/Desktop.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Desktop = void 0;

var _Bag = require("curvature/base/Bag");

var _View2 = require("curvature/base/View");

var _Icon = require("../icon/Icon");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Desktop = /*#__PURE__*/function (_View) {
  _inherits(Desktop, _View);

  var _super = _createSuper(Desktop);

  function Desktop(args) {
    var _this;

    _classCallCheck(this, Desktop);

    _this = _super.call(this, args);
    _this.template = require('./desktop.tmp');
    _this.args.icons = [new _Icon.Icon({
      action: '/apps/icon-explorer',
      name: 'Icon Explorer',
      icon: 'shell_window4',
      path: 'w98',
      bits: 8
    }), new _Icon.Icon({
      action: '/apps/repo-browser',
      name: 'Repo Browser',
      icon: 73
    }), new _Icon.Icon({
      action: '/apps/nynepad',
      name: 'Nynepad',
      icon: 60
    }), new _Icon.Icon({
      action: '/apps/window',
      name: 'Application Window',
      icon: 3
    }), new _Icon.Icon({
      action: '/apps/task-manager',
      name: 'Task Manager',
      icon: 61
    })];
    _this.windows = new _Bag.Bag(function (win, meta, action, index) {// console.log(this.windows.list);
    });
    _this.args.windows = _this.windows.list;
    return _this;
  }

  return Desktop;
}(_View2.View);

exports.Desktop = Desktop;
});

;require.register("desktop/desktop.tmp.html", function(exports, require, module) {
module.exports = "<div data-role = \"icon-list\" cv-each = \"icons:icon:i\">[[icon]]</div>\n"
});

;require.register("home/Home.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Home = void 0;

var _Bag = require("curvature/base/Bag");

var _View2 = require("curvature/base/View");

var _Desktop = require("desktop/Desktop");

var _Window = require("window/Window");

var _TaskBar = require("task/TaskBar");

var _Task = require("task/Task");

var _IconExplorer = require("apps/iconExplorer/IconExplorer");

var _TaskManager = require("apps/taskManager/TaskManager");

var _RepoBrowser = require("apps/repoBrowser/RepoBrowser");

var _Nynepad = require("apps/nynepad/Nynepad");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Home = /*#__PURE__*/function (_View) {
  _inherits(Home, _View);

  var _super = _createSuper(Home);

  _createClass(Home, null, [{
    key: "instance",
    value: function instance() {
      if (this.singleton) {
        return this.singleton;
      }

      return this.singleton = new this();
    }
  }]);

  function Home(args) {
    var _this;

    _classCallCheck(this, Home);

    _this = _super.call(this, args);
    _this.template = require('./home.tmp');
    _this.open = {
      x: 80,
      y: 50
    };
    _this.args.desktop = new _Desktop.Desktop({}, _assertThisInitialized(_this));
    _this.windows = new _Bag.Bag(function (i, s, a) {
      if (a !== _Bag.Bag.ITEM_ADDED) {
        return;
      }

      i.windows = _this.windows;
      i.pos.x = _this.open.x;
      i.pos.y = _this.open.y;
      _this.open.x += 50;
      _this.open.y += 80;
      _this.open.x %= window.innerWidth;
      _this.open.y %= window.innerHeight - 128;
    });
    _this.tasks = new _Bag.Bag(); // this.windows.type = Window;
    // this.tasks.type   = Task;

    var taskBar = new _TaskBar.TaskBar({
      tasks: _this.tasks.list
    });
    _this.args.windows = _this.windows.list;
    _this.args.tasks = _this.tasks.list;
    _this.args.taskBar = taskBar;
    return _this;
  }

  _createClass(Home, [{
    key: "run",
    value: function run(taskName) {
      var taskType = Home.path[taskName] || false;

      if (!taskType) {
        alert("".concat(taskName, ": Bad command or filename."));
        return false;
      }

      var task = new taskType(this.tasks);
      this.tasks.add(task);
    }
  }]);

  return Home;
}(_View2.View);

exports.Home = Home;

_defineProperty(Home, "singleton", false);

_defineProperty(Home, "path", {
  '/apps/icon-explorer': _IconExplorer.IconExplorer,
  '/apps/task-manager': _TaskManager.TaskManager,
  '/apps/nynepad': _Nynepad.Nynepad,
  '/apps/repo-browser': _RepoBrowser.RepoBrowser,
  '/apps/window': _Task.Task
});
});

;require.register("home/home.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"viewport\">\n\t<div data-role = \"window-host\" cv-each = \"windows:window:w\">[[window]]</div>\n\t<div class = \"desktop\">[[desktop]]</div>\n</div>\n\n[[taskBar]]\n\n<!-- <ul class = \"task-list\" cv-each = \"tasks:task:t\">\n\t<li>[[task.x]]x[[task.y]]x[[task.z]] [[task.title]]</li>\n</ul>\n -->\n"
});

;require.register("icon/Icon.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;

var _View2 = require("curvature/base/View");

var _Home = require("../home/Home");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Icon = /*#__PURE__*/function (_View) {
  _inherits(Icon, _View);

  var _super = _createSuper(Icon);

  function Icon(args, parent) {
    var _this;

    _classCallCheck(this, Icon);

    _this = _super.call(this, args, parent);
    _this.template = require('./icon.tmp');
    _this.resource = args.action || false; //'/apps/icon-explorer-stats'

    _this.action = args.action || false; //'/apps/icon-explorer'

    _this.args.name = args.name || "untitled";
    _this.args.path = args.path || "w95";
    _this.args.size = args.size || "32";
    _this.args.bits = args.bits || "4";
    _this.args.icon = args.icon || '3';

    _this.args.bindTo(function (v, k) {
      if (undefined === ['path', 'size', 'bits', 'icon'].find(function (el) {
        return el === k;
      })) {
        return;
      }

      var path = "/".concat(_this.args.path, "/").concat(_this.args.icon, "-").concat(_this.args.size, "-").concat(_this.args.bits, "bit.png");
      _this.args.src = path;
    }, {
      idle: 1
    });

    return _this;
  }

  _createClass(Icon, [{
    key: "dblclick",
    value: function dblclick(event) {
      var home = _Home.Home.instance();

      switch (_typeof(this.action)) {
        case 'string':
          home.run(this.action);
          break;

        case 'function':
          this.action(event);
          break;
      }
    }
  }]);

  return Icon;
}(_View2.View);

exports.Icon = Icon;
});

;require.register("icon/icon.tmp.html", function(exports, require, module) {
module.exports = "<div cv-on = \":dblclick(event):c\" tabindex=\"0\">\n\t<img cv-attr = \"src:src\" />\n\t<label>[[name]]</label>\n</div>\n"
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

var _Home = require("home/Home");

var _Window = require("window/Window");

document.addEventListener('DOMContentLoaded', function () {
  var tag = document.querySelector('body');

  if (!tag) {
    return;
  }

  var homeView = _Home.Home.instance();

  homeView.render(tag);
  var win = new _Window.Window({
    content: 'Window #0.'
  }); // setTimeout(()=> homeView.windows.add(win), 1000);
});
});

require.register("mixin/CssSwitch.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CssSwitch = void 0;

var _Mixin2 = require("curvature/base/Mixin");

var _Bindable = require("curvature/base//Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CssSwitch = /*#__PURE__*/function (_Mixin) {
  _inherits(CssSwitch, _Mixin);

  var _super = _createSuper(CssSwitch);

  function CssSwitch() {
    _classCallCheck(this, CssSwitch);

    return _super.apply(this, arguments);
  }

  _createClass(CssSwitch, [{
    key: "after__constructor",
    value: function after__constructor() {
      var _this = this;

      this.classes = _Bindable.Bindable.makeBindable({});
      this.classes.bindTo(function (v, k) {
        return _this.args.classes = Object.assign({}, _this.classes);
      }, {
        frame: 1
      });
    }
  }]);

  return CssSwitch;
}(_Mixin2.Mixin);

exports.CssSwitch = CssSwitch;
});

;require.register("mixin/Sealed.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sealed = void 0;

var _Mixin2 = require("curvature/base/Mixin");

var _Bindable = require("curvature/base//Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var priv = Symbol('priv');

var Sealed = /*#__PURE__*/function (_Mixin) {
  _inherits(Sealed, _Mixin);

  var _super = _createSuper(Sealed);

  function Sealed() {
    _classCallCheck(this, Sealed);

    return _super.apply(this, arguments);
  }

  _createClass(Sealed, [{
    key: "before__constructor",
    value: function before__constructor() {
      Object.seal(this);
    }
  }]);

  return Sealed;
}(_Mixin2.Mixin);

exports.Sealed = Sealed;
});

;require.register("mixin/Target.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Target = void 0;

var _Mixin2 = require("curvature/base/Mixin");

var _Bindable = require("curvature/base//Bindable");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var target = Symbol('target');

var Target = /*#__PURE__*/function (_Mixin) {
  _inherits(Target, _Mixin);

  var _super = _createSuper(Target);

  function Target() {
    _classCallCheck(this, Target);

    return _super.apply(this, arguments);
  }

  _createClass(Target, [{
    key: "after__constructor",
    value: function after__constructor() {
      this[target] = new EventTarget();
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent() {
      var _this$target;

      (_this$target = this[target]).dispatchEvent.apply(_this$target, arguments);
    }
  }, {
    key: "addEventListener",
    value: function addEventListener() {
      var _this$target2;

      (_this$target2 = this[target]).addEventListener.apply(_this$target2, arguments);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener() {
      var _this$target3;

      (_this$target3 = this[target]).removeEventListener.apply(_this$target3, arguments);
    }
  }]);

  return Target;
}(_Mixin2.Mixin);

exports.Target = Target;
});

;require.register("mixin/ViewProcessor.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewProcessor = void 0;

var _Mixin2 = require("curvature/base/Mixin");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var ViewProcessor = /*#__PURE__*/function (_Mixin) {
  _inherits(ViewProcessor, _Mixin);

  var _super = _createSuper(ViewProcessor);

  function ViewProcessor() {
    _classCallCheck(this, ViewProcessor);

    return _super.apply(this, arguments);
  }

  _createClass(ViewProcessor, [{
    key: "join",
    value: function join(list) {
      if (!Array.isArray(list) && _typeof(list) !== 'object') {
        list = [list];
      } else if (!Array.isArray(list) && _typeof(list) === 'object') {
        list = Object.keys(list).filter(function (key) {
          return list[key];
        });
      }

      return list.join(' ');
    }
  }, {
    key: "_count",
    value: function _count(list) {
      console.log(list);

      if (!Array.isArray(list) && _typeof(list) !== 'object') {
        list = [list];
      } else if (!Array.isArray(list) && _typeof(list) === 'object') {
        list = Object.keys(list).filter(function (key) {
          return list[key];
        });
      }

      return list.length || 0;
    }
  }]);

  return ViewProcessor;
}(_Mixin2.Mixin);

exports.ViewProcessor = ViewProcessor;
});

;require.register("task/Task.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _Home = require("../home/Home");

var _Sealed = require("../mixin/Sealed");

var _Window = require("../window/Window");

var _Bindable = require("curvature/base/Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var win = undefined;

var Task = /*#__PURE__*/function () {
  function Task(taskList) {
    var _this = this;

    _classCallCheck(this, Task);

    _defineProperty(this, "title", '');

    _defineProperty(this, "icon", '/w95/3-16-4bit.png');

    _defineProperty(this, "silent", false);

    if (!this.silent) {
      var home = _Home.Home.instance();

      this.window = new _Window.Window(this);
      this.window.addEventListener('closed', function (event) {
        return taskList.remove(_this);
      });
      this.window.addEventListener('attached', function (event) {
        return _this.attached();
      });
      home.windows.add(this.window);
      this.window.focus();
    }

    return this;
  }

  _createClass(Task, [{
    key: "attached",
    value: function attached() {}
  }]);

  return Task;
}();

exports.Task = Task;
});

;require.register("task/TaskBar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskBar = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var TaskBar = /*#__PURE__*/function (_View) {
  _inherits(TaskBar, _View);

  var _super = _createSuper(TaskBar);

  function TaskBar(args, parent) {
    var _this;

    _classCallCheck(this, TaskBar);

    _this = _super.call(this, args, parent);
    _this.template = require('./taskBar.tmp');

    _this.args.tasks.bindTo(function (v, k, t) {
      _this.args.taskCount = Object.values(t).length;
    }, {
      frame: 1
    });

    return _this;
  }

  _createClass(TaskBar, [{
    key: "attached",
    value: function attached() {
      var _this2 = this;

      this.onFrame(function () {
        var date = new Date();
        _this2.args.hh = String(date.getHours()).padStart(2, 0);
        _this2.args.mm = String(date.getMinutes()).padStart(2, 0);
        _this2.args.ss = String(date.getSeconds()).padStart(2, 0);
      });
    }
  }, {
    key: "activate",
    value: function activate(event, task) {
      if (task.window) {
        task.window.focus();

        if (task.window.classes.minimized) {
          task.window.restore();
        }
      }
    }
  }, {
    key: "doubleTap",
    value: function doubleTap(event, task) {
      if (task.window.classes.minimized || task.window.classes.maximized) {
        task.window.restore();
        return;
      }

      task.window.maximize();
    }
  }]);

  return TaskBar;
}(_View2.View);

exports.TaskBar = TaskBar;
});

;require.register("task/taskBar.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"task-bar pane\">\n\t<div class = \"start\">\n\t\t<button>\n\t\t\t<img class = \"icon16\" src = \"/w98/windows-16-4bit.png\" />\n\t\t\t<div>Start</div>\n\t\t</button>\n\t\t<div class = \"pane\">\n\t\t\t<div class = \"brand-stripe\">\n\t\t\t\t<img src = \"/nynex95-logo.svg\">\n\t\t\t</div>\n\t\t\t<ul>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/20-32-4bit.png\" />\n\t\t\t\t\t<label tabindex = \"0\">Programs</label>\n\t\t\t\t\t<img class = \"expand\" src = \"/arrow-expand.png\" />\n\n\t\t\t\t\t<ul class = \"pane\">\n\n\t\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\t\tAccessories\n\t\t\t\t\t\t</li>\n\n\t\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\t\tGames\n\t\t\t\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t\t\t\t<li tabindex = \"0\">Foo</li>\n\t\t\t\t\t\t\t\t<li tabindex = \"0\">Bar</li>\n\t\t\t\t\t\t\t\t<li tabindex = \"0\">Baz</li>\n\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t</li>\n\n\t\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\t\tStartup\n\t\t\t\t\t\t</li>\n\n\t\t\t\t\t</ul>\n\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/21-32-4bit.png\" />\n\t\t\t\t\tDocuments\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/22-32-4bit.png\" />\n\t\t\t\t\tSettings\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/23-32-4bit.png\" />\n\t\t\t\t\tFind\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/24-32-4bit.png\" />\n\t\t\t\t\tHelp\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/25-32-4bit.png\" />\n\t\t\t\t\tRun...\n\t\t\t\t</li>\n\t\t\t\t<hr />\n\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/28-32-4bit.png\" />\n\t\t\t\t\tShutdown...\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t</div>\n\n\t<div class = \"quickstart\">\n\t</div>\n\n\t<div class = \"task-list\" data-count = \"[[taskCount]]\" cv-each = \"tasks:task:t\">\n\t\t<button cv-on = \"click:activate(event,task);dblclick:doubleTap(event,task);\">\n\t\t\t<img class = \"icon16\" cv-attr = \"src:task.icon\" />\n\t\t\t[[task.title]]\n\t\t</button>\n\t</div>\n\n\t<div class = \"spacer\">\n\t</div>\n\n\t<div class = \"tray inset\">\n\t\t[[hh]]:[[mm]]:[[ss]]\n\t</div>\n</div>\n"
});

;require.register("window/MenuBar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuBar = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MenuBar = /*#__PURE__*/function (_View) {
  _inherits(MenuBar, _View);

  var _super = _createSuper(MenuBar);

  function MenuBar(args, parent) {
    var _this;

    _classCallCheck(this, MenuBar);

    _this = _super.call(this, args, parent);
    _this.template = require('./menuBar.tmp');
    return _this;
  }

  return MenuBar;
}(_View2.View);

exports.MenuBar = MenuBar;
});

;require.register("window/TitleBar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TitleBar = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// import { ViewProcessor } from '../mixin/ViewProcessor';
var TitleBar = /*#__PURE__*/function (_View) {
  _inherits(TitleBar, _View);

  var _super = _createSuper(TitleBar);

  function TitleBar(args, parent) {
    var _this;

    _classCallCheck(this, TitleBar);

    _this = _super.call(this, args, parent);
    _this.template = require('./titleBar.tmp');
    return _this;
  }

  return TitleBar;
}(_View2.View);

exports.TitleBar = TitleBar;
});

;require.register("window/Window.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Window = void 0;

var _View2 = require("curvature/base/View");

var _Bindable = require("curvature/base/Bindable");

var _MenuBar = require("./MenuBar");

var _TitleBar = require("./TitleBar");

var _Target = require("../mixin/Target");

var _CssSwitch = require("../mixin/CssSwitch");

var _ViewProcessor = require("../mixin/ViewProcessor");

var _Icon = require("../icon/Icon");

var _class, _temp;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Base = (_temp = _class = /*#__PURE__*/function (_View) {
  _inherits(Base, _View);

  var _super = _createSuper(Base);

  function Base() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Base);

    _this = _super.call(this, args);
    _this.args.classes = ['pane', 'resize'];
    _this.args.preview = '/w95/1-16-4bit.png';
    _this.pos = _Bindable.Bindable.make({
      x: 160,
      y: 100,
      z: 0
    });
    _this.args.icon = args.icon || '/w95/3-16-4bit.png';
    _this.args.title = _this.args.title || 'Application Window';
    _this.args.progr = 0; // this.args.content = 'Double-click an icon below.';
    // this.args.smallSrc = this.args.largeSrc = '--';

    _this.template = require('./window.tmp');
    _this.args.wid = _this.constructor.idInc++;
    return _this;
  }

  _createClass(Base, [{
    key: "postRender",
    value: function postRender() {
      var _this2 = this;

      this.args.titleBar = new _TitleBar.TitleBar(this.args, this);
      var element = this.tags.window.element;
      this.pos.bindTo('x', function (v, k) {
        element.style.left = "".concat(v, "px");
        _this2.args.x = v;
      });
      this.pos.bindTo('y', function (v, k) {
        element.style.top = "".concat(v, "px");
        _this2.args.y = v;
      });
      this.pos.bindTo('z', function (v, k) {
        element.style.zIndex = v;
        _this2.args.z = v;
      });
    }
  }, {
    key: "attached",
    value: function attached(parent) {
      this.classes.resize = true;
      this.classes.pane = true;
      this.dispatchEvent(new CustomEvent('attached', {
        detail: {
          target: this
        }
      }));
    }
  }, {
    key: "menuFocus",
    value: function menuFocus() {
      this.classes['menu-open'] = true;
    }
  }, {
    key: "menuBlur",
    value: function menuBlur() {
      this.classes['menu-open'] = false;
    }
  }, {
    key: "minimize",
    value: function minimize() {
      this.classes.minimized = true;
      this.classes.maximized = false;
      this.dispatchEvent(new CustomEvent('minimized', {
        detail: {
          target: this
        }
      }));
    }
  }, {
    key: "restore",
    value: function restore() {
      this.classes.minimized = false;
      this.classes.maximized = false;
      this.dispatchEvent(new CustomEvent('restored', {
        detail: {
          target: this
        }
      }));
    }
  }, {
    key: "maximize",
    value: function maximize() {
      this.classes.minimized = false;
      this.classes.maximized = true;
      this.dispatchEvent(new CustomEvent('maximized', {
        detail: {
          target: this
        }
      }));
    }
  }, {
    key: "close",
    value: function close() {
      this.windows.remove(this);
      this.dispatchEvent(new CustomEvent('closed', {
        detail: {
          target: this
        }
      }));
    }
  }, {
    key: "focus",
    value: function focus() {
      var prevZ = this.pos.z;
      var windows = this.windows.items();

      for (var i in windows) {
        if (windows[i].pos.z > prevZ) {
          windows[i].pos.z--;
          windows[i].classes.focused = false;
        }
      }

      this.pos.z = windows.length;
      this.classes.focused = true;
    }
  }, {
    key: "doubleClickTitle",
    value: function doubleClickTitle(event) {
      if (this.classes.maximized || this.classes.minimized) {
        this.restore();
        return;
      }

      this.maximize();
    }
  }, {
    key: "grabTitleBar",
    value: function grabTitleBar(event) {
      var _this3 = this;

      var start = {
        x: this.pos.x,
        y: this.pos.y
      };
      var click = {
        x: event.clientX,
        y: event.clientY
      };

      var moved = function moved(event) {
        var mouse = {
          x: event.clientX,
          y: event.clientY
        };
        var moved = {
          x: mouse.x - click.x,
          y: mouse.y - click.y
        };
        _this3.pos.x = start.x + moved.x;
        _this3.pos.y = start.y + moved.y;
      };

      document.addEventListener('mousemove', moved);
      document.addEventListener('mouseup', function (event) {
        if (_this3.pos.y < 0) {
          _this3.pos.y = 0;
        }

        if (_this3.pos.x < 0) {
          _this3.pos.x = 0;
        }

        document.removeEventListener('mousemove', moved);
      }, {
        once: true
      });
    }
  }]);

  return Base;
}(_View2.View), _defineProperty(_class, "idInc", 0), _temp);
Base = _Target.Target.mix(Base);
Base = _CssSwitch.CssSwitch.mix(Base);
Base = _ViewProcessor.ViewProcessor.mix(Base);

var Window = /*#__PURE__*/function (_Base) {
  _inherits(Window, _Base);

  var _super2 = _createSuper(Window);

  function Window() {
    _classCallCheck(this, Window);

    return _super2.apply(this, arguments);
  }

  return Window;
}(Base);

exports.Window = Window;
;
});

require.register("window/menuBar.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"menu-bar\" cv-on = \"blur:menuBlur(event):c;focus:menuFocus(event):c\">\n\n  <div tabindex = \"0\">\n\n    <u>F</u>ile\n\n    <ul class = \"pane\">\n\n      <li tabindex = \"0\">\n        <u>N</u>ew\n      </li>\n\n      <li tabindex = \"0\">\n        <u>O</u>pen\n      </li>\n\n      <li tabindex = \"0\">\n        Open <u>R</u>ecent\n\n        <ul class = \"pane\">\n          <li tabindex = \"0\">Foo</li>\n          <li tabindex = \"0\">Bar</li>\n          <li tabindex = \"0\">Baz</li>\n        </ul>\n\n      </li>\n\n      <hr />\n\n      <li tabindex = \"0\">\n        <u>P</u>lugins\n\n        <ul class = \"pane\">\n          <li tabindex = \"0\">\n            Foo\n            <ul class = \"pane\">\n              <li tabindex = \"0\">Settings</li>\n              <hr />\n              <li tabindex = \"0\">Start</li>\n              <li tabindex = \"0\">Stop</li>\n              <li tabindex = \"0\">Restart</li>\n            </ul>\n          </li>\n          <li tabindex = \"0\">\n            Bar\n            <ul class = \"pane\">\n              <li tabindex = \"0\">Settings</li>\n              <hr />\n              <li tabindex = \"0\">Start</li>\n              <li tabindex = \"0\">Stop</li>\n              <li tabindex = \"0\">Restart</li>\n            </ul>\n          </li>\n          <li tabindex = \"0\">\n            Baz\n            <ul class = \"pane\">\n              <li tabindex = \"0\">Settings</li>\n              <hr />\n              <li tabindex = \"0\">Start</li>\n              <li tabindex = \"0\">Stop</li>\n              <li tabindex = \"0\">Restart</li>\n            </ul>\n          </li>\n        </ul>\n\n      </li>\n\n      <hr />\n\n      <li tabindex = \"0\">Save</li>\n      <li tabindex = \"0\">Save As</li>\n\n      <hr />\n\n      <li tabindex = \"0\">Close</li>\n      <li tabindex = \"0\">Quit</li>\n\n    </ul>\n\n  </div>\n\n  <div tabindex = \"0\">\n\n    <u>E</u>dit\n\n     <ul class = \"pane\">\n      <li tabindex = \"0\">Undo</li>\n      <li tabindex = \"0\">Redo</li>\n      <hr />\n      <li tabindex = \"0\">Cut</li>\n      <li tabindex = \"0\">Copy</li>\n      <li tabindex = \"0\">Paste</li>\n      <li tabindex = \"0\">Delete</li>\n      <hr />\n      <li tabindex = \"0\">Find</li>\n      <li tabindex = \"0\">Replace</li>\n    </ul>\n\n  </div>\n\n  <div tabindex = \"0\">\n    <u>V</u>iew\n  </div>\n\n  <div tabindex = \"0\">\n    <u>G</u>o\n  </div>\n\n  <div tabindex = \"0\">\n    F<u>a</u>vorites\n  </div>\n\n  <div tabindex = \"0\">\n    <u>H</u>elp\n  </div>\n</div>\n"
});

;require.register("window/titleBar.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"title-bar\" cv-on = \"mousedown:grabTitleBar(event);dblclick:doubleClickTitle(event);\">\n\t<img cv-attr = \"src:icon\" />\n\t<span class = \"title\" cv-bind = \"title\"></span>\n\t<span>\n\t\t<button tabindex = \"-1\" class = \"minimize\" cv-on = \"click:minimize(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"restore\" cv-on = \"click:restore(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"maximize\" cv-on = \"click:maximize(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"close\" cv-on = \"click:close(event)\"></button>\n\t</span>\n</div>\n"
});

;require.register("window/window.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"window [[classes|join]]\" cv-on = \"mousedown:focus(event):c\" cv-ref = \"window::\" tabindex=\"-1\">\n\t[[titleBar]]\n\t[[menuBar]]\n\t<div class = \"frame liquid\">\n\t\t[[$$template]]\n\t</div>\n</div>\n"
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

"use strict";

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;
  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },
    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      }); // Hack to force page repaint after 25ms.

      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },
    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });
      var loaded = 0;
      var all = srcScripts.length;

      var onLoad = function onLoad() {
        loaded = loaded + 1;

        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);

    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };

    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };

    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };

  connect();
})();
/* jshint ignore:end */
;
//# sourceMappingURL=app.js.map