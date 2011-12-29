Backbone.NestedModel = Backbone.Model.extend({
  
  constructor: function(attrs, opts){
    Backbone.Model.prototype.constructor.apply( this, arguments );
  },

  get: function(attrStr){
    var attrPath = attrStr.split(/\.|\[|\]\.?/), //.match(/[^\.\[\]]+/g),
      result = this.attributes;

    while (attrPath.length > 1){
      result = result[attrPath[0]];
      attrPath = _.rest(attrPath);
    }
    result = result[attrPath];

    if ((typeof result === 'object') && window.console){
      window.console.log("Dot notation is preferred for accesing values of attribute '" + attrStr + "'.");
    }

    return result;
  }

});
