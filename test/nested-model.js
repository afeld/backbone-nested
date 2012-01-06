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


  // ----- HAS --------

  test("#has()", function() {
    var doc = createModel();
    ok(doc.has('gender'));
    ok(!doc.has('foo'));
  });

  test("#get() 1-1", function() {
    var doc = createModel();

    ok(doc.has('name.first'));
    ok(doc.has('name.middle.initial'));
    ok(doc.has('name.last'));
    ok(!doc.has('name.foo'));
  });

  test("#get() 1-N dot notation", function() {
    var doc = createModel();
    
    ok(doc.has('addresses.0'));
    ok(doc.has('addresses.0.city'));
    ok(doc.has('addresses.0.state'));
    ok(doc.has('addresses.1'));
    ok(doc.has('addresses.1.city'));
    ok(doc.has('addresses.1.state'));
    ok(!doc.has('addresses.2'));
  });

  test("#get() 1-N square bracket notation", function() {
    var doc = createModel();

    ok(doc.has('addresses[0]'));
    ok(doc.has('addresses[0].city'));
    ok(doc.has('addresses[0].state'));
    ok(doc.has('addresses[1]'));
    ok(doc.has('addresses[1].city'));
    ok(doc.has('addresses[1].state'));
    ok(!doc.has('addresses[2]'));
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


  // ----- CHANGE EVENTS --------

  test("change event on top-level attribute", function() {
    var doc = createModel();
    doc.bind('change', function(){ ok(true); });
    doc.bind('change:gender', function(){ ok(true); });

    expect(2);
    doc.set({'gender': 'F'});
  });

  test("change event on nested attribute", function() {
    var doc = createModel(),
      callbacksFired = [0, 0, 0];
    
    doc.bind('change', function(){ callbacksFired[0] += 1 });
    doc.bind('change:name', function(){ callbacksFired[1] += 1 });
    doc.bind('change:name.first', function(){ callbacksFired[2] += 1 });

    doc.bind('change:name.last', function(){ ok(false, "'change:name.last' should not fire"); });
    doc.bind('change:gender', function(){ ok(false, "'change:gender' should not fire"); });

    doc.set({'name.first': 'Bob'});

    equal(callbacksFired[0], 1, "'change' should fire once");
    equal(callbacksFired[1], 1, "'change:name' should fire once");
    equal(callbacksFired[2], 1, "'change:name.first' should fire once");
  });

  test("attribute change event receives new value", function() {
    var doc = createModel();
    
    doc.bind('change:name', function(model, newVal){
      deepEqual(newVal, {
        'first': 'Bob',
        'middle': {
          'initial': 'L',
          'full': 'Lee'
        },
        'last': 'Feldman'
      });
    });
    doc.bind('change:name.first', function(model, newVal){
      equal(newVal, 'Bob');
    });

    doc.set({'name.first': 'Bob'});
  });

  test("change event on deeply nested attribute", function() {
    var doc = createModel(),
      callbacksFired = [false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true });
    doc.bind('change:name', function(){ callbacksFired[1] = true });
    doc.bind('change:name.middle', function(){ callbacksFired[2] = true });
    doc.bind('change:name.middle.full', function(){ callbacksFired[3] = true });

    doc.bind('change:name.middle.initial', function(){ ok(false, "'change:name.middle.initial' should not fire"); });
    doc.bind('change:name.first', function(){ ok(false, "'change:name.first' should not fire"); });

    doc.set({'name.middle.full': 'Leonard'});

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:name' should fire");
    ok(callbacksFired[2], "'change:name.middle' should fire");
    ok(callbacksFired[3], "'change:name.middle.full' should fire");
  });

  test("change event on deeply nested attribute with object", function() {
    var doc = createModel(),
      callbacksFired = [false, false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true });
    doc.bind('change:name', function(){ callbacksFired[1] = true });
    doc.bind('change:name.middle', function(){ callbacksFired[2] = true });
    doc.bind('change:name.middle.initial', function(){ callbacksFired[3] = true });
    doc.bind('change:name.middle.full', function(){ callbacksFired[4] = true });

    doc.bind('change:name.first', function(){ ok(false, "'change:name.first' should not fire"); });

    doc.set({'name.middle': {
      initial: 'F',
      full: 'Frankenfurter'
    }});

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:name' should fire");
    ok(callbacksFired[2], "'change:name.middle' should fire");
    ok(callbacksFired[3], "'change:name.middle.initial' should fire");
    ok(callbacksFired[4], "'change:name.middle.full' should fire");
  });

  test("change event on nested array", function() {
    var doc = createModel(),
      callbacksFired = [false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true });
    doc.bind('change:addresses', function(){ callbacksFired[1] = true });
    doc.bind('change:addresses[0]', function(){ callbacksFired[2] = true });
    doc.bind('change:addresses[0].city', function(){ callbacksFired[3] = true });
    
    doc.bind('change:addresses[0].state', function(){ ok(false, "'change:addresses[0].state' should not fire"); });
    doc.bind('change:addresses[1]', function(){ ok(false, "'change:addresses[1]' should not fire"); });

    doc.set({'addresses[0].city': 'New York'});

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:addresses' should fire");
    ok(callbacksFired[2], "'change:addresses[0]' should fire");
    ok(callbacksFired[3], "'change:addresses[0].city' should fire");
  });


  // Backbone.sync = window.originalSync;

});
