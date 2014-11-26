_.mixin({
  apply: function(obj, interceptor) {
    var args = _.rest(_.rest(arguments));
    return interceptor.apply(null, _.cons(obj, args));
  }
});
