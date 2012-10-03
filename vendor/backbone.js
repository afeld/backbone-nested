//     Backbone.js 0.9.2-livescript-version
//
//     (Built from LiveScript version at:
//      github.com/isakb/backbone/tree/livescript)

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org
(function(){
  var root, previousBackbone, Backbone, underscore, eventSplitter, Events, Model, Collection, i$, ref$, len$, m, Router, History, View, methodMap, extend, urlError, keys, isArray, slice$ = [].slice, toString$ = {}.toString;
  root = this;
  previousBackbone = root.Backbone;
  Backbone = typeof exports != 'undefined' && exports !== null
    ? exports
    : root.Backbone = {};
  Backbone.VERSION = "0.9.2";
  underscore = root._ || (typeof require === 'function' ? require('underscore') : void 8);
  Backbone.$ = root.jQuery || root.Zepto || root.ender;
  Backbone.noConflict = function(){
    root.Backbone = previousBackbone;
    return this;
  };
  Backbone.emulateHTTP = false;
  Backbone.emulateJSON = false;
  eventSplitter = /\s+/;
  Events = {
    on: function(events, callback, context){
      var calls, i$, len$, event, list;
      if (!callback) {
        return this;
      }
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});
      for (i$ = 0, len$ = events.length; i$ < len$; ++i$) {
        event = events[i$];
        list = calls[event] || (calls[event] = []);
        list.push(callback, context);
      }
      return this;
    },
    off: function(events, callback, context){
      var calls, i$, len$, event, list, i;
      if (!(calls = this._callbacks)) {
        return this;
      }
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }
      events = events
        ? events.split(eventSplitter)
        : keys(calls);
      for (i$ = 0, len$ = events.length; i$ < len$; ++i$) {
        event = events[i$];
        if (!(list = calls[event]) || !(callback || context)) {
          delete calls[event];
        } else {
          for (i = list.length - 2; i >= 0; i -= 2) {
            if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
              list.splice(i, 2);
            }
          }
        }
      }
      return this;
    },
    trigger: function(events){
      var rest, calls, i$, len$, event, all, list, i, to$, args;
      rest = slice$.call(arguments, 1);
      if (!(calls = this._callbacks)) {
        return this;
      }
      events = events.split(eventSplitter);
      for (i$ = 0, len$ = events.length; i$ < len$; ++i$) {
        event = events[i$];
        if (all = calls.all) {
          all = all.slice();
        }
        if (list = calls[event]) {
          list = list.slice();
        }
        for (i = 0, to$ = list != null ? list.length : void 8; i < to$; i += 2) {
          list[i].apply(list[i + 1] || this, rest);
        }
        if (all) {
          args = [event].concat(rest);
          for (i = 0, to$ = all.length; i < to$; i += 2) {
            all[i].apply(all[i + 1] || this, args);
          }
        }
      }
      return this;
    }
  };
  Events.bind = Events.on;
  Events.unbind = Events.off;
  Model = (function(){
    Model.displayName = 'Model';
    var prototype = Model.prototype, constructor = Model;
    importAll$(prototype, arguments[0]);
    function Model(attributes, options){
      var defaults;
      attributes || (attributes = {});
      options || (options = {});
      this.collection = options.collection;
      if (options.parse) {
        attributes = this.parse(attributes);
      }
      if (defaults = result(this, 'defaults')) {
        attributes = import$(clone$(defaults), attributes);
      }
      this.attributes = {};
      this._escapedAttributes = {};
      this.cid = 'c' + Model.lastId++;
      this.changed = {};
      this._silent = {};
      this._pending = {};
      this.set(attributes, {
        silent: true
      });
      this.changed = {};
      this._silent = {};
      this._pending = {};
      this._previousAttributes = clone(this.attributes);
      this.initialize.apply(this, arguments);
    }
    Model.lastId = 0;
    prototype.changed = null;
    prototype._silent = null;
    prototype._pending = null;
    prototype.idAttribute = 'id';
    prototype.initialize = function(){};
    prototype.toJSON = function(options){
      return clone(this.attributes);
    };
    prototype.sync = function(){
      return Backbone.sync.apply(this, arguments);
    };
    prototype.get = function(attr){
      return this.attributes[attr];
    };
    prototype.escape = function(attr){
      var html, val;
      if (html = this._escapedAttributes[attr]) {
        return html;
      }
      val = this.get(attr);
      return this._escapedAttributes[attr] = val == null
        ? ''
        : escaped(val);
    };
    prototype.has = function(attr){
      return this.get(attr) != null;
    };
    prototype.set = function(key, value, options){
      var ref$;
      switch (false) {
      case !(key instanceof Model):
        return this._set(key.attributes, value);
      case !isObject(key):
        return this._set(key, value);
      case key == null:
        return this._set((ref$ = {}, ref$[key + ""] = value, ref$), options);
      default:
        return this;
      }
    };
    prototype._set = function(attrs, options){
      var attr, changes, now, escaped, prev, val;
      attrs || (attrs = {});
      options || (options = {});
      if (options.unset) {
        for (attr in attrs) {
          attrs[attr] = void 8;
        }
      }
      if (!this._validate(attrs, options)) {
        return false;
      }
      if (this.idAttribute in attrs) {
        this.id = attrs[this.idAttribute];
      }
      changes = options.changes = {};
      now = this.attributes;
      escaped = this._escapedAttributes;
      prev = this._previousAttributes || {};
      for (attr in attrs) {
        val = attrs[attr];
        if (!isEqual(now[attr], val) || options.unset && hasOwn(now, attr)) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }
        if (options.unset) {
          delete now[attr];
        } else {
          now[attr] = val;
        }
        if (!isEqual(prev[attr], val) || hasOwn(now, attr) !== hasOwn(prev, attr)) {
          this.changed[attr] = val;
          if (!options.silent) {
            this._pending[attr] = true;
          }
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }
      if (!options.silent) {
        this.change(options);
      }
      return this;
    };
    prototype.unset = function(attr, options){
      var ref$;
      return this.set(attr, null, (ref$ = clone$(options), ref$.unset = true, ref$));
    };
    prototype.clear = function(options){
      var ref$;
      return this.set(clone$(this.attributes), (ref$ = clone$(options), ref$.unset = true, ref$));
    };
    prototype.fetch = function(options){
      var model, success;
      options = clone$(options);
      model = this;
      success = options.success;
      options.success = function(resp, status, xhr){
        if (!model.set(model.parse(resp, xhr), options)) {
          return false;
        }
        if (success) {
          return success(model, resp, options);
        }
      };
      return this.sync('read', this, options);
    };
    prototype.save = function(key, value, options){
      var done, attrs, current, ref$, silentOptions, model, success, xhr;
      done = false;
      if (isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = clone$(options);
      if (options.wait) {
        if (!this._validate(attrs, options)) {
          return false;
        }
        current = clone(this.attributes);
      }
      silentOptions = (ref$ = clone$(options), ref$.silent = true, ref$);
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }
      if (!attrs && !this.isValid()) {
        return false;
      }
      model = this;
      success = options.success;
      options.success = function(resp, status, xhr){
        var serverAttrs;
        done = true;
        serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          serverAttrs = import$(clone$(attrs || {}), serverAttrs);
        }
        if (!model.set(serverAttrs, options)) {
          return false;
        }
        if (success) {
          return success(model, resp, options);
        }
      };
      xhr = this.sync(this.isNew() ? 'create' : 'update', this, options);
      if (!done && options.wait) {
        this.clear(silentOptions);
        this.set(current, silentOptions);
      }
      return xhr;
    };
    prototype.destroy = function(options){
      var model, success, destroy, xhr;
      options = clone$(options);
      model = this;
      success = options.success;
      destroy = function(){
        return model.trigger('destroy', model, model.collection, options);
      };
      options.success = function(resp){
        if (options.wait || model.isNew()) {
          destroy();
        }
        if (success) {
          success(model, resp, options);
        }
      };
      if (this.isNew()) {
        options.success();
        return false;
      }
      xhr = this.sync('delete', this, options);
      if (!options.wait) {
        destroy();
      }
      return xhr;
    };
    prototype.url = function(){
      var base;
      base = result(this, 'urlRoot') || result(this.collection, 'url') || urlError();
      if (this.isNew()) {
        return base;
      }
      return base + (base.charAt(base.length - 1) === "/" ? "" : "/") + encodeURIComponent(this.id);
    };
    prototype.parse = function(resp, xhr){
      return resp;
    };
    prototype.clone = function(){
      return new this.constructor(this.attributes);
    };
    prototype.isNew = function(){
      return this.id == null;
    };
    prototype.change = function(options){
      var changing, attr, changes;
      options || (options = {});
      changing = this._changing;
      this._changing = true;
      for (attr in this._silent) {
        this._pending[attr] = true;
      }
      changes = import$(clone$(options.changes), this._silent);
      this._silent = {};
      for (attr in changes) {
        this.trigger("change:" + attr, this, this.get(attr), options);
      }
      if (changing) {
        return this;
      }
      while (!isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        for (attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) {
            continue;
          }
          delete this.changed[attr];
        }
        this._previousAttributes = clone(this.attributes);
      }
      this._changing = false;
      return this;
    };
    prototype.hasChanged = function(attr){
      if (attr == null) {
        return !isEmpty(this.changed);
      }
      return hasOwn(this.changed, attr);
    };
    prototype.changedAttributes = function(diff){
      var changed, old, attr, val;
      if (!diff) {
        return this.hasChanged() ? clone(this.changed) : false;
      }
      changed = false;
      old = this._previousAttributes;
      for (attr in diff) {
        if (isEqual(old[attr], val = diff[attr])) {
          continue;
        }
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    };
    prototype.previous = function(attr){
      if (attr == null || !this._previousAttributes) {
        return null;
      }
      return this._previousAttributes[attr];
    };
    prototype.previousAttributes = function(){
      return clone(this._previousAttributes);
    };
    prototype.isValid = function(options){
      return !this.validate || !this.validate(this.attributes, options);
    };
    prototype._validate = function(attrs, options){
      var error;
      if (options.silent || !this.validate) {
        return true;
      }
      attrs = import$(clone$(this.attributes), attrs);
      error = this.validate(attrs, options);
      if (!error) {
        return true;
      }
      if (options && options.error) {
        options.error(this, error, options);
      }
      this.trigger('error', this, error, options);
      return false;
    };
    return Model;
  }(Events));
  Collection = (function(){
    Collection.displayName = 'Collection';
    var prototype = Collection.prototype, constructor = Collection;
    importAll$(prototype, arguments[0]);
    function Collection(models, options){
      options || (options = {});
      if (options.model) {
        this.model = options.model;
      }
      if (options.comparator !== void 8) {
        this.comparator = options.comparator;
      }
      this._reset();
      this.initialize.apply(this, arguments);
      if (models) {
        if (options.parse) {
          models = this.parse(models);
        }
        this.reset(models, {
          silent: true
        }, {
          parse: options.parse
        });
      }
    }
    prototype.model = Model;
    prototype.initialize = function(){};
    prototype.toJSON = function(options){
      return this.map(function(it){
        return it.toJSON(options);
      });
    };
    prototype.sync = function(){
      return Backbone.sync.apply(this, arguments);
    };
    prototype.add = function(models, options){
      var cids, ids, at, i, to$, model, existing, args;
      options || (options = {});
      cids = {};
      ids = {};
      at = options.at;
      models = isArray(models)
        ? models.slice()
        : [models];
      for (i = 0, to$ = models.length; i < to$; ++i) {
        if (models[i] = this._prepareModel(models[i], options)) {
          continue;
        }
        throw new Error("Can't add an invalid model to a collection");
      }
      for (i = models.length - 1; i >= 0; --i) {
        model = models[i];
        existing = model.id != null && this._byId[model.id];
        if (existing || this._byCid[model.cid]) {
          if (options.merge && existing) {
            existing.set(model, options);
          }
          models.splice(i, 1);
          continue;
        }
        model.on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) {
          this._byId[model.id] = model;
        }
      }
      this.length += models.length;
      args = [
        at != null
          ? at
          : this.models.length, 0
      ];
      Array.prototype.push.apply(args, models);
      Array.prototype.splice.apply(this.models, args);
      if (this.comparator && at == null) {
        this.sort({
          silent: true
        });
      }
      if (options.silent) {
        return this;
      }
      while (model = models.shift()) {
        model.trigger('add', model, this, options);
      }
      return this;
    };
    prototype.remove = function(models, options){
      var i, to$, model, index;
      options || (options = {});
      models = isArray(models)
        ? models.slice()
        : [models];
      for (i = 0, to$ = models.length; i < to$; ++i) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (model) {
          delete this._byId[model.id];
          delete this._byCid[model.cid];
          index = indexOf(this.models, model);
          this.models.splice(index, 1);
          this.length--;
          if (!options.silent) {
            options.index = index;
            model.trigger('remove', model, this, options);
          }
          this._removeReference(model);
        }
      }
      return this;
    };
    prototype.push = function(model, options){
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    };
    prototype.pop = function(options){
      var model;
      model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    };
    prototype.unshift = function(model, options){
      model = this._prepareModel(model, options);
      this.add(model, importAll$({
        at: 0
      }, options));
      return model;
    };
    prototype.shift = function(options){
      var model;
      model = this.at(0);
      this.remove(model, options);
      return model;
    };
    prototype.slice = function(begin, end){
      return this.models.slice(begin, end);
    };
    prototype.get = function(id){
      if (id == null) {
        return void 8;
      }
      return this._byId[id.id != null ? id.id : id];
    };
    prototype.getByCid = function(cid){
      return cid && this._byCid[cid.cid || cid];
    };
    prototype.at = function(index){
      return this.models[index];
    };
    prototype.where = function(attrs){
      if (isEmpty(attrs)) {
        return [];
      }
      return this.filter(function(model){
        var key;
        for (key in attrs) {
          if (attrs[key] !== model.get(key)) {
            return false;
          }
        }
        return true;
      });
    };
    prototype.sort = function(options){
      if (!this.comparator) {
        throw new Error("Cannot sort a set without a comparator");
      }
      if (toString$.call(this.comparator).slice(8, -1) === 'String' || this.comparator.length === 1) {
        this.models = sortBy(this.models, this.comparator, this);
      } else {
        this.models.sort(bind(this.comparator, this));
      }
      if (!options || !options.silent) {
        this.trigger('reset', this, options);
      }
      return this;
    };
    prototype.pluck = function(attr){
      return map(function(it){
        return it.get(attr);
      }, this.models);
    };
    prototype.reset = function(models, options){
      var i, to$;
      for (i = 0, to$ = this.models.length; i < to$; ++i) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      if (models) {
        this.add(models, importAll$({
          silent: true
        }, options));
      }
      if (!options || !options.silent) {
        this.trigger('reset', this, options);
      }
      return this;
    };
    prototype.fetch = function(options){
      var collection, success;
      options = clone$(options);
      if (options.parse === void 8) {
        options.parse = true;
      }
      collection = this;
      success = options.success;
      options.success = function(resp, status, xhr){
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) {
          return success(collection, resp, options);
        }
      };
      return this.sync('read', this, options);
    };
    prototype.create = function(model, options){
      var collection, success;
      collection = this;
      options = clone$(options);
      model = this._prepareModel(model, options);
      if (!model) {
        return false;
      }
      if (!options.wait) {
        collection.add(model, options);
      }
      success = options.success;
      options.success = function(model, resp, options){
        if (options.wait) {
          collection.add(model, options);
        }
        if (success) {
          return success(model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    };
    prototype.parse = function(resp, xhr){
      return resp;
    };
    prototype.clone = function(){
      return new this.constructor(this.models);
    };
    prototype._reset = function(options){
      this.length = 0;
      this.models = [];
      this._byId = {};
      this._byCid = {};
    };
    prototype._prepareModel = function(attrs, options){
      var model;
      options || (options = {});
      if (attrs instanceof Model) {
        if (!attrs.collection) {
          attrs.collection = this;
        }
        return attrs;
      }
      options.collection = this;
      model = new this.model(attrs, options);
      if (!model._validate(model.attributes, options)) {
        return false;
      }
      return model;
    };
    prototype._removeReference = function(model){
      if (this === model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    };
    prototype._onModelEvent = function(event, model, collection, options){
      if ((event === 'add' || event === 'remove') && collection !== this) {
        return;
      }
      if (event === 'destroy') {
        this.remove(model, options);
      }
      if (model && event === "change:" + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) {
          this._byId[model.id] = model;
        }
      }
      this.trigger.apply(this, arguments);
    };
    return Collection;
  }(Events));
  Collection._methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl', 'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'max', 'min', 'sortedIndex', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest', 'tail', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain'];
  Collection._attributeMethods = ['groupBy', 'countBy', 'sortBy'];
  Collection.injectUnderscoreMethods = function(underscore){
    var i$, ref$, len$, method, results$ = [];
    for (i$ = 0, len$ = (ref$ = Collection._methods).length; i$ < len$; ++i$) {
      method = ref$[i$];
      (fn$.call(this, method));
    }
    for (i$ = 0, len$ = (ref$ = Collection._attributeMethods).length; i$ < len$; ++i$) {
      method = ref$[i$];
      results$.push((fn1$.call(this, method)));
    }
    return results$;
    function fn$(method){
      Collection.prototype[method] = function(){
        var args;
        args = slice$.call(arguments);
        args.unshift(this.models);
        return underscore[method].apply(underscore, args);
      };
    }
    function fn1$(method){
      return Collection.prototype[method] = function(value, context){
        var iterator;
        iterator = toString$.call(value).slice(8, -1) === 'Function'
          ? value
          : function(model){
            return model.get(value);
          };
        return underscore[method](this.models, iterator, context);
      };
    }
  };
  if (underscore) {
    Collection.injectUnderscoreMethods(underscore);
  } else {
    importAll$(Collection.prototype, {
      indexOf: function(model){
        return indexOf(this.models, model);
      },
      first: function(){
        return this.models[0];
      },
      last: function(){
        var ref$;
        return (ref$ = this.models)[ref$.length - 1];
      },
      map: function(fun){
        return map(fun, this.models);
      },
      filter: function(fun){
        return filter(fun, this.models);
      },
      each: function(fun){
        var index, ref$, len$, model;
        for (index = 0, len$ = (ref$ = this.models).length; index < len$; ++index) {
          model = ref$[index];
          fun(model, index);
        }
      },
      size: function(){
        return this.length;
      },
      isEmpty: function(){
        return this.length === 0;
      },
      toArray: function(){
        return this.models.slice(0);
      },
      contains: function(target){
        return -1 !== indexOf(this.models, target);
      },
      sortBy: function(value, context){
        var iterator;
        iterator = toString$.call(value).slice(8, -1) === 'Function'
          ? value
          : function(model){
            return model.get(value);
          };
        return sortBy(this.models, iterator, context);
      }
    });
    for (i$ = 0, len$ = (ref$ = Collection._methods.concat(Collection._attributeMethods)).length; i$ < len$; ++i$) {
      m = ref$[i$];
      if (toString$.call(Collection.prototype[m]).slice(8, -1) !== 'Function') {
        Collection.prototype[m] = fn$;
      }
    }
  }
  Router = (function(){
    Router.displayName = 'Router';
    var namedParam, splatParam, escapeRegExp, prototype = Router.prototype, constructor = Router;
    importAll$(prototype, arguments[0]);
    function Router(options){
      options || (options = {});
      if (options.routes) {
        this.routes = options.routes;
      }
      this._bindRoutes();
      this.initialize.apply(this, arguments);
    }
    namedParam = /:\w+/g;
    splatParam = /\*\w+/g;
    escapeRegExp = /[-[\]{}!+?.,\\^$|#\s]/g;
    prototype.initialize = function(){};
    prototype.route = function(route, name, callback){
      if (toString$.call(route).slice(8, -1) !== 'RegExp') {
        route = this._routeToRegExp(route);
      }
      if (!callback) {
        callback = this[name];
      }
      Backbone.history.route(route, bind(function(fragment){
        var args;
        args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ["route:" + name].concat(args));
        return Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    };
    prototype.navigate = function(fragment, options){
      return Backbone.history.navigate(fragment, options);
    };
    prototype._bindRoutes = function(){
      var routes, route, i, to$;
      if (!this.routes) {
        return;
      }
      routes = [];
      for (route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (i = 0, to$ = routes.length; i < to$; ++i) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    };
    prototype._routeToRegExp = function(route){
      route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^/]+)").replace(splatParam, "(.*?)");
      return new RegExp("^" + route + "$");
    };
    prototype._extractParameters = function(route, fragment){
      return route.exec(fragment).slice(1);
    };
    return Router;
  }(Events));
  History = (function(){
    History.displayName = 'History';
    var routeStripper, rootStripper, isExplorer, trailingSlash, prototype = History.prototype, constructor = History;
    importAll$(prototype, arguments[0]);
    function History(){
      this.handlers = [];
      bind(this.checkUrl, this);
      if (typeof window != 'undefined' && window !== null) {
        this.location = window.location;
        this.history = window.history;
      }
    }
    routeStripper = /^[#\/]/;
    rootStripper = /^\/+|\/+$/g;
    isExplorer = /msie [\w.]+/;
    trailingSlash = /\/$/;
    History.started = false;
    prototype.interval = 50;
    prototype.getHash = function(window){
      var m;
      m = (window || this).location.href.match(/#(.*)$/);
      if (m) {
        return m[1];
      } else {
        return "";
      }
    };
    prototype.getFragment = function(fragment, forcePushState){
      var root;
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          root = this.root.replace(trailingSlash, "");
          if (!fragment.indexOf(root)) {
            fragment = fragment.substr(root.length);
          }
        } else {
          fragment = this.getHash();
        }
      }
      return decodeURIComponent(fragment.replace(routeStripper, ""));
    };
    prototype.start = function(options){
      var ref$, fragment, docMode, oldIE, loc, atRoot;
      if (History.started) {
        throw new Error("Backbone.history has already been started");
      }
      History.started = true;
      this.options = importAll$((ref$ = clone$(this.options), ref$.root = '/', ref$), options);
      this.root = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState = !!this.options.pushState;
      this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
      fragment = this.getFragment();
      docMode = document.documentMode;
      oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);
      this.root = ("/" + this.root + "/").replace(rootStripper, "/");
      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }
      if (this._hasPushState) {
        Backbone.$(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && 'onhashchange' in window && !oldIE) {
        Backbone.$(window).bind('hashchange', this.checkUrl);
      } else {
        if (this._wantsHashChange) {
          this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
        }
      }
      this.fragment = fragment;
      loc = this.location;
      atRoot = loc.pathname.replace(/[^\/]$/, "$&/") === this.root && !loc.search;
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + "#" + this.fragment);
        return true;
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, "");
        this.history.replaceState({}, document.title, this.root + this.fragment);
      }
      if (!this.options.silent) {
        return this.loadUrl();
      }
    };
    prototype.stop = function(){
      Backbone.$(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    };
    prototype.route = function(route, callback){
      this.handlers.unshift({
        route: route,
        callback: callback
      });
    };
    prototype.checkUrl = function(e){
      var current;
      current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) {
        return false;
      }
      if (this.iframe) {
        this.navigate(current);
      }
      this.loadUrl() || this.loadUrl(this.getHash());
    };
    prototype.loadUrl = function(fragmentOverride){
      var fragment, matched;
      fragment = this.fragment = this.getFragment(fragmentOverride);
      matched = any(this.handlers, function(handler){
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    };
    prototype.navigate = function(fragment, options){
      var url;
      if (!History.started) {
        return false;
      }
      if (!options || options === true) {
        options = {
          trigger: options
        };
      }
      fragment = this.getFragment(fragment || "");
      if (this.fragment === fragment) {
        return;
      }
      this.fragment = fragment;
      url = this.root + fragment;
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getFragment(this.getHash(this.iframe))) {
          if (!options.replace) {
            this.iframe.document.open().close();
          }
          this._updateHash(this.iframe.location, fragment, options.replace);
        }
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) {
        this.loadUrl(fragment);
      }
    };
    prototype._updateHash = function(location, fragment, replace){
      var href;
      if (replace) {
        href = location.href.replace(/(javascript:|#).*$/, "");
        location.replace(href + "#" + fragment);
      } else {
        location.hash = "#" + fragment;
      }
    };
    return History;
  }(Events));
  Backbone.history = new History;
  View = (function(){
    View.displayName = 'View';
    var delegateEventSplitter, viewOptions, prototype = View.prototype, constructor = View;
    importAll$(prototype, arguments[0]);
    function View(options){
      options || (options = {});
      this.cid = 'view' + View.lastId++;
      this._configure(options);
      this._ensureElement();
      this.initialize.apply(this, arguments);
      this.delegateEvents();
    }
    View.lastId = 0;
    delegateEventSplitter = /^(\S+)\s*(.*)$/;
    viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];
    prototype.tagName = 'div';
    prototype.$ = function(selector){
      return this.$el.find(selector);
    };
    prototype.initialize = function(){};
    prototype.render = function(){
      return this;
    };
    prototype.dispose = function(){
      this.undelegateEvents();
      if (this.model) {
        this.model.off(null, null, this);
      }
      if (this.collection) {
        this.collection.off(null, null, this);
      }
      return this;
    };
    prototype.remove = function(){
      this.dispose();
      this.$el.remove();
      return this;
    };
    prototype.make = function(tagName, attributes, content){
      var el;
      el = document.createElement(tagName);
      if (attributes) {
        Backbone.$(el).attr(attributes);
      }
      if (content != null) {
        Backbone.$(el).html(content);
      }
      return el;
    };
    prototype.setElement = function(element, delegate){
      if (this.$el) {
        this.undelegateEvents();
      }
      this.$el = element instanceof Backbone.$
        ? element
        : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) {
        this.delegateEvents();
      }
      return this;
    };
    prototype.delegateEvents = function(events){
      var key, method, ref$, eventName, selector;
      if (!(events || (events = result(this, 'events')))) {
        return;
      }
      this.undelegateEvents();
      for (key in events) {
        method = events[key];
        if (toString$.call(method).slice(8, -1) !== 'Function') {
          method = this[events[key]];
        }
        if (!method) {
          throw new Error("Method \"" + events[key] + "\" does not exist");
        }
        ref$ = key.match(delegateEventSplitter), eventName = ref$[1], selector = ref$[2];
        method = bind(method, this);
        eventName += ".delegateEvents" + this.cid;
        if (selector === "") {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    };
    prototype.undelegateEvents = function(){
      this.$el.unbind(".delegateEvents" + this.cid);
    };
    prototype._configure = function(options){
      var i, to$, attr;
      if (this.options) {
        options = import$(clone$(this.options), options);
      }
      for (i = 0, to$ = viewOptions.length; i < to$; ++i) {
        attr = viewOptions[i];
        if (options[attr]) {
          this[attr] = options[attr];
        }
      }
      this.options = options;
    };
    prototype._ensureElement = function(){
      var attrs;
      if (!this.el) {
        attrs = importAll$({}, result(this, 'attributes'));
        if (this.id) {
          attrs.id = result(this, 'id');
        }
        if (this.className) {
          attrs['class'] = result(this, 'className');
        }
        this.setElement(this.make(result(this, 'tagName'), attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    };
    return View;
  }(Events));
  methodMap = {
    create: 'POST',
    update: 'PUT',
    'delete': 'DELETE',
    read: 'GET'
  };
  Backbone.sync = function(method, model, options){
    var type, params, success, error;
    options || (options = {});
    type = methodMap[method];
    params = {
      type: type,
      dataType: 'json'
    };
    if (!options.url) {
      params.url = result(model, 'url') || urlError();
    }
    if (!options.data && model && (method === 'create' || method === 'update')) {
      params.contentType = "application/json";
      params.data = JSON.stringify(model);
    }
    if (Backbone.emulateJSON) {
      params.contentType = "application/x-www-form-urlencoded";
      params.data = params.data
        ? {
          model: params.data
        }
        : {};
    }
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) {
          params.data._method = type;
        }
        params.type = 'POST';
        params.beforeSend = function(xhr){
          return xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }
    success = options.success;
    options.success = function(resp, status, xhr){
      if (success) {
        success(resp, status, xhr);
      }
      return model.trigger('sync', model, resp, options);
    };
    error = options.error;
    options.error = function(xhr, status, thrown){
      if (error) {
        error(model, xhr, options);
      }
      return model.trigger('error', model, xhr, options);
    };
    Backbone.ajax(importAll$(params, options));
  };
  Backbone.ajax = function(){
    var args, ref$;
    args = slice$.call(arguments);
    return (ref$ = Backbone.$).ajax.apply(ref$, args);
  };
  importAll$(Backbone, {
    Events: Events,
    Model: Model,
    Collection: Collection,
    View: View,
    Router: Router,
    History: History
  });
  extend = function(protoProps, staticProps){
    var parent, child, Surrogate;
    parent = this;
    if (protoProps && hasOwn(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){
        parent.apply(this, arguments);
      };
    }
    Surrogate = function(){
      this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    if (protoProps) {
      importAll$(child.prototype, protoProps);
    }
    importAll$(importAll$(child, parent), staticProps);
    child.__super__ = parent.prototype;
    return child;
  };
  Model.extend = Collection.extend = Router.extend = View.extend = extend;
  urlError = function(){
    throw new Error("A \"url\" property or function must be specified");
  };
  function map(fun, arr){
    var index, len$, el, results$ = [];
    for (index = 0, len$ = arr.length; index < len$; ++index) {
      el = arr[index];
      results$.push(fun(el, index));
    }
    return results$;
  }
  function filter(fun, arr){
    var index, len$, el, results$ = [];
    for (index = 0, len$ = arr.length; index < len$; ++index) {
      el = arr[index];
      if (fun(el, index)) {
        results$.push(el);
      }
    }
    return results$;
  }
  keys = Object.keys || function(obj){
    var key, own$ = {}.hasOwnProperty, results$ = [];
    for (key in obj) if (own$.call(obj, key)) {
      results$.push(key);
    }
    return results$;
  };
  isArray = Array.isArray || function(obj){
    return toString$.call(obj).slice(8, -1) === 'Array';
  };
  function clone(obj){
    if (isObject(obj)) {
      return importAll$({}, obj);
    } else {
      return obj;
    }
  }
  function isObject(obj){
    return obj === Object(obj);
  }
  function isEmpty(x){
    var k, v;
    if (x == null) {
      return true;
    } else if (isArray(x) || toString$.call(x).slice(8, -1) === 'String') {
      return x.length === 0;
    } else {
      for (k in x) {
        v = x[k];
        if (hasOwn(x, k)) {
          return false;
        }
      }
      return true;
    }
  }
  function isEqual(a, b){
    if (isObject(a) && isObject(b)) {
      return deepEq$(a, b, '===');
    } else {
      return a === b;
    }
  }
  function hasOwn(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  function bind(func){
    var contextAndArgs, context, args, ctor, bound;
    contextAndArgs = slice$.call(arguments, 1);
    if (func.bind === Function.prototype.bind) {
      return Function.prototype.bind.apply(func, contextAndArgs);
    } else if (toString$.call(func).slice(8, -1) !== 'Function') {
      throw TypeError();
    } else {
      context = contextAndArgs[0], args = slice$.call(contextAndArgs, 1);
      ctor = function(){};
      return bound = function(){
        var moreArgs, self, result;
        moreArgs = slice$.call(arguments);
        if (this instanceof bound) {
          ctor.prototype = func.prototype;
          self = new ctor;
          result = func.apply(self, args.concat(moreArgs));
          if (isObject(result)) {
            return result;
          } else {
            return self;
          }
        } else {
          return func.apply(context, args.concat(moreArgs));
        }
      };
    }
  }
  function result(object, property){
    var value;
    if (object != null) {
      value = object[property];
      if (toString$.call(value).slice(8, -1) === 'Function') {
        return value.call(object);
      } else {
        return value;
      }
    } else {
      return null;
    }
  }
  function any(obj, iterator, context){
    var index, value, own$ = {}.hasOwnProperty;
    iterator || (iterator = function(i){
      return i;
    });
    if (Array.prototype.some && obj.some === Array.prototype.some) {
      return obj.some(iterator, context);
    } else {
      for (index in obj) if (own$.call(obj, index)) {
        value = obj[index];
        if (iterator.call(context, value, index, obj)) {
          return true;
        }
      }
      return false;
    }
  }
  function sortBy(obj, value, context){
    var iterator, makeCriteria, compareFun;
    iterator = toString$.call(value).slice(8, -1) === 'Function'
      ? value
      : function(x){
        return x[value];
      };
    makeCriteria = function(value, index){
      var criteria;
      criteria = iterator.call(context, value, index, obj);
      return {
        value: value,
        index: index,
        criteria: criteria
      };
    };
    compareFun = function(arg$, arg1$){
      var a, i, b, j;
      a = arg$.criteria, i = arg$.index;
      b = arg1$.criteria, j = arg1$.index;
      if (a !== b) {
        if (a > b || a === void 8) {
          return 1;
        }
        if (a < b || b === void 8) {
          return -1;
        }
      }
      return i < j ? -1 : 1;
    };
    return partialize$(map, [
      function(it){
        return it.value;
      }, void 8
    ], [1])(
    function(it){
      return it.sort(compareFun);
    }(
    partialize$(map, [makeCriteria, void 8], [1])(
    obj)));
  }
  function escaped(val){
    return (val + "").replace(/[&<>"'\/]/g, function(m){
      switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#x27;';
      case '/':
        return '&#x2F;';
      }
    });
  }
  function indexOf(array, item){
    var i, to$;
    if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) {
      return array.indexOf(item);
    } else {
      for (i = 0, to$ = array.length; i < to$; ++i) {
        if (array[i] === item) {
          return i;
        }
      }
      return -1;
    }
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
  function fn$(){
    throw Error("You need underscore.js if the method `" + m + "` shall work.");
  }
  function deepEq$(x, y, type){
    var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
        has = function (obj, key) { return hasOwnProperty.call(obj, key); };
    first = true;
    return eq(x, y, []);
    function eq(a, b, stack) {
      var className, length, size, result, alength, blength, r, key, ref, sizeB;
      if (a == null || b == null) { return a === b; }
      if (a.__placeholder__ || b.__placeholder__) { return true; }
      if (a === b) { return a !== 0 || 1 / a == 1 / b; }
      className = toString.call(a);
      if (toString.call(b) != className) { return false; }
      switch (className) {
        case '[object String]': return a == String(b);
        case '[object Number]':
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          return +a == +b;
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != 'object' || typeof b != 'object') { return false; }
      length = stack.length;
      while (length--) { if (stack[length] == a) { return true; } }
      stack.push(a);
      size = 0;
      result = true;
      if (className == '[object Array]') {
        alength = a.length;
        blength = b.length;
        if (first) {
          switch (type) {
          case '===': result = alength === blength; break;
          case '<==': result = alength <= blength; break;
          case '<<=': result = alength < blength; break;
          }
          size = alength;
          first = false;
        } else {
          result = alength === blength;
          size = alength;
        }
        if (result) {
          while (size--) {
            if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
          }
        }
      } else {
        if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
          return false;
        }
        for (key in a) {
          if (has(a, key)) {
            size++;
            if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
          }
        }
        if (result) {
          sizeB = 0;
          for (key in b) {
            if (has(b, key)) { ++sizeB; }
          }
          if (first) {
            if (type === '<<=') {
              result = size < sizeB;
            } else if (type === '<==') {
              result = size <= sizeB
            } else {
              result = size === sizeB;
            }
          } else {
            first = false;
            result = size === sizeB;
          }
        }
      }
      stack.pop();
      return result;
    }
  }
  function partialize$(f, args, where){
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ? partialize$(f, ta, tw) : f.apply(this, ta);
    };
  }
}).call(this);
