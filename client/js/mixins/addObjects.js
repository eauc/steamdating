R.addObjects = (function() {
  return R.curry(function(addValueFnc, base, other) {
    return R.reduce(function(mem, key) {
      if(!R.isNil(mem[key])) {
        return R.assoc(key,
                       addValueFnc(mem[key], other[key]),
                       mem);
      }
      else {
        return R.assoc(key, other[key], mem);
      }
    }, base, R.keys(other));
  });
})();
