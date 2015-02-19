'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srAppStats.services');
    module('srApp.directives');
    module('srAppStats.controllers');
  });

  describe('statsFileCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');
        this.scope.pushState = jasmine.createSpy('pushState');
        this.scope.dropState = jasmine.createSpy('dropState');

        this.fileImportService = spyOnService('fileImport');
        mockReturnPromise(this.fileImportService.read);

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
      }
    ]));

    describe('doReset()', function() {
      it('should ask user for confirmation', function() {
        this.scope.doReset();

        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('confirm', jasmine.any(String));
      });

      when('user confirms', function() {
        this.scope.doReset();

        this.promptService.prompt.resolve();
      }, function() {
        it('should reset state', function() {
          expect(this.scope.resetState).toHaveBeenCalled();
        });
      });
    });

    describe('doDropFile(<index>)', function() {
      it('should drop <index> from state', function() {
        this.scope.doDropFile('index');
        expect(this.scope.dropState).toHaveBeenCalledWith('index');
      });
    });

    describe('doOpenFile(<files>)', function() {
      beforeEach(function() {
        this.scope.doOpenFile([{name:'file1'},{name:'file2'}]);
      });

      it('should try to import file', function() {
        expect(this.fileImportService.read)
          .toHaveBeenCalledWith('json', {name:'file1'});
        expect(this.fileImportService.read)
          .toHaveBeenCalledWith('json', {name:'file2'});
      });

      describe('on error', function() {
        beforeEach(function() {
          this.fileImportService.read.reject(['errors']);
        });

        it('should set error feedback string', function() {
          expect(this.scope.open_result).toEqual([ 'errors' ]);
        });
      });

      describe('on success', function() {
        beforeEach(function() {
          this.fileImportService.read.resolve([['state'],['errors']]);
        });

        it('should set error feedback string', function() {
          expect(this.scope.open_result).toEqual(['errors']);
        });

        it('should push data into state', function() {
          expect(this.scope.pushState).toHaveBeenCalledWith({
            name: 'file2',
            state: ['state']
          });
        });
      });
    });
  });

});
