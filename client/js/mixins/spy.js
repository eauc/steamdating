_.mixin({
  spy: function(obj) {
    var args = _.rest(arguments);
    console.log.apply(console, _.cat(args, [obj]));
    return obj;
  }
});
