'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('playersListCtrl', function(c) {

    var initCtrl;
    
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        var ctxt = this;

        this.stateService = spyOnService('state');
        this.playerService = spyOnService('player');
        this.playersService = spyOnService('players');
        this.fileExportService = spyOnService('fileExport');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        initCtrl = function(sort_by, exports) {
          ctxt.scope = $rootScope.$new();
          ctxt.state_players = [ 'titi' ];
          ctxt.scope.edit = { };
          ctxt.scope.state = { players: ctxt.state_players };
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.updatePoints = jasmine.createSpy('updatePoints');
          
          ctxt.state = { current: { name: 'current_state',
                                    data: { sort: sort_by || 'Rank',
                                            exports: exports || [] } } };
        
          $controller('playersListCtrl', {
            '$scope': ctxt.scope,
            '$state': ctxt.state,
          });
        };
        initCtrl();
      }
    ]));

    it('should update points', function() {
      expect(this.scope.updatePoints).toHaveBeenCalled();
    });
    
    using([
      [ 'sort', 'sortFn' ],
      [ 'Rank', 'sortPlayersByRank' ],
      [ 'Name', 'sortPlayersByName' ]
    ], function(e, d) {
      it('should init sorted players list, '+d, function() {
        initCtrl(e.sort);

        expect(this.scope.sorted_players)
          .toBe('state.'+e.sortFn+'.returnValue');
        expect(this.stateService[e.sortFn])
          .toHaveBeenCalledWith(this.scope.state);
      });
    });

    using([
      [ 'exports'  , 'type' , 'object' ],
      [ 'fk'       , 'fk'   , ['titi'] ],
      [ 'csv_rank' , 'csv'  , 'state.rankingTables.returnValue' ],
      [ 'bb_rank'  , 'bb'   , 'state.rankingTables.returnValue' ],
    ], function(e, d) {
      it('should init exports, '+d, function() {
        initCtrl(null, [e.exports]);

        expect(this.fileExportService.generate)
          .toHaveBeenCalledWith(e.type, e.object);
        expect(this.scope.exports[e.exports].url)
          .toBe('fileExport.generate.returnValue');
      });
    });
    
    describe('doEditGroups', function () {
      it('should init edit parameters', function() {
        this.scope.doEditGroups();

        expect(this.scope.edit).toEqual({
          back: 'current_state'
        });
      });

      it('should go to groups edit state', function() {
        this.scope.doEditGroups();

        expect(this.scope.goToState)
          .toHaveBeenCalledWith('groups_edit');
      });
    });

    describe('doAddPlayer', function () {
      it('should init edit parameters', function() {
        this.scope.doAddPlayer(5);

        expect(this.playerService.create)
          .toHaveBeenCalled();
        expect(this.scope.edit).toEqual({
          player: 'player.create.returnValue',
          group: 5,
          back: 'current_state'
        });
      });

      it('should go to player edit state', function() {
        this.scope.doAddPlayer(5);

        expect(this.scope.goToState)
          .toHaveBeenCalledWith('player_edit');
      });
    });

    describe('doDropPlayer(<do_drop>, <player>)', function () {
      beforeEach(function() {
        this.event = jasmine.createSpyObj('event', ['stopPropagation']);
        this.player = { name: 'toto' };

        this.scope.sorted_players = undefined;
        this.stateService.sortPlayersByRank.calls.reset();
      });

      it('should prevent player edition', function() {
        this.scope.doDropPlayer(false, this.player, this.event);

        expect(this.event.stopPropagation).toHaveBeenCalled();
      });

      when('<do_drop>', function() {
        this.scope.state.rounds = [ 'round1', 'round2' ];
        this.scope.doDropPlayer(true, this.player, this.event);
      }, function() {
        it('should drop player', function() {
          expect(this.playerService.drop)
            .toHaveBeenCalledWith(this.player, 2);
        });
      });

      when('not <do_drop>', function() {
        this.scope.doDropPlayer(false, this.player, this.event);
      }, function() {
        it('should undrop player', function() {
          expect(this.playerService.undrop)
            .toHaveBeenCalledWith(this.player);
        });
      });
      
      it('should store new state', function() {
        this.scope.doDropPlayer(false, this.player, this.event);

        expect(this.stateService.store)
          .toHaveBeenCalledWith(this.scope.state);
      });
    });

    describe('doDeletePlayer(<player>)', function () {
      beforeEach(function() {
        this.event = jasmine.createSpyObj('event', ['stopPropagation']);
        this.player = { name: 'toto' };
      });

      it('should prevent player edition', function() {
        this.scope.doDeletePlayer(this.player, this.event);

        expect(this.event.stopPropagation).toHaveBeenCalled();
      });

      it('should ask confirmation', function() {
        this.scope.doDeletePlayer(this.player, this.event);

        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('confirm', jasmine.any(String));
      });

      when('user confirms', function() {
        this.scope.sorted_players = undefined;
        this.stateService.sortPlayersByRank.calls.reset();

        this.scope.doDeletePlayer(this.player, this.event);
        this.promptService.prompt.resolve();
      }, function() {
        it('should delete player from state', function() {
          expect(this.playersService.drop)
            .toHaveBeenCalledWith(this.state_players, this.player);
          expect(this.scope.state.players)
            .toBe('players.drop.returnValue');
        });

        it('should store new state', function() {
          expect(this.stateService.store)
            .toHaveBeenCalledWith(this.scope.state);
        });

        it('should refresh sorted players list', function() {
          expect(this.stateService.sortPlayersByRank)
            .toHaveBeenCalledWith(this.scope.state);
          expect(this.scope.sorted_players)
            .toBe('state.sortPlayersByRank.returnValue');
        });
      });
    });
  });

});
