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
  'use strict';

  var _delayedTriggers = [];

  Backbone.NestedModel = Backbone.Model.extend({

    get: function(attrStrOrPath){
      var attrPath = Backbone.NestedModel.attrPath(attrStrOrPath),
        result;

      Backbone.NestedModel.walkPath(this.attributes, attrPath, function(val, path){
        var attr = _.last(path);
        if (path.length === attrPath.length){
          // attribute found
          result = val[attr];
        }
      });

      return result;
    },

    has: function(attr){
      // for some reason this is not how Backbone.Model is implemented - it accesses the attributes object directly
      var result = this.get(attr);
      return !(result === null || _.isUndefined(result));
    },

    set: function(key, value, opts){
      var newAttrs = Backbone.NestedModel.deepClone(this.attributes);

      if (_.isString(key)){
        // Backbone 0.9.0+ syntax: `model.set(key, val)` - convert the key to an attribute path
        key = Backbone.NestedModel.attrPath(key);
      }

      if (_.isArray(key)){
        // attribute path
        this._setAttr(newAttrs, key, value, opts);
      } else { // it's an Object
        opts = value;
        var attrs = key,
          attrPath;

        for (var attrStr in attrs){
          if (attrs.hasOwnProperty(attrStr)){
            attrPath = Backbone.NestedModel.attrPath(attrStr);
            this._setAttr(newAttrs, attrPath, attrs[attrStr], opts);
          }
        }
      }

      var setReturn = Backbone.NestedModel.__super__.set.call(this, newAttrs, opts);
      this._runDelayedTriggers();
      return setReturn;
    },

    unset: function(attrStr, opts){
      opts = _.extend({}, opts, {unset: true});
      this.set(attrStr, null, opts);

      return this;
    },

    add: function(attrStr, value, opts){
      var current = this.get(attrStr);
      if (!_.isArray(current)) throw new Error('current value is not an array');
      return this.set(attrStr + '[' + current.length + ']', value, opts);
    },

    remove: function(attrStr, opts){
      opts = opts || {};

      var attrPath = Backbone.NestedModel.attrPath(attrStr),
        aryPath = _.initial(attrPath),
        val = this.get(aryPath),
        i = _.last(attrPath);

      if (!_.isArray(val)){
        throw new Error("remove() must be called on a nested array");
      }

      // only trigger if an element is actually being removed
      var trigger = !opts.silent && (val.length >= i + 1),
        oldEl = val[i];

      // remove the element from the array
      val.splice(i, 1);
      this.set(aryPath, val, opts);

      if (trigger){
        var attrStr = Backbone.NestedModel.createAttrStr(aryPath);
        this.trigger('remove:' + attrStr, this, oldEl);
        this.trigger('change:' + attrStr, this, oldEl);
        for (var aryCount = aryPath.length - 1; aryCount >= 0; aryCount--) {
          attrStr = Backbone.NestedModel.createAttrStr(_.first(aryPath, aryCount));
          this.trigger('change:' + attrStr, this, oldEl);
        };
        this.trigger('change', this, oldEl);
      }

      return this;
    },

    toJSON: function(){
      return Backbone.NestedModel.deepClone(this.attributes);
    },


    // private
    _delayedTrigger: function(/* the trigger args */){
      _delayedTriggers.push(arguments);
    },

    _runDelayedTriggers: function(){
      while (_delayedTriggers.length > 0){
        this.trigger.apply(this, _delayedTriggers.shift());
      }
    },

    // note: modifies `newAttrs`
    _setAttr: function(newAttrs, attrPath, value, opts){
      opts = opts || {};

      var fullPathLength = attrPath.length;
      var model = this;

      Backbone.NestedModel.walkPath(newAttrs, attrPath, function(val, path){
        var attr = _.last(path);
        var attrStr = Backbone.NestedModel.createAttrStr(path);

        // See if this is a new value being set
        var isNewValue = !_.isEqual(val[attr], value);

        if (path.length === fullPathLength){
          // reached the attribute to be set
          
          // Set the new value
          val[attr] = value;

          // Trigger Change Event if new values are being set
          if (_.isObject(value) && isNewValue){
            for (var a in value){
              if (value.hasOwnProperty(a)){
                model._delayedTrigger('change:' + attrStr + '.' + a, model, val[attr]);
                model.changed[attrStr] = value;
              }
            }
          }
          
          // Trigger Remove Event if array being set to null
          if (value === null){
            var parentPath = Backbone.NestedModel.createAttrStr(_.initial(attrPath));
            model._delayedTrigger('remove:' + parentPath, model, val[attr]);
          }

        } else if (!val[attr]){
          if (_.isNumber(attr)){
            val[attr] = [];
          } else {
            val[attr] = {};
          }
        }
        
        if (!opts.silent){

          // let the superclass handle change events for top-level attributes
          if (path.length > 1 && isNewValue){
            model._delayedTrigger('change:' + attrStr, model, val[attr]);
            model.changed[attrStr] = val[attr];
          }

          if (_.isArray(val[attr])){
            model._delayedTrigger('add:' + attrStr, model, val[attr]);
          }
        }
      });
    }

  }, {
    // class methods

    attrPath: function(attrStrOrPath){
      var path;
      
      if (_.isString(attrStrOrPath)){
        // TODO this parsing can probably be more efficient
        path = (attrStrOrPath === '') ? [''] : attrStrOrPath.match(/[^\.\[\]]+/g);
        path = _.map(path, function(val){
          // convert array accessors to numbers
          return val.match(/^\d+$/) ? parseInt(val, 10) : val;
        });
      } else {
        path = attrStrOrPath;
      }

      return path;
    },

    createAttrStr: function(attrPath){
      var attrStr = attrPath[0];
      _.each(_.rest(attrPath), function(attr){
        attrStr += _.isNumber(attr) ? ('[' + attr + ']') : ('.' + attr);
      });

      return attrStr;
    },

    deepClone: function(obj){
      return $.extend(true, {}, obj);
    },

    walkPath: function(obj, attrPath, callback, scope){
      var val = obj,
        childAttr;

      // walk through the child attributes
      for (var i = 0; i < attrPath.length; i++){
        callback.call(scope || this, val, attrPath.slice(0, i + 1));

        childAttr = attrPath[i];
        val = val[childAttr];
        if (!val) break; // at the leaf
      }
    }

  });

})();
