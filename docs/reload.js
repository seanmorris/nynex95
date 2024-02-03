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
"use strict";/* jshint ignore:start */(function(){var WebSocket=window.WebSocket||window.MozWebSocket,br=window.brunch=window.brunch||{},ar=br["auto-reload"]=br["auto-reload"]||{};if(WebSocket&&!ar.disabled&&!window._ar){window._ar=!0;var cacheBuster=function(a){var b=Math.round(Date.now()/1e3).toString();return a=a.replace(/(\&|\\?)cacheBuster=\d*/,""),a+(0<=a.indexOf("?")?"&":"?")+"cacheBuster="+b},browser=navigator.userAgent.toLowerCase(),forceRepaint=ar.forceRepaint||-1<browser.indexOf("chrome"),reloaders={page:function page(){window.location.reload(!0)},stylesheet:function stylesheet(){[].slice.call(document.querySelectorAll("link[rel=stylesheet]")).filter(function(a){var b=a.getAttribute("data-autoreload");return a.href&&"false"!=b}).forEach(function(a){a.href=cacheBuster(a.href)}),forceRepaint&&setTimeout(function(){document.body.offsetHeight},25)},javascript:function javascript(){var scripts=[].slice.call(document.querySelectorAll("script")),textScripts=scripts.map(function(a){return a.text}).filter(function(a){return 0<a.length}),srcScripts=scripts.filter(function(a){return a.src}),loaded=0,all=srcScripts.length,onLoad=function(){++loaded,loaded===all&&textScripts.forEach(function(script){eval(script)})};srcScripts.forEach(function(a){var b=a.src;a.remove();var c=document.createElement("script");c.src=cacheBuster(b),c.async=!0,c.onload=onLoad,document.head.appendChild(c)})}},port=ar.port||9485,host=br.server||window.location.hostname||"localhost",connect=function(){var a=new WebSocket("ws://"+host+":"+port);a.onmessage=function(a){if(!ar.disabled){var b=a.data,c=reloaders[b]||reloaders.page;c()}},a.onerror=function(){a.readyState&&a.close()},a.onclose=function(){window.setTimeout(connect,1e3)}};connect()}})();
;
//# sourceMappingURL=reload.js.map