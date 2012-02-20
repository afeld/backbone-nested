$(document).ready(function() {

  module("_.deepClone");

  test("flat objects", function(){
    var obj = {foo: 'bar'};
    notEqual(_.deepClone(obj), obj);
  });

  test("nested objects", function(){
    var obj = {
        foo: {
          bar: 'baz'
        }
      },
      result = _.deepClone(obj);

    notEqual(obj.foo, result.foo);
  });

  test("nested arrays", function(){
    var obj = {foo: ['bar', 'baz']},
      result = _.deepClone(obj);

    notEqual(result.foo, obj.foo);
  });

});
