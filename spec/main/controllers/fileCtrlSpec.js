'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('fileCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');
        this.scope.goToState = jasmine.createSpy('goToState');
        spyOn(this.scope, '$on');

        this.scope.state = {
          players: ['players']
        };

        this.stateService = spyOnService('state');
        this.factionsService = spyOnService('factions');
        this.fileExportService = spyOnService('fileExport');
        this.fileImportService = spyOnService('fileImport');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.factionsService.baseFactions._retVal = [
          { name: 'gros vilains', t3: 'cryx' },
          { name: 'petits poneys', t3: 'scyrah' },
          { name: 'best of the beast', t3: 'blight' },
        ];

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
      }
    ]));

    it('should init factions', function() {
      expect(this.scope.factions)
        .toEqual(this.factionsService.baseFactions._retVal);
    });

    it('should init exports', function() {
      expect(this.scope.exports).toBeAn('Object');
      expect(_.keys(this.scope.exports).length).not.toBe(0);
      expect(this.scope.save).toBeAn('Object');
      expect(_.keys(this.scope.exports).length).not.toBe(0);
    });

    describe('on destroy', function() {
      beforeEach(function() {
        var ctxt = this;
        _.each(this.scope.$on.calls.all(), function(c) {
          if(c.args[0] === '$destroy') {
            ctxt.onDestroy = c.args[1];
          }
        });

        expect(this.onDestroy).toBeA('Function');
      });

      it('should cleanup export urls', function() {
        this.scope.exports = { test: { url: 'test' } };
        this.onDestroy();
        expect(this.fileExportService.cleanup)
          .toHaveBeenCalledWith('test');
      });
    });

    describe('doReset()', function() {
      when('state is not empty', function() {
        this.stateService.isEmpty.and.returnValue(false);
      }, function() {
        it('should ask user for confirmation', function() {
          this.scope.doReset();

          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('confirm', jasmine.any(String));
        });

        when('user confirms', function() {
          this.stateService.isEmpty.and.returnValue(false);
          this.scope.doReset();

          this.promptService.prompt.resolve();
        }, function() {
          it('should reset state', function() {
            expect(this.scope.resetState).toHaveBeenCalled();
          });
        });
      });

      when('state is empty', function() {
        this.stateService.isEmpty.and.returnValue(true);
      }, function() {
        it('should reset state', function() {
          this.scope.doReset();

          expect(this.scope.resetState).toHaveBeenCalled();
        });
      });
    });

    describe('doOpenFile(<files>)', function() {
      beforeEach(function() {
        var ctxt = this;
        this.fileImportService.read._retVal = {
          then: function(onSuccess, onError) {
            ctxt.onSuccess = onSuccess; 
            ctxt.onError = onError;
          }
        };
        
        this.scope.doOpenFile(['file']);
      });

      it('should try to import file', function() {
        expect(this.fileImportService.read)
          .toHaveBeenCalledWith('json', 'file', this.scope.factions);
      });

      describe('on error', function() {
        it('should set error feedback string', function() {
          this.onError([ 'errors' ]);

          expect(this.scope.open_result).toEqual([ 'errors' ]);
        });
      });

      describe('on success', function() {
        beforeEach(function() {
          spyOn(this.scope, 'updateExports');

          this.onSuccess([[ 'state' ], [ 'errors' ]]);
        });

        it('should reset state', function() {
          expect(this.scope.resetState)
            .toHaveBeenCalledWith(['state']);
        });

        it('should set error feedback string', function() {
          expect(this.scope.open_result[0]).toEqual('errors');
        });

        when('no error during import', function() {
          this.onSuccess([[ 'players' ], [ ]]);
        }, function() {
          it('should automatically display players list', function() {
            expect(this.scope.goToState)
              .toHaveBeenCalledWith('players');
          });
        });
      });
    });

    describe('doImportFile(<type>, <file>)', function() {
      beforeEach(function() {
        var ctxt = this;
        this.fileImportService.read._retVal = {
          then: function(onSuccess, onError) {
            ctxt.onSuccess = onSuccess; 
            ctxt.onError = onError;
          }
        };
        
        this.scope.doImportFile('toto', 'file');
      });

      it('should try to import file', function() {
        expect(this.fileImportService.read)
          .toHaveBeenCalledWith('toto', 'file', this.scope.factions);
      });

      describe('on error', function() {
        it('should set error feedback string', function() {
          this.onError([ 'errors' ]);

          expect(this.scope.import_toto_result).toEqual([ 'errors' ]);
        });
      });

      describe('on success', function() {
        beforeEach(function() {
          spyOn(this.scope, 'updateExports');

          this.onSuccess([[ 'players' ], [ 'errors' ]]);
        });

        it('should reset state', function() {
          expect(this.scope.resetState)
            .toHaveBeenCalledWith({ players: [ ['players'] ] });
        });

        it('should set error feedback string', function() {
          expect(this.scope.import_toto_result[0]).toEqual('errors');
        });

        it('should inform about nb of players read', function() {
          expect(this.scope.import_toto_result[1])
            .toEqual('1 players have been read successfully');
        });

        it('should stay on file page', function() {
          expect(this.scope.goToState)
            .not.toHaveBeenCalled();
        });

        it('should update exports', function() {
          expect(this.scope.updateExports)
            .toHaveBeenCalled();
        });

        when('no error during import', function() {
          this.onSuccess([[ 'players' ], [ ]]);
        }, function() {
          it('should automatically display players list', function() {
            expect(this.scope.goToState)
              .toHaveBeenCalledWith('players');
          });
        });
      });
    });
    
    describe('updateExports', function() {
      beforeEach(function() {
        this.fileExportService.generate.calls.reset();
        this.fileExportService.generate.and.callFake(function(type) {
          return type+'_url';
        });

        this.scope.exports = null;
        this.scope.save = null;

        this.scope.updateExports();
      });

      it('should generate export for the save file', function() {
        expect(this.fileExportService.generate)
          .toHaveBeenCalledWith('json', this.scope.state);

        expect(this.scope.save.name).toMatch(/^steamdating_\d+\.json$/);
        expect(this.scope.save.url).toBe('json_url');
      });

      it('should generate export for fk players list', function() {
        expect(this.fileExportService.generate)
          .toHaveBeenCalledWith('fk', this.scope.state.players);

        expect(this.scope.exports.fk.name).toMatch(/^players_\d+\.txt$/);
        expect(this.scope.exports.fk.url).toBe('fk_url');
        expect(this.scope.exports.fk.label).toBe('FK players list');
      });

      using([
        [ 'type' , 'name'               , 'label'       ],
        [ 'csv'  , /^ranking_\d+\.csv$/ , 'CSV Ranking' ],
        [ 'bb'   , /^ranking_\d+\.txt$/ , 'BB Ranking'  ]
      ], function(exple) {
        it('should generate export for '+exple.type+' ranking', function() {
          expect(this.fileExportService.generate)
            .toHaveBeenCalledWith(exple.type, 'state.rankingTables.returnValue');
                  
          expect(this.scope.exports[exple.type+'_rank'].name).toMatch(exple.name);
          expect(this.scope.exports[exple.type+'_rank'].url).toBe(exple.type+'_url');
          expect(this.scope.exports[exple.type+'_rank'].label).toBe(exple.label);
        });
      });
    });
  });

});
