'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('fileCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      '$window',
      'state',
      'factions',
      'fileExport',
      function($rootScope,
               $controller,
               $window,
               state,
               factions,
               fileExport) {
        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');
        this.scope.goToState = jasmine.createSpy('goToState');
        spyOn(this.scope, '$on');

        this.scope.state = {
          players: ['players']
        };

        this.state = state;
        spyOn(state, 'isEmpty');
        spyOn(state, 'rankingTables');

        this.window = $window;
        spyOn($window, 'confirm');

        this.factions = factions;
        this.dummy_factions = [
          { name: 'gros vilains', t3: 'cryx' },
          { name: 'petits poneys', t3: 'scyrah' },
          { name: 'best of the beast', t3: 'blight' },
        ];
        spyOn(factions, 'baseFactions').and.returnValue(this.dummy_factions);

        this.fileExport = fileExport;
        spyOn(this.fileExport, 'generate');
        spyOn(this.fileExport, 'cleanup');

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
      }
    ]));

    it('should init factions', function() {
      expect(this.scope.factions).toEqual(this.dummy_factions);
    });

    it('should init exports', function() {
      expect(this.scope.exports).toBeAn('Object');
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
        expect(this.fileExport.cleanup).toHaveBeenCalledWith('test');
      });
    });

    describe('doReset()', function() {
      when('state is not empty', function() {
        this.state.isEmpty.and.returnValue(false);
      }, function() {
        it('should ask user for confirmation', function() {
          this.scope.doReset();

          expect(this.window.confirm).toHaveBeenCalled();
        });

        when('user confirms', function() {
          this.window.confirm.and.returnValue(true);
        }, function() {
          it('should reset state', function() {
            this.scope.doReset();

            expect(this.scope.resetState).toHaveBeenCalled();
          });
        });
      });

      when('state is not empty', function() {
        this.state.isEmpty.and.returnValue(true);
      }, function() {
        it('should reset state', function() {
          this.scope.doReset();

          expect(this.scope.resetState).toHaveBeenCalled();
        });
      });
    });

    describe('doImportFile(<type>, <file>)', function() {
      beforeEach(inject(function(fileImport) {
        var ctxt = this;
        this.fileImport = fileImport;
        spyOn(fileImport, 'read').and.returnValue({
          then: function(onSuccess, onError) {
            ctxt.onSuccess = onSuccess; 
            ctxt.onError = onError;
          }
        });
        
        this.scope.doImportFile('toto', 'file');
      }));

      it('should try to import file', function() {
        expect(this.fileImport.read)
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
        this.fileExport.generate.calls.reset();
        this.fileExport.generate.and.callFake(function(type) {
          return type+'_url';
        });
        this.state.rankingTables.and.returnValue(['ranking']);
        this.scope.updateExports();
      });

      it('should generate export for fk players list', function() {
        expect(this.fileExport.generate)
          .toHaveBeenCalledWith('fk', this.scope.state.players);
        expect(this.fileExport.generate)
          .toHaveBeenCalledWith('csv', ['ranking']);
        expect(this.fileExport.generate)
          .toHaveBeenCalledWith('bb', ['ranking']);

        expect(this.scope.exports.fk.name).toMatch(/^players_\d+\.txt$/);
        expect(this.scope.exports.fk.url).toBe('fk_url');
        expect(this.scope.exports.fk.label).toBe('FK players list');

        expect(this.scope.exports.csv_rank.name).toMatch(/^ranking_\d+\.csv$/);
        expect(this.scope.exports.csv_rank.url).toBe('csv_url');
        expect(this.scope.exports.csv_rank.label).toBe('CSV Ranking');

        expect(this.scope.exports.bb_rank.name).toMatch(/^ranking_\d+\.txt$/);
        expect(this.scope.exports.bb_rank.url).toBe('bb_url');
        expect(this.scope.exports.bb_rank.label).toBe('BB Ranking');
      });
    });
  });

});
