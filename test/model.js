// yanked from Backbone 0.5.2 test suite
$(document).ready(function() {

  module("Backbone.Model");

  // Variable to catch the last request.
  window.lastRequest = null;

  window.originalSync = Backbone.sync;

  // Stub out Backbone.request...
  Backbone.sync = function() {
    lastRequest = _.toArray(arguments);
  };

  var attrs = {
    id     : '1-the-tempest',
    title  : "The Tempest",
    author : "Bill Shakespeare",
    length : 123
  };

  var proxy = Backbone.NestedModel.extend();
  var doc = new proxy(attrs);

  var klass = Backbone.Collection.extend({
    url : function() { return '/collection'; }
  });

  var collection = new klass();
  collection.add(doc);

  test("NestedModel: initialize", function() {
    var NestedModel = Backbone.NestedModel.extend({
      initialize: function() {
        this.one = 1;
        equals(this.collection, collection);
      }
    });
    var model = new NestedModel({}, {collection: collection});
    equals(model.one, 1);
    equals(model.collection, collection);
  });

  test("NestedModel: initialize with attributes and options", function() {
    var NestedModel = Backbone.NestedModel.extend({
      initialize: function(attributes, options) {
        this.one = options.one;
      }
    });
    var model = new NestedModel({}, {one: 1});
    equals(model.one, 1);
  });

  test("NestedModel: url", function() {
    equals(doc.url(), '/collection/1-the-tempest');
    doc.collection.url = '/collection/';
    equals(doc.url(), '/collection/1-the-tempest');
    doc.collection = null;
    var failed = false;
    try {
      doc.url();
    } catch (e) {
      failed = true;
    }
    equals(failed, true);
    doc.collection = collection;
  });

  test("NestedModel: url when using urlRoot, and uri encoding", function() {
    var NestedModel = Backbone.NestedModel.extend({
      urlRoot: '/collection'
    });
    var model = new NestedModel();
    equals(model.url(), '/collection');
    model.set({id: '+1+'});
    equals(model.url(), '/collection/%2B1%2B');
  });

  test("NestedModel: clone", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.NestedModel(attrs);
    b = a.clone();
    equals(a.get('foo'), 1);
    equals(a.get('bar'), 2);
    equals(a.get('baz'), 3);
    equals(b.get('foo'), a.get('foo'), "Foo should be the same on the clone.");
    equals(b.get('bar'), a.get('bar'), "Bar should be the same on the clone.");
    equals(b.get('baz'), a.get('baz'), "Baz should be the same on the clone.");
    a.set({foo : 100});
    equals(a.get('foo'), 100);
    equals(b.get('foo'), 1, "Changing a parent attribute does not change the clone.");
  });

  test("NestedModel: isNew", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.NestedModel(attrs);
    ok(a.isNew(), "it should be new");
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3, 'id': -5 };
    a = new Backbone.NestedModel(attrs);
    ok(!a.isNew(), "any defined ID is legal, negative or positive");
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3, 'id': 0 };
    a = new Backbone.NestedModel(attrs);
    ok(!a.isNew(), "any defined ID is legal, including zero");
    ok( new Backbone.NestedModel({          }).isNew(), "is true when there is no id");
    ok(!new Backbone.NestedModel({ 'id': 2  }).isNew(), "is false for a positive integer");
    ok(!new Backbone.NestedModel({ 'id': -5 }).isNew(), "is false for a negative integer");
  });

  test("NestedModel: get", function() {
    equals(doc.get('title'), 'The Tempest');
    equals(doc.get('author'), 'Bill Shakespeare');
  });

  test("NestedModel: escape", function() {
    equals(doc.escape('title'), 'The Tempest');
    doc.set({audience: 'Bill & Bob'});
    equals(doc.escape('audience'), 'Bill &amp; Bob');
    doc.set({audience: 'Tim > Joan'});
    equals(doc.escape('audience'), 'Tim &gt; Joan');
    doc.set({audience: 10101});
    equals(doc.escape('audience'), '10101');
    doc.unset('audience');
    equals(doc.escape('audience'), '');
  });

  test("NestedModel: has", function() {
    attrs = {};
    a = new Backbone.NestedModel(attrs);
    equals(a.has("name"), false);
    _([true, "Truth!", 1, false, '', 0]).each(function(value) {
      a.set({'name': value});
      equals(a.has("name"), true);
    });
    a.unset('name');
    equals(a.has('name'), false);
    _([null, undefined]).each(function(value) {
      a.set({'name': value});
      equals(a.has("name"), false);
    });
  });

  test("NestedModel: set and unset", function() {
    attrs = {id: 'id', foo: 1, bar: 2, baz: 3};
    a = new Backbone.NestedModel(attrs);
    var changeCount = 0;
    a.bind("change:foo", function() { changeCount += 1; });
    a.set({'foo': 2});
    ok(a.get('foo')== 2, "Foo should have changed.");
    ok(changeCount == 1, "Change count should have incremented.");
    a.set({'foo': 2}); // set with value that is not new shouldn't fire change event
    ok(a.get('foo')== 2, "Foo should NOT have changed, still 2");
    ok(changeCount == 1, "Change count should NOT have incremented.");

    a.unset('foo');
    ok(a.get('foo')== null, "Foo should have changed");
    ok(changeCount == 2, "Change count should have incremented for unset.");

    a.unset('id');
    equals(a.id, undefined, "Unsetting the id should remove the id property.");
  });

  test("NestedModel: multiple unsets", function() {
    var i = 0;
    var counter = function(){ i++; };
    var model = new Backbone.NestedModel({a: 1});
    model.bind("change:a", counter);
    model.set({a: 2});
    model.unset('a');
    model.unset('a');
    equals(i, 2, 'Unset does not fire an event for missing attributes.');
  });

  test("NestedModel: using a non-default id attribute.", function() {
    var MongoNestedModel = Backbone.NestedModel.extend({idAttribute : '_id'});
    var model = new MongoNestedModel({id: 'eye-dee', _id: 25, title: 'NestedModel'});
    equals(model.get('id'), 'eye-dee');
    equals(model.id, 25);
    equals(model.isNew(), false);
    model.unset('_id');
    equals(model.id, undefined);
    equals(model.isNew(), true);
  });

  test("NestedModel: set an empty string", function() {
    var model = new Backbone.NestedModel({name : "NestedModel"});
    model.set({name : ''});
    equals(model.get('name'), '');
  });

  test("NestedModel: clear", function() {
    var changed;
    var model = new Backbone.NestedModel({name : "NestedModel"});
    model.bind("change:name", function(){ changed = true; });
    model.clear();
    equals(changed, true);
    equals(model.get('name'), undefined);
  });

  test("NestedModel: defaults", function() {
    var Defaulted = Backbone.NestedModel.extend({
      defaults: {
        "one": 1,
        "two": 2
      }
    });
    var model = new Defaulted({two: null});
    equals(model.get('one'), 1);
    equals(model.get('two'), null);
    Defaulted = Backbone.NestedModel.extend({
      defaults: function() {
        return {
          "one": 3,
          "two": 4
        };
      }
    });
    var model = new Defaulted({two: null});
    equals(model.get('one'), 3);
    equals(model.get('two'), null);
  });

  test("NestedModel: change, hasChanged, changedAttributes, previous, previousAttributes", function() {
    var model = new Backbone.NestedModel({name : "Tim", age : 10});
    equals(model.changedAttributes(), false);
    model.bind('change', function() {
      ok(model.hasChanged('name'), 'name changed');
      ok(!model.hasChanged('age'), 'age did not');
      ok(_.isEqual(model.changedAttributes(), {name : 'Rob'}), 'changedAttributes returns the changed attrs');
      equals(model.previous('name'), 'Tim');
      ok(_.isEqual(model.previousAttributes(), {name : "Tim", age : 10}), 'previousAttributes is correct');
    });
    model.set({name : 'Rob'}, {silent : true});
    equals(model.hasChanged(), true);
    equals(model.hasChanged('name'), true);
    model.change();
    equals(model.get('name'), 'Rob');
  });

  test("NestedModel: change with options", function() {
    var value;
    var model = new Backbone.NestedModel({name: 'Rob'});
    model.bind('change', function(model, options) {
      value = options.prefix + model.get('name');
    });
    model.set({name: 'Bob'}, {silent: true});
    model.change({prefix: 'Mr. '});
    equals(value, 'Mr. Bob');
    model.set({name: 'Sue'}, {prefix: 'Ms. '});
    equals(value, 'Ms. Sue');
  });

  test("NestedModel: change after initialize", function () {
    var changed = 0;
    var attrs = {id: 1, label: 'c'};
    var obj = new Backbone.NestedModel(attrs);
    obj.bind('change', function() { changed += 1; });
    obj.set(attrs);
    equals(changed, 0);
  });

  test("NestedModel: save within change event", function () {
    var model = new Backbone.NestedModel({firstName : "Taylor", lastName: "Swift"});
    model.bind('change', function () {
      model.save();
      ok(_.isEqual(lastRequest[1], model));
    });
    model.set({lastName: 'Hicks'});
  });

  test("NestedModel: save", function() {
    doc.save({title : "Henry V"});
    equals(lastRequest[0], 'update');
    ok(_.isEqual(lastRequest[1], doc));
  });

  test("NestedModel: fetch", function() {
    doc.fetch();
    ok(lastRequest[0], 'read');
    ok(_.isEqual(lastRequest[1], doc));
  });

  test("NestedModel: destroy", function() {
    doc.destroy();
    equals(lastRequest[0], 'delete');
    ok(_.isEqual(lastRequest[1], doc));
  });

  test("NestedModel: non-persisted destroy", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.NestedModel(attrs);
    a.sync = function() { throw "should not be called"; };
    ok(a.destroy(), "non-persisted model should not call sync");
  });

  test("NestedModel: validate", function() {
    var lastError;
    var model = new Backbone.NestedModel();
    model.validate = function(attrs) {
      if (attrs.admin) return "Can't change admin status.";
    };
    model.bind('error', function(model, error) {
      lastError = error;
    });
    var result = model.set({a: 100});
    equals(result, model);
    equals(model.get('a'), 100);
    equals(lastError, undefined);
    result = model.set({admin: true}, {silent: true});
    equals(lastError, undefined);
    equals(model.get('admin'), true);
    result = model.set({a: 200, admin: true});
    equals(result, false);
    equals(model.get('a'), 100);
    equals(lastError, "Can't change admin status.");
  });

  test("NestedModel: validate on unset and clear", function() {
    var error;
    var model = new Backbone.NestedModel({name: "One"});
    model.validate = function(attrs) {
      if ("name" in attrs) {
        if (!attrs.name) {
          error = true;
          return "No thanks.";
        }
      }
    };
    model.set({name: "Two"});
    equals(model.get('name'), 'Two');
    equals(error, undefined);
    model.unset('name');
    equals(error, true);
    equals(model.get('name'), 'Two');
    model.clear();
    equals(model.get('name'), 'Two');
    delete model.validate;
    model.clear();
    equals(model.get('name'), undefined);
  });

  test("NestedModel: validate with error callback", function() {
    var lastError, boundError;
    var model = new Backbone.NestedModel();
    model.validate = function(attrs) {
      if (attrs.admin) return "Can't change admin status.";
    };
    var callback = function(model, error) {
      lastError = error;
    };
    model.bind('error', function(model, error) {
      boundError = true;
    });
    var result = model.set({a: 100}, {error: callback});
    equals(result, model);
    equals(model.get('a'), 100);
    equals(lastError, undefined);
    equals(boundError, undefined);
    result = model.set({a: 200, admin: true}, {error: callback});
    equals(result, false);
    equals(model.get('a'), 100);
    equals(lastError, "Can't change admin status.");
    equals(boundError, undefined);
  });

  test("NestedModel: defaults always extend attrs (#459)", function() {
    var Defaulted = Backbone.NestedModel.extend({
      defaults: {one: 1},
      initialize : function(attrs, opts) {
        equals(attrs.one, 1);
      }
    });
    var providedattrs = new Defaulted({});
    var emptyattrs = new Defaulted();
  });

  test("NestedModel: Inherit class properties", function() {
    var Parent = Backbone.NestedModel.extend({
      instancePropSame: function() {},
      instancePropDiff: function() {}
    }, {
      classProp: function() {}
    });
    var Child = Parent.extend({
      instancePropDiff: function() {}
    });

    var adult = new Parent;
    var kid   = new Child;

    equals(Child.classProp, Parent.classProp);
    notEqual(Child.classProp, undefined);

    equals(kid.instancePropSame, adult.instancePropSame);
    notEqual(kid.instancePropSame, undefined);

    notEqual(Child.prototype.instancePropDiff, Parent.prototype.instancePropDiff);
    notEqual(Child.prototype.instancePropDiff, undefined);
  });

  test("NestedModel: Nested change events don't clobber previous attributes", function() {
    var A = Backbone.NestedModel.extend({
      initialize: function() {
        this.bind("change:state", function(a, newState) {
          equals(a.previous('state'), undefined);
          equals(newState, 'hello');
          // Fire a nested change event.
          this.set({ other: "whatever" });
        });
      }
    });

    var B = Backbone.NestedModel.extend({
      initialize: function() {
        this.get("a").bind("change:state", function(a, newState) {
          equals(a.previous('state'), undefined);
          equals(newState, 'hello');
        });
      }
    });

    a = new A();
    b = new B({a: a});
    a.set({state: 'hello'});
  });

});
