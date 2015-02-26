_.mixin({
  toHeaderList: function(obj) {
    return _.map(obj, function(val, key) {
      return [key, val];
    });
  }
});
