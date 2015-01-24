'use strict';

window.spyOnService = (function() {
  return function spyOnService(service_name) {
    var _service;
    angular.mock.inject([ service_name, function(service) {
      _service = service;
      _.each(service, function(v, k) {
        if(_.isFunction(v)) {
          spyOn(service, k).and.callFake(function() {
            return service[k]._retVal;
          });
          service[k]._retVal = service_name+'.'+k+'.returnValue';
        }
      });
    }]);
    return _service;
  };
})();
