'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('fileImport', function() {

    var fileImport;

    beforeEach(inject([ 'fileImport', function(_fileImport) {
      fileImport = _fileImport;
    }]));

    describe('read(<type>, <file>, <factions>)', function() {
      beforeEach(inject(function($window) {
        var ctxt = this;
        this.window = $window;
        this.FileReader = {
          readAsText: jasmine.createSpy('readAsText').and.callFake(function() {
            ctxt.reader = this;
          })
        };
        spyOn($window, 'FileReader').and.returnValue(this.FileReader);
      }));

      it('should use a file reader to read file', function() {
        fileImport.read('t3', 'file', 'factions');

        expect(this.window.FileReader).toHaveBeenCalled();
        expect(this.FileReader.readAsText).toHaveBeenCalledWith('file');
      });

      describe('on error', function() {
        beforeEach(inject(function($rootScope) {
          this.successCbk = jasmine.createSpy('successCbk');
          this.errorCbk = jasmine.createSpy('errorCbk');
          fileImport.read('t3', 'file', 'factions')
            .then(this.successCbk, this.errorCbk);

          this.reader.onerror('error');
          $rootScope.$digest();
        }));

        it('should reject promise', function() {
          expect(this.successCbk).not.toHaveBeenCalled();
          expect(this.errorCbk).toHaveBeenCalledWith(['error reading file']);
        });
      });

      describe('on abort', function() {
        beforeEach(inject(function($rootScope) {
          this.successCbk = jasmine.createSpy('successCbk');
          this.errorCbk = jasmine.createSpy('errorCbk');
          fileImport.read('t3', 'file', 'factions')
            .then(this.successCbk, this.errorCbk);

          this.reader.onabort('error');
          $rootScope.$digest();
        }));

        it('should reject promise', function() {
          expect(this.successCbk).not.toHaveBeenCalled();
          expect(this.errorCbk).toHaveBeenCalledWith(['abort reading file']);
        });
      });

      describe('on load', function() {
        beforeEach(inject(function($rootScope, t3Parser, fkParser) {
          var ctxt = this;

          this.t3Parser = t3Parser;
          spyOn(t3Parser, 'parse');

          this.fkParser = fkParser;
          spyOn(fkParser, 'parse');

          this.successCbk = jasmine.createSpy('successCbk');
          this.errorCbk = jasmine.createSpy('errorCbk');
          fileImport.read('t3', 'file', 'factions')
            .then(this.successCbk, this.errorCbk);

          this.testOnLoad = function() {
            ctxt.reader.onload({ target: { result: 'result' } });
            $rootScope.$digest();
          };
        }));

        it('should try to parse file using <type> parser', function() {
          this.testOnLoad();

          expect(this.t3Parser.parse).toHaveBeenCalledWith('result', 'factions');

          fileImport.read('fk', 'file', 'factions')
            .then(this.successCbk, this.errorCbk);
          this.testOnLoad();

          expect(this.fkParser.parse).toHaveBeenCalledWith('result', 'factions');
        });

        when('a parse error happens', function() {
          this.t3Parser.parse.and.throwError('parse error');

          this.testOnLoad();
        }, function() {
          it('should reject promise', function() {
            expect(this.errorCbk).toHaveBeenCalledWith(['invalid file : parse error']);
          });
        });

        when('a parse succeeds', function() {
          this.t3Parser.parse.and.returnValue([ 'players', 'errors' ]);

          this.testOnLoad();
        }, function() {
          it('should resolve promise', function() {
            expect(this.successCbk).toHaveBeenCalledWith(['players', 'errors']);
          });
        });
      });
    });
  });

});
