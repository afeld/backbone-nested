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


  test("NestedModel: set", function() {
    equals(doc.get('gender'), 'M');
    doc.set({'gender': 'F'});
    equals(doc.get('gender'), 'F');
  });

  test("NestedModel: set 1-1", function() {
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');

    doc.set({'name.first': 'Jeremy'});
    doc.set({'name.last': 'Ashkenas'});

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("NestedModel: set 1-N dot notation on leaves", function() {
    equals(doc.get('addresses.0.city'), 'Brooklyn');
    equals(doc.get('addresses.0.state'), 'NY');
    equals(doc.get('addresses.1.city'), 'Oak Park');
    equals(doc.get('addresses.1.state'), 'IL');

    doc.set({'addresses.0.city': 'Seattle'});
    doc.set({'addresses.0.state': 'WA'});
    doc.set({'addresses.1.city': 'Minneapolis'});
    doc.set({'addresses.1.state': 'MN'});

    equals(doc.get('addresses.0.city'), 'Seattle');
    equals(doc.get('addresses.0.state'), 'WA');
    equals(doc.get('addresses.1.city'), 'Minneapolis');
    equals(doc.get('addresses.1.state'), 'MN');
  });

  test("NestedModel: set 1-N square bracket notation on leaves", function() {
    equals(doc.get('addresses[0].city'), 'Seattle');
    equals(doc.get('addresses[0].state'), 'WA');
    equals(doc.get('addresses[1].city'), 'Minneapolis');
    equals(doc.get('addresses[1].state'), 'MN');

    doc.set({'addresses[0].city': 'Brooklyn'});
    doc.set({'addresses[0].state': 'NY'});
    doc.set({'addresses[1].city': 'Oak Park'});
    doc.set({'addresses[1].state': 'IL'});

    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');
  });


  // Backbone.sync = window.originalSync;

});
