R.chunkAll = (function() {
  return R.curry(function(n, step, array) {
    step = R.defaultTo(n, step);

    var p = function(array, n, step) {
      if(R.isEmpty(array)) return [];
      
      return R.prepend(R.take(n, array),
                       p(R.drop(step, array), n, step));
    };

    return p(array, n, step);
  });
})();
