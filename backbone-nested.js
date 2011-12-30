Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStr){
    var attrPath = Backbone.NestedModel.attrPath(attrStr),
      childAttr = attrPath[0],
      result = Backbone.Model.prototype.get.call(this, childAttr);
    
    if (typeof result === 'object'){
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

    return result;
  },

  set: function(attrs, opts){
    for (var attrStr in attrs){
      var attrPath = Backbone.NestedModel.attrPath(attrStr),
        childAttr = attrPath[0],
        attrObj = Backbone.NestedModel.createAttrObj(attrPath, attrs[attrStr]),
        val = attrObj[childAttr];

      if (_.isArray(val)){
        // TODO hande nested arrays

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
    var nestedModel = this.attributes[attr];
    if (typeof nestedModel !== 'object'){ // !(childAttr in this.attributes)
      // create nested model
      nestedModel = new Backbone.NestedModel();
      var setOpts = {};
      setOpts[attr] = nestedModel;
      Backbone.Model.prototype.set.call(this, setOpts, {silent: true});
    }

    return nestedModel;
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
