/**
 * Backbone-Nested 1.1.2 - An extension of Backbone.js that keeps track of nested attributes
 *
 * http://afeld.github.com/backbone-nested/
 *
 * Copyright (c) 2011-2012 Aidan Feldman
 * MIT Licensed (LICENSE)
 */
/*global $, _, Backbone */
(function(){
  var _delayedTriggers, NestedModel, toString$ = {}.toString, slice$ = [].slice;
  _delayedTriggers = [];
  Backbone.NestedModel = NestedModel = (function(superclass){
    var prototype = extend$((import$(NestedModel, superclass).displayName = 'NestedModel', NestedModel), superclass).prototype, constructor = NestedModel;
    function NestedModel(){
      superclass.apply(this, arguments);
    }
    NestedModel.attrPath = makeAttrPath;
    NestedModel.createAttrStr = makeAttrString;
    NestedModel.deepClone = deepClone;
    prototype.get = function(attrStrOrPath){
      return _(makeAttrPath(attrStrOrPath)).reduce(function(v, k){
        return v != null ? v[k] : void 8;
      }, this.attributes);
    };
    prototype.set = function(key, value, options){
      switch (false) {
      case !_.isArray(key):
        return this._setNested({
          path: key,
          value: value,
          options: options
        });
      case !_.isObject(key):
        return this._setNested({
          attrs: key,
          options: value
        });
      default:
        return this._setNested({
          path: makeAttrPath(key),
          value: value,
          options: options
        });
      }
    };
    prototype._setNested = function(arg$){
      var path, attrs, value, options, newAttrs, key, val, silentOpts, ref$, own$ = {}.hasOwnProperty;
      path = arg$.path, attrs = arg$.attrs, value = arg$.value, options = arg$.options || {};
      newAttrs = deepClone(this.attributes);
      if (attrs) {
        for (key in attrs) if (own$.call(attrs, key)) {
          val = attrs[key];
          if (options.unset) {
            val = null;
          }
          this._setAttr(newAttrs, makeAttrPath(key), val, options);
        }
      } else {
        this._setAttr(newAttrs, path, value, options);
      }
      if (!this._validate(newAttrs, options)) {
        this.changed = {};
        return false;
      }
      silentOpts = importAll$(importAll$({}, options), {
        silent: true
      });
      if (options.unset && (path != null ? path.length : void 8) === 1) {
        superclass.prototype.set.call(this, (ref$ = {}, ref$[path[0] + ""] = null, ref$), silentOpts);
      } else {
        if (path && silentOpts.unset) {
          delete silentOpts.unset;
        }
        superclass.prototype.set.call(this, newAttrs, silentOpts);
      }
      this._checkChanges(options);
      return this;
    };
    prototype.add = function(attrStr, value, opts){
      var current;
      current = this.get(attrStr);
      if (!_.isArray(current)) {
        throw new Error("current value is not an array");
      }
      return this.set(attrStr + "[" + current.length + "]", value, opts);
    };
    prototype.remove = function(attrStr, opts){
      var attrPath, aryPath, val, i;
      opts || (opts = {});
      attrPath = makeAttrPath(attrStr);
      aryPath = _.initial(attrPath);
      val = this.get(aryPath).slice(0);
      i = _.last(attrPath);
      if (!_.isArray(val)) {
        throw new Error("remove! must be called on a nested array");
      }
      val.splice(i, 1);
      this.set(aryPath, val, opts);
      return this;
    };
    prototype.toJSON = function(){
      return deepClone(this.attributes);
    };
    prototype._checkChanges = function(options){
      var changes, this$ = this;
      options == null && (options = {});
      changes = options.silent
        ? this._silent
        : {};
      if (checkChanges(this._previousAttributes, this.attributes, [])) {
        if (!options.silent) {
          this.change(importAll$(options, {
            changes: changes
          }));
        }
      }
      function checkChanges(prev, now, path){
        var hasChanged, hasRemoved, hasAdded, parentArrayS, i$, ref$, len$, a, ref1$, oldVal, newVal, attrP, attrS;
        hasChanged = false;
        hasRemoved = false;
        hasAdded = false;
        if (_.isArray(prev)) {
          parentArrayS = makeAttrString(path);
        }
        for (i$ = 0, len$ = (ref$ = _.uniq(_.keys(prev || {}).concat(_.keys(now || {})))).length; i$ < len$; ++i$) {
          a = ref$[i$];
          oldVal = (ref1$ = prev != null ? prev[a] : void 8) != null ? ref1$ : null;
          newVal = (ref1$ = now != null ? now[a] : void 8) != null ? ref1$ : null;
          if (!_.isEqual(newVal, oldVal)) {
            attrP = path.concat([numericArrayAccessors(a)]);
            attrS = makeAttrString(attrP);
            hasChanged = true;
            this$.changed[attrS] = newVal;
            if (parentArrayS) {
              if (newVal == null && !hasRemoved) {
                this$.trigger("remove:" + parentArrayS, this$, null, options);
                hasRemoved = true;
              } else if (oldVal == null && !hasAdded) {
                this$.trigger("add:" + parentArrayS, this$, newVal, options);
                hasAdded = true;
              } else {
                changes[attrS] = newVal;
              }
            } else {
              changes[attrS] = newVal;
            }
            if (isDeep(oldVal) || isDeep(newVal)) {
              checkChanges(oldVal, newVal, attrP);
            }
          }
        }
        return hasChanged;
      }
      function isDeep(obj){
        return _.isObject(obj) || _.isArray(obj);
      }
    };
    prototype._setAttr = function(newAttrs, attrPath, newValue, opts){
      var fullPathLength, path, val, attrsLeft, i$, len$, attr, attrStr, oldValue, value;
      opts || (opts = {});
      fullPathLength = attrPath.length;
      path = [];
      val = newAttrs;
      attrsLeft = attrPath.length;
      for (i$ = 0, len$ = attrPath.length; i$ < len$; ++i$) {
        attr = attrPath[i$];
        path.push(attr);
        attrStr = makeAttrString(path);
        value = oldValue = val[attr];
        --attrsLeft;
        if (attrsLeft === 0) {
          if (opts.unset) {
            delete val[attr];
            delete this._escapedAttributes[attrStr];
          } else {
            val[attr] = value = newValue;
          }
        } else if (!value) {
          if (_.isNumber(attr)) {
            val[attr] = value = [];
          } else {
            val[attr] = value = {};
          }
        }
        val = value;
      }
    };
    return NestedModel;
  }(Backbone.Model));
  function makeAttrPath(attrStrOrPath){
    var i$, ref$, len$, attr, results$ = [];
    if (attrStrOrPath === '') {
      return [''];
    } else if (toString$.call(attrStrOrPath).slice(8, -1) === 'String') {
      for (i$ = 0, len$ = (ref$ = attrStrOrPath.match(/[^\.\[\]]+/g)).length; i$ < len$; ++i$) {
        attr = ref$[i$];
        results$.push(numericArrayAccessors(attr));
      }
      return results$;
    } else {
      return attrStrOrPath;
    }
  }
  function numericArrayAccessors(attr){
    if (attr.match(/^\d+$/)) {
      return parseInt(attr, 10);
    } else {
      return attr;
    }
  }
  function makeAttrString(arg$){
    var attrStr, rest, i$, len$, attr;
    attrStr = arg$[0], rest = slice$.call(arg$, 1);
    for (i$ = 0, len$ = rest.length; i$ < len$; ++i$) {
      attr = rest[i$];
      attrStr += toString$.call(attr).slice(8, -1) === 'Number'
        ? "[" + attr + "]"
        : "." + attr;
    }
    return attrStr;
  }
  function deepClone(obj){
    var a, k, v, o, own$ = {}.hasOwnProperty;
    if (_.isArray(obj)) {
      a = [];
      for (k in obj) if (own$.call(obj, k)) {
        v = obj[k];
        a[k] = deepClone(v);
      }
      return a;
    } else if (Object(obj) === obj) {
      o = {};
      for (k in obj) if (own$.call(obj, k)) {
        v = obj[k];
        o[k] = deepClone(v);
      }
      return o;
    } else {
      return obj;
    }
  }
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);
