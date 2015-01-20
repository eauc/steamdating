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
      function($rootScope,
               $controller,
               $window,
               state,
               factions) {
        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');
        this.scope.goToState = jasmine.createSpy('goToState');

        this.state = state;
        spyOn(state, 'isEmpty');

        this.window = $window;
        spyOn($window, 'confirm');

        this.factions = factions;
        this.dummy_factions = [
          { name: 'gros vilains', t3: 'cryx' },
          { name: 'petits poneys', t3: 'scyrah' },
          { name: 'best of the beast', t3: 'blight' },
        ];
        spyOn(factions, 'baseFactions').and.returnValue(this.dummy_factions);

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();
      }
    ]));

    it('should init factions', function() {
      expect(this.scope.factions).toEqual({
        'cryx': 'gros vilains',
        'scyrah': 'petits poneys',
        'blight': 'best of the beast'
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

    describe('doImportT3File(file)', function() {
      beforeEach(inject(function(t3Import) {
        var ctxt = this;
        this.t3Import = t3Import;
        spyOn(t3Import, 'read').and.returnValue({
          then: function(onSuccess, onError) {
            ctxt.onSuccess = onSuccess; 
            ctxt.onError = onError;
          }
        });
        
        this.scope.doImportT3File('file');
      }));

      it('should try to import file', function() {
        expect(this.t3Import.read)
          .toHaveBeenCalledWith('file', this.scope.factions);
      });

      describe('on error', function() {
        it('should set error feedback string', function() {
          this.onError([ 'errors' ]);

          expect(this.scope.import_t3_result).toEqual([ 'errors' ]);
        });
      });

      describe('on success', function() {
        beforeEach(function() {
          this.onSuccess([[ 'players' ], [ 'errors' ]]);
        });

        it('should reset state', function() {
          expect(this.scope.resetState)
            .toHaveBeenCalledWith({ players: [ ['players'] ] });
        });

        it('should set error feedback string', function() {
          expect(this.scope.import_t3_result[0]).toEqual('errors');
        });

        it('should inform about nb of players read', function() {
          expect(this.scope.import_t3_result[1])
            .toEqual('1 players have been read successfully');
        });

        it('should stay on file page', function() {
          expect(this.scope.goToState)
            .not.toHaveBeenCalled();
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
  });

});
