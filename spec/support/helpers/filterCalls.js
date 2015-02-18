'use strict';

window.filterCallsByArgs = (function() {
  return function filterCallsByArgs(spy, predicate) {
    return _.filter(spy.calls.all(), function(c) {
      return predicate(c.args);
    });
  };
})();
window.findCallByArgs = (function() {
  return function findCallByArgs(spy, predicate) {
    return _.chain(spy.calls.all())
      .filter(function(c) {
        return predicate(c.args);
      })
      .first()
      .value();
  };
})();
