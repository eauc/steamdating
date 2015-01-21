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
      beforeEach(inject(function($window, fkStringifier) {
        this.window = $window;
        spyOn($window, 'Blob').and.callFake(function() { this.blob = 'blob'; });
        spyOn($window.URL, 'createObjectURL').and.returnValue('test_url');

        this.fkStringifier = fkStringifier;
        spyOn(fkStringifier, 'stringify').and.returnValue('fk_string');
      }));

      it('should call <type> stringifier', function() {
        fileExport.generate('fk', 'data');

        expect(this.fkStringifier.stringify).toHaveBeenCalledWith('data');
      });

      it('should generate URL from string', function() {
        expect(fileExport.generate('fk', 'data')).toBe('test_url');

        expect(this.window.Blob)
          .toHaveBeenCalledWith(['fk_string'], {type: 'text/plain'});
        expect(this.window.URL.createObjectURL)
          .toHaveBeenCalledWith({ blob: 'blob' });
      });
    });
  });

});
