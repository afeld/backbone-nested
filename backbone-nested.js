Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStr){
    var attrPath = attrStr.split('.'),
      result = this.attributes;

    while (attrPath.length > 1){
      result = result[attrPath[0]];
      attrPath = _.rest(attrPath);
    }

    return result[attrPath];
  }

});
