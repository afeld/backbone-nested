$(document).ready(function() {

  var klass = Backbone.NestedModel.extend(),
    doc;

  module("Backbone.NestedModel", {
    setup: function(){
      // create fresh model instance
      doc = new klass({
        gender: 'M',
        name: {
          first: 'Aidan',
          middle: {
            initial: 'L',
            full: 'Lee'
          },
          last: 'Feldman'
        },
        addresses: [
          {
            city: 'Brooklyn',
            state: 'NY'
          },
          {
            city: 'Oak Park',
            state: 'IL'
          }
        ]
      });
    }
  });


  // ----- ATTR_PATH --------

  test(".attrPath()", function() {
    deepEqual(Backbone.NestedModel.attrPath(''), ['']);
    deepEqual(Backbone.NestedModel.attrPath('0'), [0]);
    deepEqual(Backbone.NestedModel.attrPath('foo'), ['foo']);
    deepEqual(Backbone.NestedModel.attrPath('foo.bar'), ['foo', 'bar']);
    deepEqual(Backbone.NestedModel.attrPath('foo[0]'), ['foo', 0]);
    deepEqual(Backbone.NestedModel.attrPath('foo[0].bar'), ['foo', 0, 'bar']);
  });


  // ----- GET --------

  test("#get() 1-1 returns attributes object", function() {
    var name = doc.get('name');
    
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
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.middle.initial'), 'L');
    equals(doc.get('name.last'), 'Feldman');
  });

  test("#get() 1-N dot notation", function() {
    equals(doc.get('addresses.0.city'), 'Brooklyn');
    equals(doc.get('addresses.0.state'), 'NY');
    equals(doc.get('addresses.1.city'), 'Oak Park');
    equals(doc.get('addresses.1.state'), 'IL');
  });

  test("#get() 1-N square bracket notation", function() {
    equals(doc.get('addresses[0].city'), 'Brooklyn');
    equals(doc.get('addresses[0].state'), 'NY');
    equals(doc.get('addresses[1].city'), 'Oak Park');
    equals(doc.get('addresses[1].state'), 'IL');
  });

  test("#get() 1-N returns attributes object", function() {
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

  test("#get() 1-1", function() {
    ok(doc.has('name.first'));
    ok(doc.has('name.middle.initial'));
    ok(doc.has('name.last'));
    ok(!doc.has('name.foo'));
  });

  test("#get() 1-N dot notation", function() {
    ok(doc.has('addresses.0'));
    ok(doc.has('addresses.0.city'));
    ok(doc.has('addresses.0.state'));
    ok(doc.has('addresses.1'));
    ok(doc.has('addresses.1.city'));
    ok(doc.has('addresses.1.state'));
    ok(!doc.has('addresses.2'));
  });

  test("#get() 1-N square bracket notation", function() {
    ok(doc.has('addresses[0]'));
    ok(doc.has('addresses[0].city'));
    ok(doc.has('addresses[0].state'));
    ok(doc.has('addresses[1]'));
    ok(doc.has('addresses[1].city'));
    ok(doc.has('addresses[1].state'));
    ok(!doc.has('addresses[2]'));
  });


  // ----- SET --------

  test("#set() should accept an attribute path array", function() {
    var attrPath = Backbone.NestedModel.attrPath('name.first');
    equals(doc.get(attrPath), 'Aidan');

    doc.set(attrPath, 'Jeremy');

    equals(doc.get(attrPath), 'Jeremy');
  });

  test("#set() 1-1 on leaves", function() {
    equals(doc.get('name.first'), 'Aidan');
    equals(doc.get('name.last'), 'Feldman');

    doc.set({'name.first': 'Jeremy'});
    doc.set({'name.last': 'Ashkenas'});

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("#set() 1-1 with object", function() {
    doc.set({
      name: {
        first: 'Jeremy',
        last: 'Ashkenas'
      }
    });

    equals(doc.get('name.first'), 'Jeremy');
    equals(doc.get('name.last'), 'Ashkenas');
  });

  test("#set() 1-1 should override existing array", function() {
    doc.set('addresses', []);
    equals(doc.get('addresses').length, 0);
  });

  test("#set() 1-1 should override existing object", function() {
    doc.set('name', {});
    ok(_.isEmpty(doc.get('name')), 'should return an empty object');
  });

  test("#set() 1-N dot notation on leaves", function() {
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

  test("#set() 1-N with an object containing an array", function() {
    doc.set('addresses[0]', {
      city: 'Seattle',
      state: 'WA',
      areaCodes: ['001', '002', '003']
    });
    doc.set('addresses[1]', {
      city: 'Minneapolis',
      state: 'MN',
      areaCodes: ['101', '102', '103']
    });

    deepEqual(doc.get('addresses[0].areaCodes'), ['001', '002', '003']);
    deepEqual(doc.get('addresses[1].areaCodes'), ['101', '102', '103']);
  });

  test("#set() 1-N with an object containing an array where array values are being removed", function() {
    doc.set('addresses[0]', {
      city: 'Seattle',
      state: 'WA',
      areaCodes: ['001', '002', '003']
    });
    doc.set('addresses[0]', {
      city: 'Minneapolis',
      state: 'MN',
      areaCodes: ['101', '102']
    });

    deepEqual(doc.get('addresses[0].areaCodes'), ['101', '102']);
  });

  test("#set() 1-N with an object containing an array where array has been cleared", function() {
    doc.set('addresses[0]', {
      city: 'Seattle',
      state: 'WA',
      areaCodes: ['001', '002', '003']
    });
    doc.set('addresses[0]', {
      city: 'Minneapolis',
      state: 'MN',
      areaCodes: []
    });

    deepEqual(doc.get('addresses[0].areaCodes'), []);
  });


  // ----- TO_JSON --------

  test("#toJSON()", function() {
    var json = doc.toJSON();
    deepEqual(json, doc.attributes);
  });


  // ----- CHANGE EVENTS --------

  test("change event on top-level attribute", function() {
    doc.bind('change', function(){ ok(true); });
    doc.bind('change:gender', function(){ ok(true); });

    expect(2);
    doc.set({'gender': 'F'});
  });

  test("change event on nested attribute", function() {
    var callbacksFired = [0, 0, 0];
    
    doc.bind('change', function(){ callbacksFired[0] += 1; });
    doc.bind('change:name', function(){ callbacksFired[1] += 1; });
    doc.bind('change:name.first', function(){ callbacksFired[2] += 1; });

    doc.bind('change:name.last', function(){ ok(false, "'change:name.last' should not fire"); });
    doc.bind('change:gender', function(){ ok(false, "'change:gender' should not fire"); });

    doc.set({'name.first': 'Bob'});

    equal(callbacksFired[0], 1, "'change' should fire once");
    equal(callbacksFired[1], 1, "'change:name' should fire once");
    equal(callbacksFired[2], 1, "'change:name.first' should fire once");
  });

  test("change event doesn't fire on silent", function() {
    doc.bind('change', function(){ ok(false, "'change' should not fire"); });
    doc.bind('change:name', function(){ ok(false, "'change:name' should not fire"); });
    doc.bind('change:name.first', function(){ ok(false, "'change:name.first' should not fire"); });

    doc.set({'name.first': 'Bob'}, {silent: true});
  });

  test("attribute change event receives new value", function() {
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
    var callbacksFired = [false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true; });
    doc.bind('change:name', function(){ callbacksFired[1] = true; });
    doc.bind('change:name.middle', function(){ callbacksFired[2] = true; });
    doc.bind('change:name.middle.full', function(){ callbacksFired[3] = true; });

    doc.bind('change:name.middle.initial', function(){ ok(false, "'change:name.middle.initial' should not fire"); });
    doc.bind('change:name.first', function(){ ok(false, "'change:name.first' should not fire"); });

    doc.set({'name.middle.full': 'Leonard'});

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:name' should fire");
    ok(callbacksFired[2], "'change:name.middle' should fire");
    ok(callbacksFired[3], "'change:name.middle.full' should fire");
  });

  test("change event on deeply nested attribute with object", function() {
    var callbacksFired = [false, false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true; });
    doc.bind('change:name', function(){ callbacksFired[1] = true; });
    doc.bind('change:name.middle', function(){ callbacksFired[2] = true; });
    doc.bind('change:name.middle.initial', function(){ callbacksFired[3] = true; });
    doc.bind('change:name.middle.full', function(){ callbacksFired[4] = true; });

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
    var callbacksFired = [false, false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true; });
    doc.bind('change:addresses', function(){ callbacksFired[1] = true; });
    doc.bind('change:addresses[0]', function(){ callbacksFired[2] = true; });
    doc.bind('change:addresses[0].city', function(){ callbacksFired[3] = true; });
    
    doc.bind('change:addresses[0].state', function(){ ok(false, "'change:addresses[0].state' should not fire"); });
    doc.bind('change:addresses[1]', function(){ ok(false, "'change:addresses[1]' should not fire"); });

    doc.set({'addresses[0].city': 'New York'});

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:addresses' should fire");
    ok(callbacksFired[2], "'change:addresses[0]' should fire");
    ok(callbacksFired[3], "'change:addresses[0].city' should fire");
  });

  test("change+add when adding to array", function() {
    var callbacksFired = [false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true; });
    doc.bind('change:addresses', function(){ callbacksFired[1] = true; });
    doc.bind('add:addresses', function(){ callbacksFired[2] = true; });

    doc.set({
      'addresses[2]': {
        city: 'Seattle',
        state: 'WA'
      }
    });

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:addresses' should fire");
    ok(callbacksFired[2], "'add:addresses' should fire");
  });

  test("change+remove when unsetting on array", function() {
    var callbacksFired = [false, false, false];
    
    doc.bind('change', function(){ callbacksFired[0] = true; });
    doc.bind('change:addresses', function(){ callbacksFired[1] = true; });
    doc.bind('remove:addresses', function(){ callbacksFired[2] = true; });

    doc.unset('addresses[1]');

    ok(callbacksFired[0], "'change' should fire");
    ok(callbacksFired[1], "'change:addresses' should fire");
    ok(callbacksFired[2], "'remove:addresses' should fire");
  });


  // ----- CHANGED_ATTRIBUTES --------

  test("#changedAttributes() should return the attributes for the full path and all sub-paths", function() {
    doc.bind('change', function(){
      deepEqual(this.changedAttributes(), {
        name: {
          first: 'Aidan',
          middle: {
            initial: 'L',
            full: 'Limburger'
          },
          last: 'Feldman'
        },
        'name.middle': {
          initial: 'L',
          full: 'Limburger'
        },
        'name.middle.full': 'Limburger'
      });
    });
    
    doc.set({'name.middle.full': 'Limburger'});
  });

  test("#changedAttributes() should clear the nested attributes between change events", function() {
    doc.set({'name.first': 'Bob'});

    doc.bind('change', function(){
      deepEqual(this.changedAttributes(), {
        name: {
          first: 'Bob',
          middle: {
            initial: 'L',
            full: 'Lee'
          },
          last: 'Dylan'
        },
        'name.last': 'Dylan'
      });
    });

    doc.set({'name.last': 'Dylan'});
  });


  // ----- UNSET --------

  test("#unset() nested attribute", function() {
    doc.unset('name.first');
    ok(_.isUndefined(doc.get('name.first')));
  });


  // ----- ADD --------

  test("#add() on nested array succeeds", function() {
    var attrs = {
      city: 'Lincoln',
      state: 'NE'
    };

    doc.add('addresses', attrs);

    deepEqual(doc.get('addresses[2]'), attrs);
  });

  test("#add() should complain if existing value isn't an array", function() {
    var errorThrown = false;

    try {
      doc.add('name', 'foo');
    } catch (e) {
      errorThrown = true;
    }

    ok(errorThrown, "error should have been thrown");
  });

  test("#add() on nested array should trigger 'add' event", function() {
    var callbackFired = false;

    doc.bind('add:addresses', function(){
      callbackFired = true;
    });
    doc.add('addresses', {
      city: 'Lincoln',
      state: 'NE'
    });

    ok(callbackFired, "callback wasn't fired");
  });

  test("#add() on nested array should trigger 'add' event after model is updated", function() {
    var callbackFired = false;
    var initialLength = doc.get('addresses').length;
    var newLength;

    doc.bind('add:addresses', function(model, newAddr){
      newLength = doc.get('addresses').length;
      callbackFired = true;
    });
    doc.add('addresses', {
      city: 'Lincoln',
      state: 'NE'
    });

    ok(callbackFired, "callback wasn't fired");
    equal(newLength, initialLength + 1, "array length should be incremented prior to 'add' event firing");
  });

  test("#add() should return the model to mimic set() functionality", function() {
    var callbackFired = false;
    var model;

    model = doc.set('addresses.0.city', 'Boston');

    equal(model, doc);

    model = doc.add('addresses', {
      city: 'Lincoln',
      state: 'NE'
    });

    equal(model, doc);
  });


  // ----- REMOVE --------

  test("#remove() on nested array should remove the element from the array", function() {
    var addr0 = doc.get('addresses[0]'),
      addr1 = doc.get('addresses[1]');

    doc.remove('addresses[0]');

    equal(doc.get('addresses').length, 1);
    deepEqual(doc.get('addresses[0]'), addr1);
  });

  test("#remove() on nested array should trigger 'remove' event", function() {
    var callbackFired = 0;

    doc.bind('remove:addresses', function(){
      callbackFired++;
    });

    doc.remove('addresses[0]');
    equal(callbackFired, 1, "callback should have fired once");
    equal(doc.get('addresses').length, 1);

    doc.remove('addresses[0]');
    equal(callbackFired, 2, "callback should have fired twice");
    equal(doc.get('addresses').length, 0);
  });

  test("#remove() on nested array should trigger 'remove' event after model is updated", function() {
    var callbackFired = 0;
    var initialLength = doc.get('addresses').length;
    var newLength;

    doc.bind('remove:addresses', function(){
      newLength = doc.get('addresses').length;
      callbackFired++;
    });

    doc.remove('addresses[0]');
    equal(callbackFired, 1, "callback should have fired once");
    equal(newLength, initialLength - 1, "array length should be decremented prior to 'remove' event firing");

    doc.remove('addresses[0]');
    equal(callbackFired, 2, "callback should have fired twice");
    equal(newLength, initialLength - 2, "array length should be decremented prior to 'remove' event firing");
  });

  test("#remove() on non-array should raise error", function() {
    var errorRaised = false;

    try {
      doc.remove('missingthings[0]');
    } catch(e){
      errorRaised = true;
    }

    ok(errorRaised, "error wasn't raised");
  });

  test("#remove() should return the model to mimic set() functionality", function() {
    var callbackFired = false;
    var model;

    model = doc.set('addresses.0.city', 'Boston');

    equal(model, doc);

    model = doc.remove('addresses[0]');

    equal(model, doc);
  });

});
