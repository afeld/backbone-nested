$(document).ready(function() {

  module("_.deepMerge");

  test("flat objects", function(){
    var obj = {foo: 'bar'};
    _.deepMerge(obj, {baz: 'blip'});
    deepEqual(obj, {
      foo: 'bar',
      baz: 'blip'
    });
  });

  test("nested objects", function(){
    var obj = {
      foo: {
        bar: 'baz'
      }
    };

    _.deepMerge(obj, {
      foo: {
        hi: 'there'
      }
    });

    deepEqual(obj, {
      foo: {
        bar: 'baz',
        hi: 'there'
      }
    });
  });

});
