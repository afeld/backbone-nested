/**
 * Backbone-Nested 1.0.1 - An extension of Backbone.js that keeps track of nested attributes
 *
 * http://afeld.github.com/backbone-nested/
 *
 * Copyright (c) 2011-2012 Aidan Feldman
 * MIT Licensed (LICENSE)
 */
Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStrOrPath, opts){
    opts || (opts = {});

    var attrPath = Backbone.NestedModel.attrPath(attrStrOrPath),
      childAttr = attrPath[0],
      result = Backbone.Model.prototype.get.call(this, childAttr);
    
    // walk through the child attributes
    for (var i = 1; i < attrPath.length; i++){
      childAttr = attrPath[i];
      result = result[childAttr];
      if (!result){
        // value not present
        break;
      }
    }

    // check if the result is an Object, Array, etc.
    if (!opts.silent && _.isObject(result) && window.console){
      window.console.log("Backbone-Nested syntax is preferred for accesing values of attribute '" + attrStrOrPath + "'.");
    }
    // else it's a leaf

    return result;
  },

  has: function(attr){
    // for some reason this is not how Backbone.Model is implemented - it accesses the attributes object directly
    var result = this.get(attr, {silent: true});
    return !(result === null || _.isUndefined(result));
  },

  set: function(attrs, opts){
    opts || (opts = {});
    var newAttrs = _.deepClone(this.attributes);

    for (var attrStr in attrs){
      var attrPath = Backbone.NestedModel.attrPath(attrStr),
        attrObj = Backbone.NestedModel.createAttrObj(attrPath, attrs[attrStr]);

      this.mergeAttrs(newAttrs, attrObj, opts);
    }

    return Backbone.Model.prototype.set.call(this, newAttrs, opts);
  },

  unset: function(attrStr, opts){
    var setOpts = {};
    setOpts[attrStr] = void 0;
    this.set(setOpts, opts);

    return this;
  },

  remove: function(attrStr, opts){
    this.unset(attrStr, opts);

    var attrPath = Backbone.NestedModel.attrPath(attrStr);
    if (_.isNumber(_.last(attrPath))){
      var aryPath = _.initial(attrPath),
        childAry = this.get(aryPath, {silent: true});
      
      // compact the array (remove falsy values)
      for (var i = 0; i < childAry.length; i++){
        if (!childAry[i]){
          childAry.splice(i, 1);
        }
      }
    }

    return this;
  },

  toJSON: function(){
    var json = Backbone.Model.prototype.toJSON.apply(this);
    return _.deepClone(json);
  },


  // private

  mergeAttrs: function(dest, source, opts, stack){
    stack || (stack = []);

    _.each(source, function(sourceVal, prop){
      if (prop === '-1'){
        prop = dest.length;
      }

      var destVal = dest[prop],
        newStack = stack.concat([prop]),
        attrStr;

      var isChildAry = _.isObject(sourceVal) && _.any(sourceVal, function(val, attr){
        return attr === '-1' || _.isNumber(attr);
      });

      if (isChildAry && !_.isArray(destVal)){
        destVal = dest[prop] = [];
      }

      if (prop in dest && _.isObject(sourceVal) && _.isObject(destVal)){
        destVal = dest[prop] = this.mergeAttrs(destVal, sourceVal, opts, newStack);
      } else {
        var oldVal = destVal;

        destVal = dest[prop] = sourceVal;

        if (_.isArray(dest) && !opts.silent){
          attrStr = Backbone.NestedModel.createAttrStr(stack);

          if (!oldVal && destVal){
            this.trigger('add:' + attrStr, this, destVal);
          } else if (oldVal && !destVal){
            this.trigger('remove:' + attrStr, this, oldVal);
          }
        }
      }
      
      // let the superclass handle change events for top-level attributes
      if (!opts.silent && newStack.length > 1){
        attrStr = Backbone.NestedModel.createAttrStr(newStack);
        this.trigger('change:' + attrStr, this, destVal);
      }
    }, this);

    return dest;
  }

}, {
  // class methods

  attrPath: function(attrStrOrPath){
    var path;
    
    if (_.isString(attrStrOrPath)){
      // change all appends to '-1'
      attrStrOrPath = attrStrOrPath.replace(/\[\]/g, '[-1]');
      // TODO this parsing can probably be more efficient
      path = attrStrOrPath.match(/[^\.\[\]]+/g);
      path = _.map(path, function(val){
        // convert array accessors to numbers
        return val.match(/^\d+$/) ? parseInt(val) : val;
      });
    } else {
      path = attrStrOrPath;
    }

    return path;
  },

  createAttrObj: function(attrStrOrPath, val){
    var attrPath = this.attrPath(attrStrOrPath),
      newVal;

    switch (attrPath.length){
      case 0:
        throw "no valid attributes: '" + attrStrOrPath + "'";
        break;
      
      case 1: // leaf
        newVal = val;
        break;
      
      default: // nested attributes
        var otherAttrs = _.rest(attrPath);
        newVal = this.createAttrObj(otherAttrs, val);
        break;
    }

    var childAttr = attrPath[0],
      result = _.isNumber(childAttr) ? [] : {};
    
    result[childAttr] = newVal;
    return result;
  },

  createAttrStr: function(attrPath){
    var attrStr = attrPath[0];
    _.each(_.rest(attrPath), function(attr){
      attrStr += _.isNumber(attr) ? ('[' + attr + ']') : ('.' + attr);
    });

    return attrStr;
  }

});


_.mixin({

  deepMerge: function(dest){
    _.each(_.rest(arguments), function(source){
      var sourceVal, destVal;
      for (var prop in source){
        sourceVal = source[prop];
        destVal = dest[prop];
        if (prop in dest && _.isObject(sourceVal) && _.isObject(destVal)){
          _.deepMerge(destVal, sourceVal);
        } else {
          dest[prop] = sourceVal;
        }
      }
    });
    return dest;
  },

  deepClone: function(obj){
    var result = _.clone(obj); // shallow clone
    if (_.isObject(obj)){
      _.each(obj, function(val, key){
        result[key] = _.deepClone(val);
      });
    }
    return result;
  }

});
