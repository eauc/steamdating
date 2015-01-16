'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        initCtrlWith = function(ctxt, pane, rounds) {
          ctxt.pane = pane || 'sum';
          ctxt.state_rounds = rounds || [];
          ctxt.state_players = ['toto'];

          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.updatePoints = jasmine.createSpy('updatePoints');
          ctxt.scope.storeState = jasmine.createSpy('storeState');
          ctxt.scope.edit = {};
          ctxt.scope.state = {
            players: ctxt.state_players,
            rounds: ctxt.state_rounds
          };
          ctxt.$stateParams = {
            pane: ctxt.pane
          };
          ctxt.window = jasmine.createSpyObj('$window', [ 'confirm' ]);

          ctxt.players = jasmine.createSpyObj('players', [ 'updateListsPlayed' ]);
          ctxt.dummy_players = ['tata'];
          ctxt.players.updateListsPlayed.and.returnValue(ctxt.dummy_players);

          ctxt.round = jasmine.createSpyObj('round', [ 'gameForPlayer', 'updatePlayer' ]);
          ctxt.rounds = jasmine.createSpyObj('rounds', [
            'drop',
            'createNextRound',
            'registerNextRound'
          ]);
          ctxt.dummy_next_round = [ 'next_round' ];
          ctxt.rounds.createNextRound.and.returnValue(ctxt.dummy_next_round);

          $controller('roundsCtrl', { 
            '$scope': ctxt.scope,
            '$stateParams': ctxt.$stateParams,
            '$window': ctxt.window,
            'players': ctxt.players,
            'rounds': ctxt.rounds,
            'round': ctxt.round
          });
        };
        initCtrlWith(this);
      }
    ]));

    it('should init pane from stateParams', function() {
      initCtrlWith(this, 'sum');
      expect(this.scope.pane).toBe('sum');

      initCtrlWith(this, 'next');
      expect(this.scope.pane).toBe('next');
    });

    it('should refresh players\' played lists', function() {
      expect(this.players.updateListsPlayed).toHaveBeenCalledWith(this.state_players,
                                                                  this.state_rounds);
      expect(this.scope.state.players).toBe(this.dummy_players);
    });

    it('should init next round', function() {
      expect(this.scope.next_round).toBe(this.dummy_next_round);
      expect(this.rounds.createNextRound)
        .toHaveBeenCalledWith(this.scope.state.players);
    });

    describe('doGameEdit(<game>)', function() {
      beforeEach(function() {
        this.dummy_game = {};
        this.round.gameForPlayer.and.returnValue(this.dummy_game);

        this.dummy_round = [ 'titi' ];
        this.dummy_player = 'toto';
        this.scope.doGameEdit(this.dummy_round, this.dummy_player);
      });

      it('should setup edit object', function() {
        expect(this.round.gameForPlayer).toHaveBeenCalledWith(this.dummy_round,
                                                              this.dummy_player);
        expect(this.scope.edit.game).toBe(this.dummy_game);
        expect(this.scope.edit.rounds_pane).toBe(this.scope.pane);
      });

      it('should go to game dit page', function() {
        expect(this.scope.goToState).toHaveBeenCalledWith('game_edit');
      });
    });

    describe('doDeleteRound(<index>)', function() {
      it('should ask user confirmation', function() {
        this.scope.doDeleteRound(1);

        expect(this.window.confirm).toHaveBeenCalled();
      });

      when('user confirms', function() {
        this.scope.state.rounds = [ 'rounds' ];
        this.window.confirm.and.returnValue(true);
        this.dummy_rounds = [ 'dummy' ];
        this.rounds.drop.and.returnValue(this.dummy_rounds);

        this.scope.doDeleteRound(4);
      }, function() {
        it('should drop round <index>', function() {
          expect(this.rounds.drop).toHaveBeenCalledWith([ 'rounds' ], 4);
          expect(this.scope.state.rounds).toBe(this.dummy_rounds);
        });

        it('should update points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });

        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });

        it('should return to rounds summary page', function() {
          expect(this.scope.goToState).toHaveBeenCalledWith('rounds',
                                                            { pane: 'sum' });
        });
      });
    });
    
    describe('updateNextRound(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = [ 'group1', 'group2', 'group3' ];
        this.dummy_updated_round = [ 'udpated_round' ];
        this.round.updatePlayer.and.returnValue(this.dummy_updated_round);
      });

      it('should update player names in next round for <gr_index> group', function() {
        this.scope.updateNextRound(2,3,'key');
        expect(this.scope.next_round[2]).toBe(this.dummy_updated_round);
        expect(this.round.updatePlayer).toHaveBeenCalledWith('group3', 3, 'key');
      });
    });
    
    describe('registerNextRound()', function() {
      beforeEach(function() {
        this.current_rounds = [ 'round1', 'round2' ];
        this.scope.state.rounds = this.current_rounds;
        this.new_rounds = [ 'round1', 'round2', 'round3' ];
        this.rounds.registerNextRound.and.returnValue(this.new_rounds);

        this.scope.registerNextRound();
      });

      it('should register next round', function() {
        expect(this.rounds.registerNextRound)
          .toHaveBeenCalledWith(this.current_rounds,
                                this.scope.next_round);
        expect(this.scope.state.rounds).toBe(this.new_rounds);
      });

      it('should store state', function() {
        expect(this.scope.storeState).toHaveBeenCalled();
      });

      it('should go to last round\'s pane', function() {
        expect(this.scope.goToState).toHaveBeenCalledWith('rounds', { pane: 2 });
      });
    });
  });

});
