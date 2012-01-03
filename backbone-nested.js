Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStrOrPath){
    var attrPath = Backbone.NestedModel.attrPath(attrStrOrPath),
      childAttr = attrPath[0],
      result = Backbone.Model.prototype.get.call(this, childAttr);
    
    if (result instanceof Backbone.Collection){
      if (attrPath.length > 1){
        var otherAttrs = _.rest(attrPath);
        result = result.getNested(otherAttrs);
        
      } else {
        result = result.toJSON();

        if (window.console){
          window.console.log("Square bracket notation is preferred for accesing values of attribute '" + attrStrOrPath + "'.");
        }
      }

    } else if (result instanceof Backbone.Model){
      if (attrPath.length > 1){
        var otherAttrs = _.rest(attrPath);
        result = result.get(otherAttrs);

      } else {
        result = result.toJSON();

        if (window.console){
          window.console.log("Dot notation is preferred for accesing values of attribute '" + attrStrOrPath + "'.");
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
        var nestedCollection = this.ensureNestedCollection(childAttr),
          model, collOpts;

        for (var i = 0; i < val.length; i++){
          model = nestedCollection.at(i);
          if (model){
            // nested model already exists in collection
            model.set(val[i], opts);
          } else {
            collOpts = _.defaults({at: i}, opts);
            nestedCollection.add(val[i], collOpts);
          }
        }

      } else if (typeof val === 'object'){
        // nested attributes
        var nestedModel = this.ensureNestedModel(childAttr);
        nestedModel.set(val, opts);

      } else {
        // leaf
        var setOpts = {};
        setOpts[childAttr] = val;
        Backbone.Model.prototype.set.call(this, setOpts, opts);
      }
    }
  },

  toJSON: function(){
    var json = Backbone.Model.prototype.toJSON.call(this),
      val;
    
    for (var attr in json){
      val = json[attr];

      // convert nested attributes to JSON
      if (val instanceof Backbone.Model || val instanceof Backbone.Collection){
        json[attr] = val.toJSON();
      }
    }

    return json;
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

      nestedModel.bind('all', function(evt){
        this.onNestedModelChange(this, attr, evt);
      }, this);
    }

    return nestedModel;
  },

  onNestedModelChange: function(model, attr, evt){
    var matchData = evt.match(/^change(:(.+))?$/);
    if (matchData){
      // change event
      var childAttr = matchData[2];
      if (childAttr){ // 'change:nested'
        this.trigger('change:' + attr + '.' + childAttr, this, {});
      } else { // 'change'
        this.trigger('change:' + attr, this);
        this.change();
      }
    }
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

  attrPath: function(attrStrOrPath){
    var path;
    
    if (_.isString(attrStrOrPath)){
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
  }

});


Backbone.NestedCollection = Backbone.Collection.extend({

  model: Backbone.NestedModel,

  getNested: function(attrPath){
    var model = this.at(attrPath[0]);

    if (attrPath.length > 1){
      var otherAttrs = _.rest(attrPath);
      return model.get(otherAttrs);
    } else {
      return model.toJSON();
    }
  }

});
