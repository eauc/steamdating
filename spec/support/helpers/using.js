'use strict';

window.using = (function() {
  RegExp.prototype.toJSON = RegExp.prototype.toString;
  function using(vals, func) {
    var keys = _.first(vals);
    _.chain(vals)
      .rest()
      .map(function(row, i) {
        return _.reduce(keys, function(mem, k, i) {
          mem[k] = row[i];
          return mem;
        }, {});
      })
      .each(function(e) { func(e, using.desc(e)); });
  }
  using.desc = function usingDesc(obj, prune_length) {
    prune_length = _.exists(prune_length) ? prune_length : 15;
    return 'with { ' + _.chain(obj)
      .map(function(v, k) {
        return k + ': ' +
          (_.isFunction(v) ? 'func()' : s.prune(JSON.stringify(v), prune_length));
      })
      .join(', ')
      .value() + ' }';
  };
  return using;
})();
