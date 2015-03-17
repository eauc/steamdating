'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('srPairing', function() {

    var srPairing;

    beforeEach(inject([ 'srPairing', function(_srPairing) {
      srPairing = _srPairing;
    }]));

    describe('sortPlayers(<players>)', function() {
      beforeEach(function() {
        this.players = [
          { name: 'p1', points: { tournament: 1 } },
          { name: 'p2', points: { tournament: 0 } },
          { name: 'p3', points: { tournament: 0 } },
          { name: 'p4', points: { tournament: 1 } },
          { name: 'p5', points: { tournament: 2 } },
        ];
        spyOn(R, 'shuffle').and.callFake(function(a) { return a; });
      });

      it('should sort players by reverse tournament points', function() {
        expect(srPairing.sortPlayers(this.players)).toEqual([
          { name: 'p5', points: { tournament: 2 } },
          { name: 'p4', points: { tournament: 1 } },
          { name: 'p1', points: { tournament: 1 } },
          { name: 'p3', points: { tournament: 0 } },
          { name: 'p2', points: { tournament: 0 } },
        ]);
      });

      it('should shuffle players inside each tournament points group', function() {
        R.shuffle.and.callFake(function(a) {
          // reverse-sort by 'name' property
          return R.sortBy(R.prop('name'), a).reverse();
        });

        expect(srPairing.sortPlayers(this.players)).toEqual([
          { name: 'p5', points: { tournament: 2 } },
          { name: 'p1', points: { tournament: 1 } },
          { name: 'p4', points: { tournament: 1 } },
          { name: 'p2', points: { tournament: 0 } },
          { name: 'p3', points: { tournament: 0 } },
        ]);
      });
    });

    describe('sortAvailablePlayersFor(<players>, <for_player>)', function() {
      beforeEach(function() {
        this.players = [
          { name: 'p1', origin: 'same', points: { tournament: 1 } },
          { name: 'p2', origin: 'other', points: { tournament: 1 } },
          { name: 'p3', origin: 'same', points: { tournament: 0 } },
          { name: 'p4', origin: 'other', points: { tournament: 0 } },
        ];
        this.for_player = { name: 'p5', origin: 'same', points: { tournament: 2 } };
      });

      it('should sort players from other cities first', function() {
        expect(srPairing.sortAvailablePlayersFor(this.players, this.for_player))
          .toEqual([ 'p2', 'p1', 'p4', 'p3' ]);
      });

      it('should handle phantom player corrrectly', function() {
        this.players.push({ name: '_phantom_' });
        // phantom player is injected by suggestNextRound when group size is odd
        // should be placed at the end of the availables
        expect(srPairing.sortAvailablePlayersFor(this.players, this.for_player))
          .toEqual([ 'p2', 'p1', 'p4', 'p3', '_phantom_' ]);
      });
    });

    describe('suggestOpponentFor(<opponents>, <availables>)', function() {
      when('no new opponent is available', function() {
        this.opponents = [ 'p1', 'p2', 'p3', 'p4' ];
        this.availables = [ 'p1', 'p2', 'p3', 'p4' ];
      }, function() {
        it('should suggest first available player', function() {
          expect(srPairing.suggestOpponentFor(this.opponents, this.availables)).toBe('p1');
        });
      });

      when('new opponents are availables', function() {
        this.opponents = [ 'p1', 'p3' ];
        this.availables = [ 'p1', 'p2', 'p3', 'p4' ];
      }, function() {
        it('should suggest first available new opponent', function() {
          expect(srPairing.suggestOpponentFor(this.opponents, this.availables)).toBe('p2');
        });
      });
    });

    describe('findNextPairing(<rounds>, <players>, <tables>)', function() {
      beforeEach(function() {
        this.tables = [ 41, 42, 43 ];
        this.tables_groups_size = 4;
        this.sorted_players = [
          { name: 'p5', origin: 'same', points: { tournament: 2 } },
          { name: 'p1', origin: 'same', points: { tournament: 1 } },
          { name: 'p4', origin: 'other', points: { tournament: 1 } },
          { name: 'p2', origin: 'same', points: { tournament: 0 } },
          { name: 'p3', origin: 'other', points: { tournament: 0 } },
        ];
        this.dummy_rounds = ['rounds'];
        this.opponents = [ 'p4', 'p1' ];
        this.roundsService = spyOnService('rounds');
        this.roundsService.opponentsForPlayer._retVal = this.opponents;

        this.basePairingService = spyOnService('basePairing');
        this.basePairingService.suggestTableFor._retVal = 42;

        var res = srPairing.findNextPairing(this.dummy_rounds,
                                            this.sorted_players,
                                            this.tables,
                                            this.tables_groups_size);
        this.res_game = res[0];
        this.res_players = res[1];
        this.res_tables = res[2];
      });

      it('should request opponents list for first player', function() {
        expect(this.roundsService.opponentsForPlayer)
          .toHaveBeenCalledWith('p5', this.dummy_rounds);
      });

      it('should find new opponent from another origin for first player', function() {
        expect(this.res_game.p1.name).toBe('p5');
        expect(this.res_game.p2.name).toBe('p3');
      });

      it('should request table suggestion for both players', function() {
        expect(this.basePairingService.suggestTableFor)
          .toHaveBeenCalledWith(this.dummy_rounds, this.tables,
                                'p5', 'p3',
                                this.tables_groups_size);
      });

      it('should find new table for both players', function() {
        expect(this.res_game.table).toBe(42);
      });

      it('should return players list with both players removed', function() {
        expect(this.res_players).toEqual([
          { name: 'p1', origin: 'same', points: { tournament: 1 } },
          { name: 'p4', origin: 'other', points: { tournament: 1 } },
          { name: 'p2', origin: 'same', points: { tournament: 0 } },
        ]);
      });

      it('should return tables list with used table removed', function() {
        expect(this.res_tables).toEqual([ 41, 43 ]);
      });
    });

    describe('suggestNextSingleRound(<state>, <group_index>)', function() {
      beforeEach(function() {
        this.games = [{table: 3},{table: 1},{table: 2}];
        this.tables = [['tables1'],['tables2'],['tables3'],[]];
        this.sorted_players = [['player11','player12'],['players2'],['players3'],[]];
        this.i = 0;
        var ctxt = this;
        spyOn(srPairing, 'findNextPairing').and.callFake(function() {
          var ret = [ ctxt.games[ctxt.i],
                      ctxt.sorted_players[ctxt.i+1],
                      ctxt.tables[ctxt.i+1]
                    ];
          ctxt.i++;
          return ret;
        });
        spyOn(srPairing, 'sortPlayers')
          .and.returnValue(this.sorted_players[0]);
        
        this.playersService = spyOnService('players');
        this.stateService = spyOnService('state');
        this.players_not_droped = [
          [],
          [ 'p2','p3','p4','p5','p6','p1' ]
        ];
        this.stateService.playersNotDropedInLastRound._retVal = this.players_not_droped;
        this.state = {
          rounds: [ 'rounds' ],
          players: [ 'players' ],
          tables_groups_size: 4
        };

        this.suggest = srPairing.suggestNextRound(this.state, 1);
      });

      it('should request list of not droped players', function() {
        expect(this.stateService.playersNotDropedInLastRound)
          .toHaveBeenCalledWith(this.state);
      });

      it('should build table range', function() {
        expect(this.playersService.tableRangeForGroup)
          .toHaveBeenCalledWith(1, this.players_not_droped);
      });

      it('should build sorted players list', function() {
        expect(srPairing.sortPlayers)
          .toHaveBeenCalledWith(this.players_not_droped[1]);
      });

      it('should recursively find pairings', function() {
        expect(srPairing.findNextPairing.calls.count())
          .toBe(this.players_not_droped[1].length/2);

        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                ['player11', 'player12'],
                                'players.tableRangeForGroup.returnValue',
                                this.state.tables_groups_size);
        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.sorted_players[1],
                                this.tables[1],
                                this.state.tables_groups_size);
        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.sorted_players[2],
                                this.tables[2],
                                this.state.tables_groups_size);
      });

      when('group size is odd', function() {
        srPairing.findNextPairing.calls.reset();
        srPairing.sortPlayers.and.returnValue(['player11']);
        this.i = 0;

        this.suggest = srPairing.suggestNextRound(this.state, 1);
      }, function() {
        it('should insert phantom player', function() {
          expect(srPairing.findNextPairing)
            .toHaveBeenCalledWith(this.state.rounds,
                                  ['player11', { name:'_phantom_' }],
                                  'players.tableRangeForGroup.returnValue',
                                  this.state.tables_groups_size);
        });
      });

      it('should return sorted game list', function() {
        expect(this.suggest).toEqual([{table: 1},{table: 2},{table: 3}]);
      });
    });
  });

});
