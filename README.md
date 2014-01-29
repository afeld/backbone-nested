# Backbone-Nested [![Build Status](https://secure.travis-ci.org/afeld/backbone-nested.png?branch=master)](http://travis-ci.org/afeld/backbone-nested)

A plugin to make [Backbone.js](http://documentcloud.github.com/backbone) keep track of nested attributes.  Download the latest version and see the changelog/history/release notes on the [Releases](https://github.com/afeld/backbone-nested/releases) page.  **Supports Backbone 0.9.x and 1.x.**

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

## Installation

### [Bower](http://bower.io/)

Recommended.

1. Install the latest version:

    ```bash
    bower install backbone backbone-nested-model jquery underscore --save
    ```

2. Add `backbone-nested.js` to your HTML `<head>`:

    ```html
    <!-- must loaded in this order -->
    <script type="text/javascript" src="/bower_components/jquery/jquery.js"></script>
    <script type="text/javascript" src="/bower_components/underscore/underscore.js"></script>
    <script type="text/javascript" src="/bower_components/backbone/backbone.js"></script>
    <script type="text/javascript" src="/bower_components/backbone-nested-model/backbone-nested.js"></script>
    ```

### Manual

Download the latest [release](https://github.com/afeld/backbone-nested/releases) and the dependencies listed above, then include with script tags in your HTML.

## Usage

1. Change your models to extend from `Backbone.NestedModel`, e.g.

    ```javascript
    var Person = Backbone.Model.extend({ ... });
    
    // becomes
    
    var Person = Backbone.NestedModel.extend({ ... });
    ```

2. Change your getters and setters to not access nested attributes directly, e.g.

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

## Contributing

Pull requests are more than welcome - please add tests, which can be run by opening test/index.html.  They can also be run from the command-line (requires [PhantomJS](http://phantomjs.org/)):

    $ npm install
    $ grunt

See also: [live tests](http://afeld.github.com/backbone-nested/test/) for latest release.
