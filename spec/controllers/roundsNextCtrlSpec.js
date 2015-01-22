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

        this.round = jasmine.createSpyObj('round', [
          'gameForPlayer',
          'updatePlayer',
          'isPlayerPaired'
        ]);
        this.rounds = jasmine.createSpyObj('rounds', [
          'drop',
          'createNextRound',
          'registerNextRound'
        ]);
        this.dummy_next_round = [ 'next_round' ];
        this.rounds.createNextRound.and.returnValue(this.dummy_next_round);

        this.state = jasmine.createSpyObj('state', [ 'resetBracket', 'setBracket' ]);
        this.srPairing = jasmine.createSpyObj('srPairing', [ 'suggestNextRound' ]);
        this.bracketPairing = jasmine.createSpyObj('bracketPairing', [ 'suggestRound' ]);

        $controller('roundsNextCtrl', { 
          '$scope': this.scope,
          'state': this.state,
          'rounds': this.rounds,
          'round': this.round,
          'srPairing': this.srPairing,
          'bracketPairing': this.bracketPairing
        });
      }
    ]));

    it('should make a copy of current state', function() {
      expect(this.scope.new_state).not.toBe(this.scope.state);
      expect(this.scope.new_state).toEqual(this.scope.state);
    });

    it('should init next round', function() {
      expect(this.scope.next_round).toBe(this.dummy_next_round);
      expect(this.rounds.createNextRound)
        .toHaveBeenCalledWith(this.scope.state.players);
    });

    it('should init players options lists', function() {
      expect(this.scope.players_options).not.toBe(undefined);
    });

    describe('updateNextRound(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = [ 'group1', 'group2', 'group3' ];
        this.dummy_updated_round = [ 'udpated_round' ];
        this.round.updatePlayer.and.returnValue(this.dummy_updated_round);

        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.updateNextRound(2,3,'key');
      });

      it('should update player names in next round for <gr_index> group', function() {
        expect(this.scope.next_round[2]).toBe(this.dummy_updated_round);
        expect(this.round.updatePlayer).toHaveBeenCalledWith('group3', 3, 'key');
      });

      it('should update players options lists', function() {
        expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
      });
    });

    describe('updatePlayersOptions()', function() {
      beforeEach(function() {
        this.scope.players_options = null;
        this.scope.new_state.players = [
          [ { name: 'paired11' }, { name: 'not_paired12' }, { name: 'not_paired13' } ],
          [ { name: 'not_paired21' }, { name: 'paired22' } ],
        ];
        this.scope.next_round = [ 'group1', 'group2' ];
        this.round.isPlayerPaired.and.callFake(function(r, p) {
          return s.startsWith(p.name, 'paired');
        });
      });

      it('should update players options lists', function() {
        this.scope.updatePlayersOptions();

        expect(this.scope.players_options).toEqual([
          [ ['paired11', 'paired11'],
            ['not_paired12', '> not_paired12'],
            ['not_paired13', '> not_paired13'] ],
          [ ['not_paired21', '> not_paired21'],
            ['paired22', 'paired22'] ]
        ]);
      });
    });
    
    describe('registerNextRound()', function() {
      beforeEach(function() {
        this.scope.new_state.rounds = [ 'round1', 'round2' ];
        this.scope.new_state.bracket = [ 'new_bracket' ];
        this.new_rounds = [ 'round1', 'round2', 'round3' ];
        this.rounds.registerNextRound.and.returnValue(this.new_rounds);

        this.scope.registerNextRound();
      });

      it('should update bracket', function() {
        expect(this.scope.state.bracket).toEqual([ 'new_bracket' ]);
      });

      it('should register next round', function() {
        expect(this.rounds.registerNextRound)
          .toHaveBeenCalledWith(this.scope.new_state.rounds,
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

        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.state.resetBracket).toHaveBeenCalledWith(this.scope.new_state, 1);
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.srPairing.suggestNextRound)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
          expect(this.scope.next_round[1]).toBe(this.suggest);
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });

      when('type is "bracket"', function() {
        this.type = 'bracket';
        this.suggest = [ 'suggest' ];
        this.bracketPairing.suggestRound.and.returnValue(this.suggest);

        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.state.setBracket).toHaveBeenCalledWith(this.scope.new_state, 1);
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.bracketPairing.suggestRound)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
          expect(this.scope.next_round[1]).toBe(this.suggest);
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });
    });
  });

});
