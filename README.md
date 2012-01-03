# Backbone-Nested

A plugin to make [Backbone.js](http://documentcloud.github.com/backbone) keep track of nested attributes.

## The Need

Suppose you have a Backbone Model with nested attributes.  Updating the nested attribute won't cause the model's `"change"` event to fire, which is confusing.

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

1. Add `backbone-nested.js` to your HTML `<head>`, after `backbone.js` is included.
```html
<script type="text/javascript" src="backbone.js"></script>
<script type="text/javascript" src="backbone-nested.js"></script>
```
2. Change your models to extend from `Backbone.NestedModel`, e.g.
```javascript
var Person = Backbone.Model.extend({
  // ...
});

// becomes

var Person = Backbone.NestedModel.extend({
  // ...
});
```
3. Change your getters and setters to not access nested attributes directly, e.g.
```javascript
user.get('name').first = 'Bob';

// becomes

user.set({'name.first': 'Bob'});
```

Best of all, `Backbone.NestedModel` is designed to be a drop-in replacement of `Backbone.Model`, so the switch can be made gradually.  See [here](https://github.com/afeld/backbone-nested/issues?labels=Parity) for any known feature-parity issues.

## Nested Attributes

`get()` and `set()` will work as before, but nested attributes should be accessed using the Backbone-Nested string syntax:

```javascript
// dot syntax
user.set({
  'name.first': 'Bob',
  'name.middle.initial': 'H'
});
user.get('name.first') // returns 'Bob'

// object syntax
user.set({
  'name': {
    first: 'Barack',
    last: 'Obama'
  }
});

// nested arrays
user.set({
  'addresses': [
    {city: 'Brooklyn', state: 'NY'},
    {city: 'Oak Park', state: 'IL'}
  ]
});
user.get('addresses[0].state') // returns 'NY'
```

## Contributing

Pull requests are more than welcome - please add tests, which can be run by opening test/index.html.
