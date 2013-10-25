/*global Backbone, JSLitmus */
(function(){
  'use strict';

  var fn = function(){};

  var model1 = new Backbone.NestedModel();
  model1.on('change:x.y.z', fn);

  jslitmus.test('set x.y.z rand() with an attribute observer', function() {
    model1.set('x.y.z', Math.random());
  });

  var model2 = new Backbone.NestedModel();
  model2.on('change:x.y.z', fn);

  jslitmus.test('set x.y.z rand() and clear with an attribute observer', function() {
    model2.set('x.y.z', Math.random());
    model2.clear();
  });

  jslitmus.test('set x.y.z rand() silently and clear silently with an attribute observer', function() {
    model2.set('x.y.z', Math.random(), {silent: true});
    model2.clear({silent: true});
  });


})();
