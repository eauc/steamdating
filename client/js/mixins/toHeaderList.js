R.toHeaderList = (function() {
  return function(obj) {
    return R.map(function(key) {
      return [key, obj[key]];
    }, R.keys(obj));
  };
})();
