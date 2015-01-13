'use strict';

window.when = (function() {
  return function when(desc, before, body) {
    describe('when '+desc, function() {
      beforeEach(before);
      body();
    });
  };
})();
