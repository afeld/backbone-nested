# Backbone-Nested [![Build Status](https://secure.travis-ci.org/afeld/backbone-nested.png?branch=master)](http://travis-ci.org/afeld/backbone-nested)

A plugin to make [Backbone.js](http://documentcloud.github.com/backbone) keep track of nested attributes.  [Download minified version](https://github.com/afeld/backbone-nested/downloads).

## The Need

Suppose you have a Backbone Model with nested attributes, perhaps to remain consistent with your document-oriented database.  Updating the nested attribute won't cause the model's `"change"` event to fire, which is confusing.

```javascript
var user = new Backbone.Model({
  name: {
    first: 'Aidan',
    last: 'Feldman'
  }
});

user.bind('change', function(){
  // this is never reached!
});

user.get('name').first = 'Bob';
user.save();
```

Wouldn't it be awesome if you could do this?

```javascript
user.bind('change:name.first', function(){ ... });
```

## Usage

1. Download the latest version [here](https://github.com/afeld/backbone-nested/tags), and add `backbone-nested.js` to your HTML `<head>`, **after** `backbone.js` is included ([tested](http://afeld.github.com/backbone-nested/test/) against [jQuery](http://jquery.com/) v1.7.2, [Underscore](http://documentcloud.github.com/underscore/) v1.3.3 and [Backbone](http://documentcloud.github.com/backbone/) v0.9.2).

    ```html
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script type="text/javascript" src="underscore.js"></script>
    <script type="text/javascript" src="backbone.js"></script>
    <script type="text/javascript" src="backbone-nested.js"></script>
    ```

2. Change your models to extend from `Backbone.NestedModel`, e.g.

    ```javascript
    var Person = Backbone.Model.extend({ ... });
    
    // becomes
    
    var Person = Backbone.NestedModel.extend({ ... });
    ```

3. Change your getters and setters to not access nested attributes directly, e.g.

    ```javascript
    user.get('name').first = 'Bob';
    
    // becomes
    
    user.set({'name.first': 'Bob'});
    ```

Best of all, `Backbone.NestedModel` is designed to be a [backwards-compatible](http://afeld.github.com/backbone-nested/test/), drop-in replacement of `Backbone.Model`, so the switch can be made painlessly.

## Nested Attributes

`get()` and `set()` will work as before, but nested attributes should be accessed using the Backbone-Nested string syntax:

### 1-1

```javascript
// dot syntax
user.set({
  'name.first': 'Bob',
  'name.middle.initial': 'H'
});
user.get('name.first') // returns 'Bob'
user.get('name.middle.initial') // returns 'H'

// object syntax
user.set({
  'name': {
    first: 'Barack',
    last: 'Obama'
  }
});
```

### 1-N

```javascript
// object syntax
user.set({
  'addresses': [
    {city: 'Brooklyn', state: 'NY'},
    {city: 'Oak Park', state: 'IL'}
  ]
});
user.get('addresses[0].state') // returns 'NY'

// square bracket syntax
user.set({
  'addresses[1].state': 'MI'
});
```

## Events

### "change"

`"change"` events can be bound to nested attributes in the same way, and changing nested attributes will fire up the chain:

```javascript
// all of these will fire when 'name.middle.initial' is set or changed
user.bind('change', function(model, newVal){ ... });
user.bind('change:name', function(model, newName){ ... });
user.bind('change:name.middle', function(model, newMiddleName){ ... });
user.bind('change:name.middle.initial', function(model, newInitial){ ... });

// all of these will fire when the first address is added or changed
user.bind('change', function(model, newVal){ ... });
user.bind('change:addresses', function(model, addrs){ ... });
user.bind('change:addresses[0]', function(model, newAddr){ ... });
user.bind('change:addresses[0].city', function(model, newCity){ ... });
```

### "add" and "remove"

Additionally, nested arrays fire `"add"` and `"remove"` events:

```javascript
user.bind('add:addresses', function(model, newAddr){ ... });
user.bind('remove:addresses', function(model, oldAddr){ ... });
```

## Special Methods

### add()

Acts like `set()`, but appends the item to the nested array.  For example:

```javascript
user.get('addresses').length; //=> 2
user.add('addresses', {
  city: 'Seattle',
  state: 'WA'
});
user.get('addresses').length; //=> 3
```

### remove()

Acts like `unset()`, but if the unset item is an element in a nested array, the array will be compacted.  For example:

```javascript
user.get('addresses').length; //=> 2
user.remove('addresses[0]');
user.get('addresses').length; //=> 1
```

## Associations

Note, this plugin does *not* handle non-embedded relations, which keeps it relatively simple.  If you support for more complex relationships between models, see [the Backbone plugin wiki page](https://github.com/jashkenas/backbone/wiki/Extensions,-Plugins,-Resources#relations).

## Changelog

#### HEAD ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.2...master?w=1))

* fix `remove()` not firing `'remove'` event when last element of array is removed (thanks @Kmandr)
* fix `clear()` and set nested attributes on `changedAttributes()` (thanks @isakb)
* `'change'` events will no longer fire if new value matches the old

#### 1.1.2 ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.1...v1.1.2?w=1))

* `changedAttributes()` should include the nested attribute paths
* remove warnings when retrieving nested objects - more of a nuisance than a convenience

#### 1.1.1 ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.0...v1.1.1?w=1))

* fixed `remove()` to not insert array back into itself
* upgraded test suite to Backbone 0.9.2

#### 1.1.0 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.3...v1.1.0?w=1))

* Backbone 0.9.1 compatibiity
* fire 'remove' event from remove()
* added add() method
* added [demo pages](https://github.com/afeld/backbone-nested/tree/master/demo)

#### 1.0.3 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.2...v1.0.3?w=1))

* fixed `toJSON()` ([p3drosola](https://github.com/afeld/backbone-nested/pull/9))

#### 1.0.2 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.1...v1.0.2?w=1))

* added option to silence `get()` warnings for non-leaf attributes

#### 1.0.1 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.0...v1.0.1?w=1))

* header and documentation fixes

#### 1.0.0

Initial release!

## Contributing

Pull requests are more than welcome - please add tests, which can be run by opening test/index.html.  They can also be run from the command-line (requires [PhantomJS](http://phantomjs.org/)):

    $ npm install
    $ grunt
