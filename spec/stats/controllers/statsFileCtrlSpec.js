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
      '$httpBackend',
      function($rootScope,
               $controller,
               $httpBackend) {
        this.server_results = [
          { name: 'result1',
            url: 'url1'
          },
          { name: 'result2',
            url: 'url2'
          }
        ];
        this.$httpBackend = $httpBackend;
        this.$httpBackend.expectGET('/data/results.json')
          .respond(this.server_results);

        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');
        this.scope.pushState = jasmine.createSpy('pushState');
        this.scope.dropState = jasmine.createSpy('dropState');

        this.fileImportService = spyOnService('fileImport');
        mockReturnPromise(this.fileImportService.read);

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.stateService = spyOnService('state');

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
        this.$httpBackend.flush();
      }
    ]));

    it('should read server results list', function() {
      expect(this.scope.server_results)
        .toEqual(this.server_results);
    });

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
      beforeEach(function() {
        this.scope.state = [
          {},
          { to: 'drop' }
        ];
        this.index = 1;
      });

      when('droped file was loaded from server', function() {
        this.server_index = 2;
        this.scope.server_results = [ {}, {}, { loaded: true } ];

        this.scope.state[this.index].from_server = this.server_index;
      }, function() {
        it('should clear "loaded" flag from server_results', function() {
          this.scope.doDropFile(this.index);

          expect(this.scope.server_results[this.server_index].loaded)
            .toBe(false);
        });
      });

      it('should drop <index> from state', function() {
        this.scope.doDropFile(this.index);
        expect(this.scope.dropState).toHaveBeenCalledWith(this.index);
      });
    });

    describe('doLoadFromServer(<index>)', function() {
      beforeEach(function() {
        this.index = 1;
        this.$httpBackend.expectGET('url2')
          .respond({ result: 2 });
        this.scope.doLoadFromServer(this.index);
        this.$httpBackend.flush();
      });

      it('should migrate state data', function() {
        expect(this.stateService.create)
          .toHaveBeenCalledWith({ result: 2 });
      });

      it('should push data into state', function() {
        expect(this.scope.pushState).toHaveBeenCalledWith({
          name: 'result2',
          state: 'state.create.returnValue',
          from_server: this.index
        });
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

        it('should migrate state data', function() {
          expect(this.stateService.create)
            .toHaveBeenCalledWith(['state']);
        });

        it('should push data into state', function() {
          expect(this.scope.pushState).toHaveBeenCalledWith({
            name: 'file2',
            state: 'state.create.returnValue'
          });
        });
      });
    });
  });

});
