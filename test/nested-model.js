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


  // ----- ATTR_PATH --------

  test(".attrPath()", function() {
    deepEqual(Backbone.NestedModel.attrPath('foo'), ['foo']);
    deepEqual(Backbone.NestedModel.attrPath('foo.bar'), ['foo', 'bar']);
    deepEqual(Backbone.NestedModel.attrPath('foo[0]'), ['foo', 0]);
    deepEqual(Backbone.NestedModel.attrPath('foo[0].bar'), ['foo', 0, 'bar']);
  });


  // ----- CREATE_ATTR_OBJ --------

  test(".createAttrObj() simple", function() {
    var result = Backbone.NestedModel.createAttrObj('foo', 'bar');
    equals(result.foo, 'bar');
  });

  test(".createAttrObj() value object", function() {
    var result = Backbone.NestedModel.createAttrObj('foo', {bar: 'baz'});
    deepEqual(result, {
      foo: {
        bar: 'baz'
      }
    });
  });

  test(".createAttrObj() nested attribute", function() {
    var result = Backbone.NestedModel.createAttrObj('foo.bar', 'baz');

    deepEqual(result, {
      foo: {
        bar: 'baz'
      }
    });
  });

  test(".createAttrObj() respects arrays", function() {
    var result = Backbone.NestedModel.createAttrObj('foo', {bar: ['baz', 'boop']});

    deepEqual(result, {
      foo: {
        bar: ['baz', 'boop']
      }
    });
  });

  test(".createAttrObj() respects array accessors", function() {
    var result = Backbone.NestedModel.createAttrObj('foo[0]', 'bar');
    deepEqual(result, {foo: ['bar']});
  });


  // ----- GET --------

  test("#get()", function() {
    var doc = createModel();
    equals(doc.get('gender'), 'M');
  });

  test("#get() 1-1 returns attributes object", function() {
    var doc = createModel(),
      name = doc.get('name');
    
    deepEqual(name, {
      first: 'Aidan',
      middle: {
        initial: 'L',
        full: 'Lee'
      },
      last: 'Feldman'
    });
  });

  test("#get() 1-1", function() {
    var doc = createModel();
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.middle.initial'), 'L');
    equals(doc.get('name.last'), 'Feldman');
  });

  test("#get() 1-N dot notation", function() {
    var doc = createModel();
    equals(doc.get('addresses.0.city'), 'Brooklyn');
    equals(doc.get('addresses.0.state'), 'NY');
    equals(doc.get('addresses.1.city'), 'Oak Park');
    equals(doc.get('addresses.1.state'), 'IL');
  });

  test("#get() 1-N square bracket notation", function() {
    var doc = createModel();
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');
  });

  test("#get() 1-N returns attributes object", function() {
    var doc = createModel();

    deepEqual(doc.get('addresses[0]'), {
      city: 'Brooklyn',
      state: 'NY'
    });

    deepEqual(doc.get('addresses[1]'), {
      city: 'Oak Park',
      state: 'IL'
    });
  });


  // ----- SET --------

  test("#set()", function() {
    var doc = createModel();
    equals(doc.get('gender'), 'M');
    doc.set({gender: 'F'});
    equals(doc.get('gender'), 'F');
  });

  test("#set() 1-1 on leaves", function() {
    var doc = createModel();
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');

    doc.set({'name.first': 'Jeremy'});
    doc.set({'name.last': 'Ashkenas'});

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("#set() 1-1 with object", function() {
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

  test("#set() 1-N dot notation on leaves", function() {
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

  test("#set() 1-N square bracket notation on leaves", function() {
    var doc = createModel();
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');

    doc.set({'addresses[0].city': 'Manhattan'});
    doc.set({'addresses[1].city': 'Chicago'});

    equals(doc.get('addresses[0].city'), 'Manhattan');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Chicago');
    equals(doc.get('addresses[1].state'), 'IL');
  });

  test("#set() 1-N with an object", function() {
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
