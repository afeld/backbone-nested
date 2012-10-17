/*global document, $, _, Backbone, sinon, module, deepEqual, test, equal, ok */
$(document).ready(function() {

  var Klass = Backbone.NestedModel.extend(),
    doc;

  module("Backbone.NestedModel", {
    setup: function(){
      // create fresh model instance
      doc = new Klass({
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
    equal(doc.get('name.first'), 'Aidan');
    equal(doc.get('name.middle.initial'), 'L');
    equal(doc.get('name.last'), 'Feldman');
  });

  test("#get() 1-N dot notation", function() {
    equal(doc.get('addresses.0.city'), 'Brooklyn');
    equal(doc.get('addresses.0.state'), 'NY');
    equal(doc.get('addresses.1.city'), 'Oak Park');
    equal(doc.get('addresses.1.state'), 'IL');
  });

  test("#get() 1-N square bracket notation", function() {
    equal(doc.get('addresses[0].city'), 'Brooklyn');
    equal(doc.get('addresses[0].state'), 'NY');
    equal(doc.get('addresses[1].city'), 'Oak Park');
    equal(doc.get('addresses[1].state'), 'IL');
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
    equal(doc.get(attrPath), 'Aidan');

    doc.set(attrPath, 'Jeremy');

    equal(doc.get(attrPath), 'Jeremy');
  });

  test("#set() 1-1 on leaves", function() {
    equal(doc.get('name.first'), 'Aidan');
    equal(doc.get('name.last'), 'Feldman');

    doc.set({'name.first': 'Jeremy'});
    doc.set({'name.last': 'Ashkenas'});

    equal(doc.get('name.first'), 'Jeremy');
    equal(doc.get('name.last'), 'Ashkenas');
  });

  test("#set() 1-1 on deeply nested object", function() {
    equal(doc.get('name.middle.initial'), 'L');

    doc.set({'name.middle.initial': 'D'});

    equal(doc.get('name.middle.initial'), 'D');
  });

  test("#set() 1-1 with object", function() {
    doc.set({
      name: {
        first: 'Jeremy',
        last: 'Ashkenas'
      }
    });

    equal(doc.get('name.first'), 'Jeremy');
    equal(doc.get('name.last'), 'Ashkenas');
  });

  test("#set() 1-1 should override existing array", function() {
    doc.set('addresses', []);
    equal(doc.get('addresses').length, 0);
  });

  test("#set() 1-1 should override existing object", function() {
    doc.set('name', {});
    ok(_.isEmpty(doc.get('name')), 'should return an empty object');
  });

  test("#set() 1-N dot notation on leaves", function() {
    equal(doc.get('addresses.0.city'), 'Brooklyn');
    equal(doc.get('addresses.0.state'), 'NY');
    equal(doc.get('addresses.1.city'), 'Oak Park');
    equal(doc.get('addresses.1.state'), 'IL');

    doc.set({'addresses.0.city': 'Seattle'});
    doc.set({'addresses.0.state': 'WA'});
    doc.set({'addresses.1.city': 'Minneapolis'});
    doc.set({'addresses.1.state': 'MN'});

    equal(doc.get('addresses.0.city'), 'Seattle');
    equal(doc.get('addresses.0.state'), 'WA');
    equal(doc.get('addresses.1.city'), 'Minneapolis');
    equal(doc.get('addresses.1.state'), 'MN');
  });

  test("#set() 1-N square bracket notation on leaves", function() {
    equal(doc.get('addresses[0].city'), 'Brooklyn');
    equal(doc.get('addresses[0].state'), 'NY');
    equal(doc.get('addresses[1].city'), 'Oak Park');
    equal(doc.get('addresses[1].state'), 'IL');

    doc.set({'addresses[0].city': 'Manhattan'});
    doc.set({'addresses[1].city': 'Chicago'});

    equal(doc.get('addresses[0].city'), 'Manhattan');
    equal(doc.get('addresses[0].state'), 'NY');
    equal(doc.get('addresses[1].city'), 'Chicago');
    equal(doc.get('addresses[1].state'), 'IL');
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

    equal(doc.get('addresses[0].city'), 'Seattle');
    equal(doc.get('addresses[0].state'), 'WA');
    equal(doc.get('addresses[1].city'), 'Minneapolis');
    equal(doc.get('addresses[1].state'), 'MN');
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
    var change = sinon.spy();
    var changeGender = sinon.spy();

    doc.bind('change', change);
    doc.bind('change:gender', changeGender);

    doc.set({'gender': 'F'});

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeGender);
  });

  test("change event should fire after attribute is set", function() {
    var callback = function(model){
      equal(model.get('name.first'), 'Bob');
    };

    var change = sinon.spy(callback),
      changeName = sinon.spy(callback),
      changeFirstName = sinon.spy(callback);

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeFirstName);

    doc.set('name.first', 'Bob');

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeFirstName);
  });

  test("change event on nested attribute", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();
    var changeNameLast = sinon.spy();
    var changeGender = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);

    doc.bind('change:name.last', changeNameLast);
    doc.bind('change:gender', changeGender);

    doc.set({'name.first': 'Bob'});

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeNameFirst);

    sinon.assert.notCalled(changeNameLast);
    sinon.assert.notCalled(changeGender);
  });

  test("change event doesn't fire on silent", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);

    doc.set({'name.first': 'Bob'}, {silent: true});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameFirst);
  });

  test("change event doesn't fire if new value matches old value", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();

    equal(doc.get('name.first'), 'Aidan');

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);

    doc.set({'name.first': 'Aidan'});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameFirst);
  });

  test("change event doesn't fire if new value matches old value with objects", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameMiddle = sinon.spy();
    var changeNameMiddleInitial = sinon.spy();

    equal(doc.get('name.middle.initial'), 'L');
    equal(doc.get('name.middle.full'), 'Lee');

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.middle', changeNameMiddle);
    doc.bind('change:name.middle.initial', changeNameMiddleInitial);

    doc.set({'name.middle': {
      initial: 'L',
      full: 'Lee'
    }});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameMiddle);
    sinon.assert.notCalled(changeNameMiddleInitial);
  });

  test("change event doesn't fire if validation fails on top level attribute", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();

    doc.validate = function(attributes) {
      if (attributes.gender.length > 1) {
        return "Gender should be 'M' or 'F'";
      }
    };

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);

    doc.set({'gender': 'Unknown'});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameFirst);
  });

  test("change event doesn't fire if validation fails on deeply nested attribute", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameMiddle = sinon.spy();
    var changeNameMiddleInitial = sinon.spy();

    doc.validate = function(attributes) {
      if (attributes.name.middle.initial.length > 1) {
        return "Middle initial is too long";
      }
    };

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.middle', changeNameMiddle);
    doc.bind('change:name.middle.initial', changeNameMiddleInitial);

    doc.set({'name.middle': {
      initial: 'ThisIsTooLong',
      full: 'Lee'
    }});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameMiddle);
    sinon.assert.notCalled(changeNameMiddleInitial);
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
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameMiddle = sinon.spy();
    var changeNameMiddleFull = sinon.spy();
    var changeNameMiddleInitial = sinon.spy();
    var changeNameFirst = sinon.spy();

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.middle', changeNameMiddle);
    doc.bind('change:name.middle.full', changeNameMiddleFull);

    doc.bind('change:name.middle.initial', changeNameMiddleInitial);
    doc.bind('change:name.first', changeNameFirst);

    doc.set({'name.middle.full': 'Leonard'});

    // Confirm all triggers fire once that should
    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeNameMiddle);
    sinon.assert.calledOnce(changeNameMiddleFull);

    // Confirm other triggers do not fire
    sinon.assert.notCalled(changeNameMiddleInitial);
    sinon.assert.notCalled(changeNameFirst);

  });

  test("change event on deeply nested attribute with object", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameMiddle = sinon.spy();
    var changeNameMiddleInitial = sinon.spy();
    var changeNameMiddleFull = sinon.spy();
    var changeNameFirst = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.middle', changeNameMiddle);
    doc.bind('change:name.middle.initial', changeNameMiddleInitial);
    doc.bind('change:name.middle.full', changeNameMiddleFull);

    doc.bind('change:name.first', changeNameFirst);

    doc.set({'name.middle': {
      initial: 'F',
      full: 'Frankenfurter'
    }});

    // Confirm all triggers fire once that should
    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeNameMiddle);
    sinon.assert.calledOnce(changeNameMiddleInitial);
    sinon.assert.calledOnce(changeNameMiddleFull);

    // Confirm other triggers do not fire
    sinon.assert.notCalled(changeNameFirst);
  });

  test("change event on nested array", function() {
    var change = sinon.spy();
    var changeAddresses = sinon.spy();
    var changeAddresses0 = sinon.spy();
    var changeAddresses0City = sinon.spy();
    var changeAddresses0State = sinon.spy();
    var changeAddresses1 = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:addresses', changeAddresses);
    doc.bind('change:addresses[0]', changeAddresses0);
    doc.bind('change:addresses[0].city', changeAddresses0City);
    
    doc.bind('change:addresses[0].state', changeAddresses0State);
    doc.bind('change:addresses[1]', changeAddresses1);

    doc.set({'addresses[0].city': 'New York'});

    // Confirm all triggers fire once that should
    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeAddresses);
    sinon.assert.calledOnce(changeAddresses0);
    sinon.assert.calledOnce(changeAddresses0City);

    // Confirm other triggers do not fire
    sinon.assert.notCalled(changeAddresses0State);
    sinon.assert.notCalled(changeAddresses1);

  });

  test("change+add when adding to array", function() {
    var change = sinon.spy();
    var changeAddresses = sinon.spy();
    var addAddresses = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:addresses', changeAddresses);
    doc.bind('add:addresses', addAddresses);

    doc.set({
      'addresses[2]': {
        city: 'Seattle',
        state: 'WA'
      }
    });

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeAddresses);
    sinon.assert.calledOnce(addAddresses);

  });

  test("change+remove when unsetting on array", function() {
    var change = sinon.spy();
    var changeAddresses = sinon.spy();
    var removeAddresses = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:addresses', changeAddresses);
    doc.bind('remove:addresses', removeAddresses);

    doc.unset('addresses[1]');

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeAddresses);
    sinon.assert.calledOnce(removeAddresses);
  });

  test("change+remove when removing from array", function() {
    var change = sinon.spy();
    var changeAddresses = sinon.spy();
    var removeAddresses = sinon.spy();
    
    doc.bind('change', change);
    doc.bind('change:addresses', changeAddresses);
    doc.bind('remove:addresses', removeAddresses);

    doc.remove('addresses[1]');

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeAddresses);
    sinon.assert.calledOnce(removeAddresses);
  });

  test("change+remove when removing from deep array", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameMiddle = sinon.spy();
    var changeNameMiddleFullAlternates = sinon.spy();
    var removeNameMiddleFullAlternates = sinon.spy();

    doc.set('name.middle', {
      initial: 'L',
      full: 'Limburger',
      fullAlternates: ['Danger', 'Funny', 'Responsible']
    });
    
    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.middle', changeNameMiddle);
    doc.bind('change:name.middle.fullAlternates', changeNameMiddleFullAlternates);
    doc.bind('remove:name.middle.fullAlternates', removeNameMiddleFullAlternates);

    doc.remove('name.middle.fullAlternates[1]');

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeNameMiddle);
    sinon.assert.calledOnce(changeNameMiddleFullAlternates);
    sinon.assert.calledOnce(removeNameMiddleFullAlternates);
  });

  test("#set() options passed through to #trigger()", function() {
    var callback = function(model, newVal, options){
      ok(options)
      deepEqual(options.meta, {
        user: 'Matt',
        time: '14:58'
      });
    };

    doc.bind('change:gender', callback);

    doc.set('gender', 'F', {meta: {user: 'Matt', time: '14:58'}});
  });

  test("#set() options passed through to #trigger() when setting a nested attribute", function() {
    var callback = function(model, newVal, options){
      ok(options);
      deepEqual(options.meta, {
        user: 'Scott',
        time: '15:04'
      });
    };

    doc.bind('change:name.first', callback);

    doc.set('name.first', 'Dan', {meta: {user: 'Scott', time: '15:04'}});
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

  test("#changedAttributes() should return the attributes for the full path and all sub-paths for conventional set", function() {
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
    
    //Set using conventional JSON - emulates a model fetch
    doc.set({
      gender: 'M',
      name: {
        first: 'Aidan',
        middle: {
          initial: 'L',
          full: 'Limburger'
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

  test("#changedAttributes() should clear the nested attributes between change events with validation", function() {
    doc.validate = function(attributes) {
      if (attributes.name.first.length > 15) {
        return "First name is too long";
      }
    };
  
    doc.set({'name.first': 'TooLongFirstName'});

    doc.bind('change', function(){
      deepEqual(this.changedAttributes(), {
        name: {
          first: 'Aidan',
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

  // ----- CLEAR --------

  test("#clear()", function() {
    doc.clear();
    deepEqual(doc.attributes, {}, 'it should clear all attributes');
  });

  test("#clear() triggers change events", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();
    var changeNameLast = sinon.spy();

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);
    doc.bind('change:name.last', changeNameLast);

    doc.clear();

    sinon.assert.calledOnce(change);
    sinon.assert.calledOnce(changeName);
    sinon.assert.calledOnce(changeNameFirst);
    sinon.assert.calledOnce(changeNameLast);
  });

  test("#clear() sets correct .changedAttributes", function() {
    doc.bind('change', function(){
      deepEqual(this.changedAttributes(), {
        'addresses': null,
        'addresses[0]': null,
        'addresses[0].city': null,
        'addresses[0].state': null,
        'addresses[1]': null,
        'addresses[1].city': null,
        'addresses[1].state': null,
        'gender': null,
        'name': null,
        'name.first': null,
        'name.last': null,
        'name.middle': null,
        'name.middle.full': null,
        'name.middle.initial': null
      });
    });
    doc.clear();
  });

  test("#clear() silent triggers no change events", function() {
    var change = sinon.spy();
    var changeName = sinon.spy();
    var changeNameFirst = sinon.spy();

    doc.bind('change', change);
    doc.bind('change:name', changeName);
    doc.bind('change:name.first', changeNameFirst);

    doc.clear({silent: true});

    sinon.assert.notCalled(change);
    sinon.assert.notCalled(changeName);
    sinon.assert.notCalled(changeNameFirst);
  });


  // ----- UNSET --------

  test("#unset() top-level attribute", function() {
    doc.unset('name');
    equal(doc.get('name'), undefined);
    equal(doc.get('gender'), 'M', "it shouldn't unset other attributes");
  });

  test("#unset() nested attribute", function() {
    doc.unset('name.first');
    deepEqual(doc.get('name'), {
      middle: {
        initial: 'L',
        full: 'Lee'
      },
      last: 'Feldman'
    });
    equal(doc.get('gender'), 'M', "it shouldn't unset other attributes");
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
    var addAddresses = sinon.spy();

    doc.bind('add:addresses', addAddresses);

    doc.add('addresses', {
      city: 'Lincoln',
      state: 'NE'
    });

    sinon.assert.calledOnce(addAddresses);
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
    var model;

    model = doc.set('addresses.0.city', 'Boston');

    equal(model, doc);

    model = doc.add('addresses', {
      city: 'Lincoln',
      state: 'NE'
    });

    equal(model, doc);
  });

  test("#add() on nested array fails if validation fails", function() {
    var addAddresses = sinon.spy();

    equal(doc.get('addresses').length, 2);

    doc.bind('add:addresses', addAddresses);

    doc.validate = function(attributes) {
      for (var i = attributes.addresses.length - 1; i >= 0; i--) {
        if (attributes.addresses[i].state.length > 2) {
          return "Must use 2 letter state abbreviation";
        }
      }
    };

    var attrs = {
      city: 'Lincoln',
      state: 'Nebraska' // Longer than 2 letters, validation should fail
    };

    doc.add('addresses', attrs);

    sinon.assert.notCalled(addAddresses);
    equal(doc.get('addresses[2]'), undefined);
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
    var removeAddresses = sinon.spy();

    doc.bind('remove:addresses', removeAddresses);

    doc.remove('addresses[0]');
    
    sinon.assert.calledOnce(removeAddresses);
    equal(doc.get('addresses').length, 1);

    doc.remove('addresses[0]');

    sinon.assert.calledTwice(removeAddresses);
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
    var model;

    model = doc.set('addresses.0.city', 'Boston');

    equal(model, doc);

    model = doc.remove('addresses[0]');

    equal(model, doc);
  });

});
