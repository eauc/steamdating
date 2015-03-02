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
        this.state_players = [ 'players' ];
        this.state_rounds = [ 'rounds' ];
        this.scope.state = {
          players: this.state_players,
          rounds: this.state_rounds
        };

        this.stateService = spyOnService('state');
        this.srPairingService = spyOnService('srPairing');
        this.bracketPairingService = spyOnService('bracketPairing');
        this.roundService = spyOnService('round');
        this.roundsService = spyOnService('rounds');
        this.roundsService.createNextRound._retVal = ['rounds.createNextRound.returnValue'];

        $controller('roundsNextCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should make a copy of current state', function() {
      expect(this.scope.new_state).not.toBe(this.scope.state);
      expect(this.scope.new_state).toEqual(this.scope.state);
    });

    it('should check whether last round is complete', function() {
      expect(this.scope.previous_round_complete)
        .toBe('rounds.lastRoundIsComplete.returnValue');
      expect(this.roundsService.lastRoundIsComplete)
        .toHaveBeenCalledWith(this.state_rounds);
    });

    it('should init next round', function() {
      expect(this.scope.next_round)
        .toEqual([ 'rounds.createNextRound.returnValue' ]);
      expect(this.roundsService.createNextRound)
        .toHaveBeenCalledWith(this.scope.state.players);
    });
    
    it('should init players options lists', function() {
      expect(this.scope.players_options).not.toBe(undefined);
    });

    describe('updatePlayer(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = [ 'group1', 'group2', 'group3' ];
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.updatePlayer(2,3,'key');
      });

      it('should update player names in next round for <gr_index> group', function() {
        expect(this.scope.next_round[2])
          .toBe('round.updatePlayer.returnValue');
        expect(this.roundService.updatePlayer)
          .toHaveBeenCalledWith('group3', 3, 'key');
      });

      it('should update players options lists', function() {
        expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
      });
    });

    describe('updateTable(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = [ 'group1', 'group2', 'group3' ];
        this.scope.tables_ranges = [[],[],[6,4,5]];
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.updateTable(2,3,'key');
      });

      it('should update tables in next round for <gr_index> group', function() {
        expect(this.scope.next_round[2])
          .toBe('round.updateTable.returnValue');
        expect(this.roundService.updateTable)
          .toHaveBeenCalledWith('group3', 3, 4);
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
        this.scope.new_state.rounds = ['rounds'];
        this.scope.next_round = [ [ 'gr1g1', 'gr1g2' ], [ 'gr2g1' ] ];
        this.roundService.isPlayerPaired.and.callFake(function(r, p) {
          return s.startsWith(p.name, 'paired');
        });
        this.roundsService.pairAlreadyExists.calls.reset();
        this.roundsService.pairAlreadyExists.and.callFake(function(r, g) {
          return 'rounds.pairAlreadyExists.returnValue('+g+')';
        });
      });

      it('should update tables ranges list', function() {
        this.scope.updatePlayersOptions();

        expect(this.scope.tables_ranges).toEqual([[1,2],[3]]);
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

      it('should warn about paired already played', function() {
        this.scope.updatePlayersOptions();

        expect(this.roundsService.pairAlreadyExists)
          .toHaveBeenCalledWith(['rounds'], 'gr1g1');
        expect(this.roundsService.pairAlreadyExists)
          .toHaveBeenCalledWith(['rounds'], 'gr1g2');
        expect(this.roundsService.pairAlreadyExists)
          .toHaveBeenCalledWith(['rounds'], 'gr2g1');
        expect(this.scope.pairs_already).toEqual([
          [ 'rounds.pairAlreadyExists.returnValue(gr1g1)',
            'rounds.pairAlreadyExists.returnValue(gr1g2)' ],
          [ 'rounds.pairAlreadyExists.returnValue(gr2g1)' ]
        ]);
      });
    });
    
    describe('registerNextRound()', function() {
      beforeEach(function() {
        this.scope.new_state.rounds = [ 'round1', 'round2' ];
        this.scope.new_state.bracket = [ 'new_bracket' ];
        this.new_rounds = [ 'round1', 'round2', 'round3' ];
        this.roundsService.registerNextRound.and.returnValue(this.new_rounds);

        this.scope.registerNextRound();
      });

      it('should update bracket', function() {
        expect(this.scope.state.bracket).toEqual([ 'new_bracket' ]);
      });

      it('should register next round', function() {
        expect(this.roundsService.registerNextRound)
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
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.stateService.resetBracket)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.srPairingService.suggestNextRound)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
          expect(this.scope.next_round[1])
            .toBe('srPairing.suggestNextRound.returnValue');
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });

      when('type is "bracket"', function() {
        this.type = 'bracket';
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.stateService.setBracket)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.bracketPairingService.suggestRound)
            .toHaveBeenCalledWith(this.scope.new_state, 1);
          expect(this.scope.next_round[1])
            .toBe('bracketPairing.suggestRound.returnValue');
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });
    });
  });

});
