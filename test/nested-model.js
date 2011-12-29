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
        city: "Brooklyn",
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

  test("NestedModel: get 1-1 returns attributes object", function() {
    equals(doc.get('name').first, 'Aidan');
    equals(doc.get('name').last, 'Feldman');
  });

  test("NestedModel: get 1-1", function() {
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');
  });

  test("NestedModel: get 1-N dot notation", function() {
    equals(doc.get('addresses.0.city'), 'Brooklyn');
    equals(doc.get('addresses.0.state'), 'NY');
    equals(doc.get('addresses.1.city'), 'Oak Park');
    equals(doc.get('addresses.1.state'), 'IL');
  });

  test("NestedModel: get 1-N square bracket notation", function() {
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');
  });

  // Backbone.sync = window.originalSync;

});
