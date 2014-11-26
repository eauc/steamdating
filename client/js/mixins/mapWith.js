_.mixin({
  mapWith: function(obj, iteratee) {
    var args = _.rest(_.rest(arguments));
    var _iteratee = _.partial.apply(null, _.cat([iteratee, _], args));
    return _.map(obj, _iteratee);
  }
});
