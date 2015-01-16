'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsNextCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.storeState = jasmine.createSpy('storeState');
        this.scope.state = {
          players: this.state_players,
          rounds: this.state_rounds
        };

        this.round = jasmine.createSpyObj('round', [ 'gameForPlayer', 'updatePlayer' ]);
        this.rounds = jasmine.createSpyObj('rounds', [
          'drop',
          'createNextRound',
          'registerNextRound'
        ]);
        this.dummy_next_round = [ 'next_round' ];
        this.rounds.createNextRound.and.returnValue(this.dummy_next_round);

        this.srPairing = jasmine.createSpyObj('srPairing', [ 'suggestNextRound' ]);

        $controller('roundsNextCtrl', { 
          '$scope': this.scope,
          'rounds': this.rounds,
          'round': this.round,
          'srPairing': this.srPairing
        });
      }
    ]));

    it('should init next round', function() {
      expect(this.scope.next_round).toBe(this.dummy_next_round);
      expect(this.rounds.createNextRound)
        .toHaveBeenCalledWith(this.scope.state.players);
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
        expect(this.scope.goToState).toHaveBeenCalledWith('rounds.nth', { pane: 2 });
      });
    });
    
    describe('suggestNextRound(<group_index>,<type>)', function() {
      when('type is "sr"', function() {
        this.type = 'sr';
        this.suggest = [ 'suggest' ];
        this.srPairing.suggestNextRound.and.returnValue(this.suggest);
      }, function() {
        it('should suggest SR pairing for <group_index>', function() {
          this.scope.suggestNextRound(1, this.type);

          expect(this.srPairing.suggestNextRound)
            .toHaveBeenCalledWith(this.scope.state, 1);
          expect(this.scope.next_round[1]).toBe(this.suggest);
        });
      });
    });
  });

});
