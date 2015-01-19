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
        spyOn(_, 'shuffle').and.callFake(function(a) { return a; });
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
        _.shuffle.and.callFake(function(a) {
          // reverse-sort by 'name' property
          return _.sortBy(a, _.property('name')).reverse();
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
          { name: 'p1', city: 'same', points: { tournament: 1 } },
          { name: 'p2', city: 'other', points: { tournament: 1 } },
          { name: 'p3', city: 'same', points: { tournament: 0 } },
          { name: 'p4', city: 'other', points: { tournament: 0 } },
        ];
        this.for_player = { name: 'p5', city: 'same', points: { tournament: 2 } };
      });

      it('should sort players from other cities first', function() {
        expect(srPairing.sortAvailablePlayersFor(this.players, this.for_player))
          .toEqual([ 'p2', 'p1', 'p4', 'p3' ]);
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
      beforeEach(inject(function(rounds, basePairing) {
        this.tables = [ 41, 42, 43 ];
        this.sorted_players = [
          { name: 'p5', city: 'same', points: { tournament: 2 } },
          { name: 'p1', city: 'same', points: { tournament: 1 } },
          { name: 'p4', city: 'other', points: { tournament: 1 } },
          { name: 'p2', city: 'same', points: { tournament: 0 } },
          { name: 'p3', city: 'other', points: { tournament: 0 } },
        ];
        this.dummy_rounds = ['rounds'];
        this.opponents = [ 'p4', 'p1' ];
        this.rounds = rounds;
        spyOn(rounds, 'opponentsForPlayer').and.returnValue(this.opponents);

        this.table = 42;
        this.basePairing = basePairing;
        spyOn(basePairing, 'suggestTableFor').and.returnValue(this.table);

        var res = srPairing.findNextPairing(this.dummy_rounds,
                                            this.sorted_players,
                                            this.tables);
        this.res_game = res[0];
        this.res_players = res[1];
        this.res_tables = res[2];
      }));

      it('should request opponents list for first player', function() {
        expect(this.rounds.opponentsForPlayer)
          .toHaveBeenCalledWith(this.dummy_rounds, 'p5');
      });

      it('should find new opponent from another city for first player', function() {
        expect(this.res_game.p1.name).toBe('p5');
        expect(this.res_game.p2.name).toBe('p3');
      });

      it('should request table suggestion for both players', function() {
        expect(this.basePairing.suggestTableFor)
          .toHaveBeenCalledWith(this.dummy_rounds, this.tables, 'p5', 'p3');
      });

      it('should find new table for both players', function() {
        expect(this.res_game.table).toBe(42);
      });

      it('should return players list with both players removed', function() {
        expect(this.res_players).toEqual([
          { name: 'p1', city: 'same', points: { tournament: 1 } },
          { name: 'p4', city: 'other', points: { tournament: 1 } },
          { name: 'p2', city: 'same', points: { tournament: 0 } },
        ]);
      });

      it('should return tables list with used table removed', function() {
        expect(this.res_tables).toEqual([ 41, 43 ]);
      });
    });

    describe('suggestNextSingleRound(<state>, <group_index>)', function() {
      beforeEach(inject(function(basePairing) {
        this.games = [{table: 3},{table: 1},{table: 2}];
        this.tables = [['tables1'],['tables2'],['tables3'],[]];
        this.players= [['players1'],['players2'],['players3'],[]];
        var i = 0;
        var ctxt = this;
        spyOn(srPairing, 'findNextPairing').and.callFake(function() {
          var ret = [ ctxt.games[i], ctxt.players[i+1], ctxt.tables[i+1] ];
          i++;
          return ret;
        });
        spyOn(srPairing, 'sortPlayers').and.returnValue(this.players[0]);
        this.basePairing = basePairing;
        spyOn(basePairing, 'tableRangeForGroup').and.returnValue(this.tables[0]);

        this.state = {
          rounds: [ 'rounds' ],
          players: [
            [],
            [ 'p2','p3','p4','p5','p6','p1' ]
          ]
        };

        this.suggest = srPairing.suggestNextRound(this.state, 1);
      }));

      it('should build table range', function() {
        expect(this.basePairing.tableRangeForGroup)
          .toHaveBeenCalledWith(this.state.players, 1);
      });

      it('should build sorted players list', function() {
        expect(srPairing.sortPlayers)
          .toHaveBeenCalledWith(this.state.players[1]);
      });

      it('should recursively find pairings', function() {
        expect(srPairing.findNextPairing.calls.count())
          .toBe(this.state.players[1].length/2);

        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.players[0],
                                this.tables[0]);
        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.players[1],
                                this.tables[1]);
        expect(srPairing.findNextPairing)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.players[2],
                                this.tables[2]);
      });

      it('should return sorted game list', function() {
        expect(this.suggest).toEqual([{table: 1},{table: 2},{table: 3}]);
      });
    });
  });

});
