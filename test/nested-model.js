$(document).ready(function() {

  module("Backbone.NestedModel");

  // Variable to catch the last request.
  window.lastRequest = null;

  // window.originalSync = Backbone.sync;

  // // Stub out Backbone.request...
  // Backbone.sync = function() {
  //   lastRequest = _.toArray(arguments);
  // };

  var proxy = Backbone.NestedModel.extend();

  function createModel(){
    var doc = new proxy({
      gender: 'M',
      name: {
        first: "Aidan",
        middle: {
          initial: 'L',
          full: 'Lee'
        },
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
    });

    return doc;
  }


  // ----- CREATE_ATTR_OBJ --------

  test("NestedModel.createAttrObj() simple", function() {
    var result = Backbone.NestedModel.createAttrObj('foo', 'bar');
    equals(result.foo, 'bar');
  });

  test("NestedModel.createAttrObj() value object", function() {
    var result = Backbone.NestedModel.createAttrObj('foo', {bar: 'baz'});
    equals(result.foo.bar, 'baz');
  });

  test("NestedModel.createAttrObj() nested attribute", function() {
    var result = Backbone.NestedModel.createAttrObj('foo.bar', 'baz');
    equals(result.foo.bar, 'baz');
  });

  // ----- GET --------

  test("NestedModel#get()", function() {
    var doc = createModel();
    equals(doc.get('gender'), 'M');
  });

  test("NestedModel#get() 1-1 returns attributes object", function() {
    var doc = createModel();
    equals(doc.get('name').first, 'Aidan');
    equals(doc.get('name').middle.initial, 'L');
    equals(doc.get('name').last, 'Feldman');
  });

  test("NestedModel#get() 1-1", function() {
    var doc = createModel();
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.middle.initial'), 'L');
    equals(doc.get('name.last'), 'Feldman');
  });

  test("NestedModel#get() 1-N dot notation", function() {
    var doc = createModel();
    equals(doc.get('addresses.0.city'), 'Brooklyn');
    equals(doc.get('addresses.0.state'), 'NY');
    equals(doc.get('addresses.1.city'), 'Oak Park');
    equals(doc.get('addresses.1.state'), 'IL');
  });

  test("NestedModel#get() 1-N square bracket notation", function() {
    var doc = createModel();
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');
  });

  test("NestedModel#get() 1-N returns attributes object", function() {
    var doc = createModel();

    var addr0 = doc.get('addresses[0]');
    equals(addr0.city, 'Brooklyn');
    equals(addr0.state, 'NY');

    var addr1 = doc.get('addresses[1]');
    equals(addr1.city, 'Oak Park');
    equals(addr1.state, 'IL');
  });


  // ----- SET --------

  test("NestedModel#set()", function() {
    var doc = createModel();
    equals(doc.get('gender'), 'M');
    doc.set({gender: 'F'});
    equals(doc.get('gender'), 'F');
  });

  test("NestedModel#set() 1-1 on leaves", function() {
    var doc = createModel();
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');

    doc.set({'name.first': 'Jeremy'});
    doc.set({'name.last': 'Ashkenas'});

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("NestedModel#set() 1-1 with object", function() {
    var doc = createModel();

    doc.set({
      name: {
        first: 'Jeremy',
        last: 'Ashkenas'
      }
    });

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("NestedModel#set() 1-N dot notation on leaves", function() {
    var doc = createModel();
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

  test("NestedModel#set() 1-N square bracket notation on leaves", function() {
    var doc = createModel();
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');

    doc.set({'addresses[0].city': 'Seattle'});
    doc.set({'addresses[0].state': 'WA'});
    doc.set({'addresses[1].city': 'Minneapolis'});
    doc.set({'addresses[1].state': 'MN'});

    equals(doc.get('addresses[0].city'), 'Seattle');
    equals(doc.get('addresses[0].state'), 'WA');
    equals(doc.get('addresses[1].city'), 'Minneapolis');
    equals(doc.get('addresses[1].state'), 'MN');
  });

  test("NestedModel#set() 1-N with an object", function() {
    var doc = createModel();

    doc.set({
      'addresses[0]': {
        city: 'Seattle',
        state: 'WA'
      }
    });
    doc.set({
      'addresses[1]': {
        city: 'Minneapolis',
        state: 'MN'
      }
    });

    equals(doc.get('addresses[0].city'), 'Seattle');
    equals(doc.get('addresses[0].state'), 'WA');
    equals(doc.get('addresses[1].city'), 'Minneapolis');
    equals(doc.get('addresses[1].state'), 'MN');
  });


  // Backbone.sync = window.originalSync;

});
