/*global describe, it*/
var assert = require('assert');

var Backbone = require('backbone');
require('../backbone-nested');

describe("CommonJS support", function() {
    it('should attach to Backbone when require backbone-nested', function() {
        assert.ok(Backbone.NestedModel);
    });
});
