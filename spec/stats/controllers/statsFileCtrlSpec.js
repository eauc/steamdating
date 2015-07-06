'use strict';

describe('controllers', function() {

  beforeEach(function() {
    this.windowService = {
      location: {}
    };
    module({
      '$window': this.windowService,
    });
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
        this.scope.state = [
          { name: 'result1' },
          { name: 'other' }
        ];
        
        this.fileImportService = spyOnService('fileImport');
        mockReturnPromise(this.fileImportService.read);

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.stateService = spyOnService('state');
        this.fileExportService = spyOnService('fileExport');

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
        this.$httpBackend.flush();
      }
    ]));

    it('should read server results list', function() {
      expect(this.scope.server_results)
        .toEqual([
          // detect already loaded server results
          { name : 'result1', url : 'url1', loaded : true },
          { name : 'result2', url : 'url2' }
        ]);
    });

    describe('doReset()', function() {
      beforeEach(function() {
        this.scope.server_results = [
          { name: 'result1', loaded: true },
          { name: 'result2', loaded: false },
          { name: 'result3' },
        ];
      });
      
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
        
        it('should reset server results loaded flags', function() {
          expect(this.scope.server_results)
            .toEqual([
              { name : 'result1', loaded : false },
              { name : 'result2', loaded : false },
              { name : 'result3', loaded : false }
            ]);
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

    when('doStateSelection(<index>)', function() {
      this.scope.doStateSelection(this.index);
    }, function() {
      beforeEach(function() {
        this.index = 1;
        this.scope.state = [
          { name: 'result1', state: 'state1' },
          { name: 'result2', state: 'state2' },
        ];
        this.scope.state_export = {
          url: 'previous'
        };
        spyOn(this.scope, 'doDropFile');
      });

      when('<index> is not already selected', function() {
        this.scope.selection.state = null;
      }, function() {
        it('should select <index>', function() {
          expect(this.scope.selection.state)
            .toBe(this.index);
        });

        it('should clean previous export url', function() {
          expect(this.fileExportService.cleanup)
            .toHaveBeenCalledWith('previous');
        });

        it('should export selected file data', function() {
          expect(this.fileExportService.generate)
            .toHaveBeenCalledWith('json', 'state2');
          expect(this.scope.state_export)
            .toEqual({
              name: 'result2.json',
              url: 'fileExport.generate.returnValue'
            });
        });
      });

      when('<index> is already selected', function() {
        this.scope.selection.state = this.index;
      }, function() {
        it('should drop selected <index>', function() {
          expect(this.scope.doDropFile)
            .toHaveBeenCalledWith(this.index);
        });
      });
    });

    when('doLoadInSteamDating(<index>)', function() {
      this.scope.doLoadInSteamDating(this.index);
    }, function() {
      beforeEach(function() {
        this.index = 1;
        this.scope.state = [
          { name: 'result1', state: 'state1' },
          { name: 'result2', state: 'state2' },
        ];
      });
      
      it('should ask user for confirmation', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('confirm', jasmine.any(String));
      });

      describe('when user confirms', function() {
        it('should store <index> state', function() {
          this.promptService.prompt.resolve();
          expect(this.stateService.store)
            .toHaveBeenCalledWith('state2');
        });

        it('should load steamdating', function() {
          this.promptService.prompt.resolve();
          expect(this.windowService.location.href)
            .toBe('/index.html');
        });
      });
    });

    when('doServerSelection(<index>)', function() {
      this.scope.doServerSelection(this.index);
    }, function() {
      beforeEach(function() {
        this.index = 1;
        spyOn(this.scope, 'doLoadFromServer');
      });

      when('<index> is not already selected', function() {
        this.scope.selection.server = null;
      }, function() {
        it('should select <index>', function() {
          expect(this.scope.selection.server)
            .toBe(this.index);
        });
      });

      when('<index> is already selected', function() {
        this.scope.selection.server = this.index;
      }, function() {
        it('should load selected <index>', function() {
          expect(this.scope.doLoadFromServer)
            .toHaveBeenCalledWith(this.index);
        });
      });
    });

    when('doLoadFromServer(<index>)', function() {
      this.scope.doLoadFromServer(this.index);
    }, function() {
      beforeEach(function() {
        this.index = 1;
      });

      when('data is not already loaded', function() {
        this.$httpBackend.expectGET('url2')
          .respond({ result: 2 });
      }, function() {
        it('should migrate state data', function() {
          this.$httpBackend.flush();
          expect(this.stateService.create)
            .toHaveBeenCalledWith({ result: 2 });
        });
        
        it('should push data into state', function() {
          this.$httpBackend.flush();
          expect(this.scope.pushState).toHaveBeenCalledWith({
            name: 'result2',
            state: 'state.create.returnValue',
            from_server: this.index
          });
        });
      });

      when('data is already loaded', function() {
        this.scope.server_results[this.index].loaded = true;
      }, function() {
        it('should do nothing', function() {
          expect(this.scope.pushState).not.toHaveBeenCalled();
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
