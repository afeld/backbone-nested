Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStr){
    var attrPath = Backbone.NestedModel.attrPath(attrStr),
      childAttr = attrPath[0],
      result = Backbone.Model.prototype.get.call(this, childAttr);
    
    if (result instanceof Backbone.Collection){
      if (attrPath.length > 1){
        result = result.at(attrPath[1]);
        var otherAttrs = attrPath.slice(2);
        if (otherAttrs.length){
          result = result.get(otherAttrs);
        } else {
          result = result.toJSON();
        }
        
      } else {
        result = result.toJSON();

        if (window.console){
          window.console.log("Square bracket notation is preferred for accesing values of attribute '" + attrStr + "'.");
        }
      }

    } else if (result instanceof Backbone.Model){
      if (attrPath.length > 1){
        var otherAttrs = _.rest(attrPath);
        result = result.get(otherAttrs);
      } else {
        result = result.toJSON();

        if (window.console){
          window.console.log("Dot notation is preferred for accesing values of attribute '" + attrStr + "'.");
        }
      }
    }
    // else it's a leaf

    return result;
  },

  set: function(attrs, opts){
    for (var attrStr in attrs){
      var attrPath = Backbone.NestedModel.attrPath(attrStr),
        childAttr = attrPath[0],
        attrObj = Backbone.NestedModel.createAttrObj(attrPath, attrs[attrStr]),
        val = attrObj[childAttr];

      if (_.isArray(val)){
        var nestedCollection = this.ensureNestedCollection(childAttr);
        nestedCollection.reset(val);

      } else if (typeof val === 'object'){
        // nested attributes
        var nestedModel = this.ensureNestedModel(childAttr);
        nestedModel.set(val);

      } else {
        // leaf
        var setOpts = {};
        setOpts[childAttr] = val;
        Backbone.Model.prototype.set.call(this, setOpts, opts);
      }
    }
  },

  ensureNestedModel: function(attr){
    var nestedModel = Backbone.Model.prototype.get.call(this, attr);

    // TODO handle overwrite vs. modification?
    if (!(nestedModel instanceof Backbone.NestedModel)){ // !(childAttr in this.attributes)
      // create nested model
      nestedModel = new Backbone.NestedModel();
      var setOpts = {};
      setOpts[attr] = nestedModel;
      Backbone.Model.prototype.set.call(this, setOpts, {silent: true});
    }

    return nestedModel;
  },

  ensureNestedCollection: function(attr){
    var nestedCollection = Backbone.Model.prototype.get.call(this, attr);

    // TODO handle overwrite vs. modification?
    if (!(nestedCollection instanceof Backbone.NestedCollection)){ // !(childAttr in this.attributes)
      // create nested collection
      nestedCollection = new Backbone.NestedCollection();
      var setOpts = {};
      setOpts[attr] = nestedCollection;
      Backbone.Model.prototype.set.call(this, setOpts, {silent: true});
    }

    return nestedCollection;
  }

}, {
  // class methods

  attrPath: function(attrStr){
    return _.isString(attrStr) ? attrStr.match(/[^\.\[\]]+/g) : attrStr;
  },

  createAttrObj: function(attrStr, val){
    var attrPath = this.attrPath(attrStr),
      newVal;

    switch (attrPath.length){
      case 0:
        throw "no valid attributes: '" + attrStr + "'";
        break;
      
      case 1:
        newVal = val;
        break;
      
      default:
        var otherAttrs = _.rest(attrPath);
        newVal = this.createAttrObj(otherAttrs, val);
        break;
    }

    var result = {};
    result[attrPath[0]] = newVal;
    return result;
  }

});


Backbone.NestedCollection = Backbone.Collection.extend({

  model: Backbone.NestedModel

});
