var test = require('tape');
var Backbone = require('backbone');
require('../backbone-nested');

test('require backbone-nested should attach to Backbone', function(t) {
    t.ok(Backbone.NestedModel);
    t.end();
});
