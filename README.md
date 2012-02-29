# Backbone-Nested

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

1. Download the latest version [here](https://github.com/afeld/backbone-nested/tags), and add `backbone-nested.js` to your HTML `<head>`, **after** `backbone.js` is included ([tested](http://afeld.github.com/backbone-nested/test/) against [jQuery](http://jquery.com/) v1.7.1, [Underscore](http://documentcloud.github.com/underscore/) v1.3.1 and [Backbone](http://documentcloud.github.com/backbone/) v0.9.1).

    ```html
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
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

## Warnings

Accessing a nested attribute will throw a warning in your console, because it's safer to use the getter syntax above.  To silence these warnings, add an argument of `{silent: true}` to `get()`:

```javascript
user.get('addresses[0]'); // gives a warning in your console
user.get('addresses[0]', {silent:true}); // (silent)
```

## Contributing

Pull requests are more than welcome - please add tests, which can be run by opening test/index.html.
