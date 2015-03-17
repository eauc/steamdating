'use strict';

window.filterCallsByArgs = (function() {
  return function filterCallsByArgs(spy, predicate) {
    return R.filter(R.compose(predicate, R.prop('args')), spy.calls.all());
  };
})();

window.findCallByArgs = (function() {
  return function findCallByArgs(spy, predicate) {
    return R.pipe(
      R.filter(R.compose(predicate, R.prop('args'))),
      R.head
    )(spy.calls.all());
  };
})();
