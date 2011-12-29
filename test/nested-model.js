$(document).ready(function() {

  module("Backbone.NestedModel");

  // Variable to catch the last request.
  window.lastRequest = null;

  // window.originalSync = Backbone.sync;

  // // Stub out Backbone.request...
  // Backbone.sync = function() {
  //   lastRequest = _.toArray(arguments);
  // };

  var attrs = {
    gender: 'M',
    name: {
      first: "Aidan",
      last: "Feldman"
    },
    addresses: [
      {
        city: "Brookyln",
        state: "NY"
      },
      {
        city: "Oak Park",
        state: "IL"
      }
    ]
  };

  var proxy = Backbone.NestedModel.extend();
  var doc = new proxy(attrs);


  test("NestedModel: get", function() {
    equals(doc.get('gender'), 'M');
  });

  test("NestedModel: get 1-1 backwards compatibility", function() {
    equals(doc.get('name').first, 'Aidan');
    equals(doc.get('name').last, 'Feldman');
  });

  test("NestedModel: get 1-1", function() {
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');
  });

  // Backbone.sync = window.originalSync;

});
