'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('fileExport', function() {

    var fileExport;

    beforeEach(inject([ 'fileExport', function(_fileExport) {
      fileExport = _fileExport;
    }]));

    describe('generate(<type>, <data>)', function() {
      beforeEach(inject(function($window) {
        this.window = $window;
        spyOn($window, 'Blob').and.callFake(function() { this.blob = 'blob'; });
        spyOn($window.URL, 'createObjectURL').and.returnValue('test_url');

        this.fkStringifierService = spyOnService('fkStringifier');
      }));

      it('should call <type> stringifier', function() {
        fileExport.generate('fk', 'data');

        expect(this.fkStringifierService.stringify)
          .toHaveBeenCalledWith('data');
      });

      it('should generate URL from string', function() {
        expect(fileExport.generate('fk', 'data')).toBe('test_url');

        expect(this.window.Blob)
          .toHaveBeenCalledWith(['fkStringifier.stringify.returnValue'],
                                {type: 'text/plain'});
        // bug in SpecRunner
        // expect(this.window.URL.createObjectURL)
        //   .toHaveBeenCalledWith({ blob: 'blob' });
        expect(this.window.URL.createObjectURL).toHaveBeenCalled();
        expect(this.window.URL.createObjectURL.calls.first().args[0].blob).toBe('blob');
      });
    });
  });

});
