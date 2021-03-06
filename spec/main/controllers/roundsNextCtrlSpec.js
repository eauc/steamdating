'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsNextCtrl', function(c) {

    var initCtrl;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.stateService = spyOnService('state');
        this.stateService.playersNotDropedInLastRound._retVal = [ 'players_not_droped' ];
        this.stateService.createNextRound._retVal = ['state.createNextRound.returnValue'];
        this.srPairingService = spyOnService('srPairing');
        this.bracketPairingService = spyOnService('bracketPairing');
        this.gamesService = spyOnService('games');
        this.roundService = spyOnService('round');
        this.roundsService = spyOnService('rounds');

        var ctxt = this;
        initCtrl = function() {
          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.storeState = jasmine.createSpy('storeState');
          ctxt.state_players = [ 'players' ];
          ctxt.state_rounds = [ 'rounds' ];
          ctxt.scope.state = {
            players: ctxt.state_players,
            rounds: ctxt.state_rounds
          };

          $controller('roundsNextCtrl', { 
            '$scope': ctxt.scope,
          });
        };
        initCtrl();
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
        .toEqual([ 'state.createNextRound.returnValue' ]);
      expect(this.stateService.createNextRound)
        .toHaveBeenCalledWith(this.scope.state);
    });

    it('should players->rank hash', function() {
      expect(this.stateService.playerRankPairs)
        .toHaveBeenCalledWith(this.scope.state);
    });
    
    it('should init players options lists', function() {
      expect(this.scope.players_options).not.toBe(undefined);
    });

    describe('updatePlayer(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = { games: [ 'group1', 'group2', 'group3' ] };
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.updatePlayer(2,3,'key');
      });

      it('should update player names in next round for <gr_index> group', function() {
        expect(this.scope.next_round.games[2])
          .toBe('games.updatePlayer.returnValue');
        expect(this.gamesService.updatePlayer)
          .toHaveBeenCalledWith(3, 'key', 'group3');
      });

      it('should update players options lists', function() {
        expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
      });
    });

    describe('updateTable(<gr_index>,<ga_index>,<key>)', function() {
      beforeEach(function() {
        this.scope.next_round = { games: [ 'group1', 'group2', 'group3' ] };
        this.scope.tables_ranges = [[],[],[6,4,5]];
        spyOn(this.scope, 'updatePlayersOptions');

        this.scope.updateTable(2,3,'key');
      });

      it('should update tables in next round for <gr_index> group', function() {
        expect(this.scope.next_round.games[2])
          .toBe('games.updateTable.returnValue');
        expect(this.gamesService.updateTable)
          .toHaveBeenCalledWith(3, 4, 'group3');
      });

      it('should update players options lists', function() {
        expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
      });
    });

    describe('updatePlayersOptions()', function() {
      beforeEach(function() {
        this.stateService.playerRankPairs._retVal = [
          { paired11: 1, /* missing not_paired12: 1,*/ not_paired13: 3 },
          { not_paired21: 1, paired22: 2 },
        ];
        initCtrl();

        
        this.scope.players_options = null;
        this.stateService.playersNotDropedInLastRound._retVal = [
          [ { name: 'paired11' }, { name: 'not_paired12' }, { name: 'not_paired13' } ],
          [ { name: 'not_paired21' }, { name: 'paired22' } ],
        ];
        this.scope.new_state.rounds = ['rounds'];
        this.scope.next_round = { games: [ [ 'gr1g1', 'gr1g2' ], [ 'gr2g1' ] ] };
        this.gamesService.isPlayerPaired.and.callFake(function(p, r) {
          return s.startsWith(p.name, 'paired');
        });
        this.roundsService.pairAlreadyExists.calls.reset();
        this.roundsService.pairAlreadyExists.and.callFake(function(g, r) {
          return 'rounds.pairAlreadyExists.returnValue('+g+')';
        });
      });

      it('should request list of players not droped in last round', function() {
        expect(this.stateService.playersNotDropedInLastRound)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
      
      it('should update tables ranges list', function() {
        this.scope.updatePlayersOptions();

        expect(this.scope.tables_ranges).toEqual([[1,2],[3]]);
      });

      it('should update players options lists', function() {
        this.scope.updatePlayersOptions();

        expect(this.scope.players_options).toEqual([
          [ [ 'paired11', 'paired11 #1' ],
            [ 'not_paired12', '> not_paired12 #??' ],
            [ 'not_paired13', '> not_paired13 #3' ]
          ],
          [ [ 'not_paired21', '> not_paired21 #1' ],
            [ 'paired22', 'paired22 #2' ]
          ]
        ]);
      });

      it('should warn about paired already played', function() {
        this.scope.updatePlayersOptions();

        expect(this.stateService.evaluateRoundFitness)
          .toHaveBeenCalledWith(this.scope.next_round,
                                this.scope.new_state);
        expect(this.scope.round_fitness)
          .toEqual('state.evaluateRoundFitness.returnValue');
      });
    });
    
    describe('registerNextRound()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        
        this.scope.new_state.rounds = [ 'round1', 'round2' ];
        this.scope.new_state.bracket = [ 'new_bracket' ];
        this.new_rounds = [ 'round1', 'round2', 'round3' ];
        this.roundsService.registerNextRound.and.returnValue(this.new_rounds);

        this.scope.registerNextRound();
      });

      it('should update bracket', function() {
        expect(this.scope.state.bracket).toEqual([ 'new_bracket' ]);
      });

      it('should create subGames', function() {
        expect(this.playersService.maxTeamSize)
          .toHaveBeenCalledWith(['players']);
        expect(this.roundService.createSubGames)
          .toHaveBeenCalledWith('players.maxTeamSize.returnValue',
                                [ 'state.createNextRound.returnValue' ]);
      });

      it('should register next round', function() {
        expect(this.roundsService.registerNextRound)
          .toHaveBeenCalledWith('round.createSubGames.returnValue',
                                this.scope.new_state.rounds);
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
        this.scope.new_state.bracket = [ 'bracket' ];

        this.scope.next_round = { games: [ [], [] ] };
        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.roundService.resetBracketForGroup)
            .toHaveBeenCalledWith(1, { games: [ [], [] ] });
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.srPairingService.suggestNextRound)
            .toHaveBeenCalledWith(this.scope.new_state,
                                  1,
                                 'round.resetBracketForGroup.returnValue');
          expect(this.scope.next_round)
            .toBe('srPairing.suggestNextRound.returnValue');
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });

      when('type is "bracket"', function() {
        this.type = 'bracket';
        spyOn(this.scope, 'updatePlayersOptions');
        this.scope.new_state.bracket = [ 'bracket' ];

        this.scope.next_round = { games: [ [], [] ] };
        this.scope.suggestNextRound(1, this.type);
      }, function() {
        it('should reset bracket for this group', function() {
          expect(this.roundService.bracketForGroup)
            .toHaveBeenCalledWith(1, 'rounds');
          expect(this.roundService.setBracketForGroup)
            .toHaveBeenCalledWith(1,
                                  'round.bracketForGroup.returnValue',
                                  { games: [ [], [] ] });
        });

        it('should suggest SR pairing for <group_index>', function() {
          expect(this.bracketPairingService.suggestRound)
            .toHaveBeenCalledWith(this.scope.new_state,
                                  1,
                                  'round.setBracketForGroup.returnValue');
          expect(this.scope.next_round)
            .toBe('bracketPairing.suggestRound.returnValue');
        });

        it('should update players options lists', function() {
          expect(this.scope.updatePlayersOptions).toHaveBeenCalled();
        });
      });
    });
  });

});
