'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('players', function() {

    var players;

    beforeEach(inject([ 'players', function(_players) {
      players = _players;
    }]));

    describe('add(<player>, <group>)', function() {
      beforeEach(function() {
        this.coll = [
          [],
          [],
          []
        ];
      });

      it('should add <player> to <group>', function() {
        expect(players.add(this.coll, {name: 'toto2'}, 1)).toEqual([
          [],
          [
            { name: 'toto2' },
          ],
          []
        ]);
      });
    });

    describe('drop(<player>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ];
      });

      it('should drop <player> from any group', function() {
        expect(players.drop(this.coll, {name: 'toto2'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ]);
        expect(players.drop(this.coll, {name: 'tutu1'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu2' },
          ]
        ]);
      });

      it('should drop empty groups', function() {
        expect(players.drop(this.coll, {name: 'tata1'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ]);
      });
    });

    describe('player(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
            { name: 'tata2' },
          ]
        ];
      });

      it('should return player', function() {
        expect(players.player(this.coll, 'tata2')).toBe(this.coll[1][1]);
      });
    });

    describe('names()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
            { name: 'tata2' },
          ]
        ];
      });

      it('should return player names list', function() {
        expect(players.names(this.coll)).toEqual([
          'toto1', 'toto2', 'toto3', 'tata1', 'tata2'
        ]);
      });
    });

    describe('cities()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { city: 'toto1' },
            { city: 'toto2' },
            { city: 'toto1' },
          ],
          [
            { city: 'tata1' },
            { city: undefined },
          ],
          [
            { city: 'tata1' },
            { city: 'tutu2' },
          ]
        ];
      });

      it('should return uniq city names list', function() {
        expect(players.cities(this.coll)).toEqual([
          'toto1', 'toto2', 'tata1', 'tutu2'
        ]);
      });
    });

    describe('factions(<base_factions>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { faction: 'toto1' },
            { faction: 'toto2' },
            { faction: 'toto1' },
          ],
          [
            { faction: 'tata1' },
            { faction: undefined },
          ],
          [
            { faction: 'tata1' },
            { faction: 'tutu2' },
          ]
        ];
      });

      it('should return uniq faction names list appended with base factions', function() {
        expect(players.factions(this.coll, { toto2: {}, base1: {} })).toEqual([
          'toto1', 'toto2', 'tata1', 'tutu2', 'base1'
        ]);
      });
    });

    describe('updateListsPlayed(<rounds>)', function() {
      beforeEach(inject(function(rounds) {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
            { name: 'tata2' },
          ]
        ];

        this.rounds = rounds;
        this.dummy_lists = [ 'toto' ];
        spyOn(rounds, 'listsForPlayer').and.returnValue(this.dummy_lists);
      }));

      it('should update lists played in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];

        var res = players.updateListsPlayed(this.coll, dummy_rounds);

        expect(this.rounds.listsForPlayer.calls.count()).toBe(5);
        expect(res[0][2].lists_played).toBe(this.dummy_lists);
        expect(res[1][1].lists_played).toBe(this.dummy_lists);
      });
    });

    describe('updatePoints(<rounds>)', function() {
      beforeEach(inject(function(rounds) {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
            { name: 'tata2' },
          ]
        ];

        this.rounds = rounds;
        this.dummy_points = [ 'toto' ];
        spyOn(rounds, 'pointsForPlayer').and.returnValue(this.dummy_points);
        this.dummy_opps = [ 'opps' ];
        spyOn(rounds, 'opponentsForPlayer').and.returnValue(this.dummy_opps);

        spyOn(players, 'sosFromPlayers').and.returnValue(45);
      }));

      it('should update points gained in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];

        var res = players.updatePoints(this.coll, dummy_rounds);

        expect(this.rounds.pointsForPlayer.calls.count()).toBe(5);
        expect(res[0][2].points).toBe(this.dummy_points);
        expect(res[1][1].points).toBe(this.dummy_points);
      });

      it('should update SoS gained in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];

        var res = players.updatePoints(this.coll, dummy_rounds);

        expect(this.rounds.opponentsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, jasmine.any(String));
        expect(this.rounds.opponentsForPlayer.calls.count()).toBe(5);

        expect(players.sosFromPlayers)
          .toHaveBeenCalledWith(jasmine.any(Object), this.dummy_opps);
        expect(players.sosFromPlayers.calls.count()).toBe(5);

        expect(res[0][2].points.sos).toBe(45);
        expect(res[1][1].points.sos).toBe(45);
      });
    });

    describe('sosFromPlayers(<players>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1', points: { tournament: 1 } },
            { name: 'toto2', points: { tournament: 2 } },
            { name: 'toto3', points: { tournament: 3 } },
          ],
          [
            { name: 'tata1', points: { tournament: 4 } },
            { name: 'tata2', points: { tournament: 5 } },
          ]
        ];
      });

      it('should return SoS calculated from <players>', function() {
        expect(players.sosFromPlayers(this.coll, ['toto1', 'toto3', 'tata2']))
          .toEqual(9);
        expect(players.sosFromPlayers(this.coll, ['toto2', 'tata1']))
          .toEqual(6);
      });
    });

    describe('sort(<state>)', function() {
      beforeEach(function() {
        this.coll = [ 'group1', 'group2', 'group3' ];
        this.state = {
          rounds: _.repeat(4, {}),
          ranking: {}
        };
        spyOn(players, 'sortGroup').and.callFake(function(g) { return g+'sorted'; });
      });

      it('should sort each group using players.sortGroup', function() {
        expect(players.sort(this.coll, this.state)).toEqual([ 'group1sorted',
                                                              'group2sorted', 
                                                              'group3sorted' ]);
      });
    });

    describe('sortGroup(<state>)', function() {
      beforeEach(function() {
        this.coll = [
          { name: '1', points: { tournament: 1, sos: 5, control: 3, army: 5 } },
          { name: '2', points: { tournament: 2, sos: 4, control: 5, army: 25 } },
          { name: '3', points: { tournament: 3, sos: 3, control: 2, army: 35 } },
          { name: '4', points: { tournament: 4, sos: 2, control: 1, army: 35 } },
          { name: '5', points: { tournament: 5, sos: 1, control: 4, army: 150 } },
        ];
        this.state = {
          rounds: _.repeat(4, {}),
          ranking: {}
        };
      });

      it('should sort group using <state.ranking.player> criterion', function() {
        this.state.ranking.player = 'sos';
        var res = players.sortGroup(this.coll, this.state);
        expect(res).toEqual({
          1: [{ name: '1', points: { tournament: 1, sos: 5, control: 3, army: 5 } }],
          2: [{ name: '2', points: { tournament: 2, sos: 4, control: 5, army: 25 } }],
          3: [{ name: '3', points: { tournament: 3, sos: 3, control: 2, army: 35 } }],
          4: [{ name: '4', points: { tournament: 4, sos: 2, control: 1, army: 35 } }],
          5: [{ name: '5', points: { tournament: 5, sos: 1, control: 4, army: 150 } }],
        });

        this.state.ranking.player = 'tp';
        res = players.sortGroup(this.coll, this.state);
        expect(res).toEqual({
          1: [{ name: '5', points: { tournament: 5, sos: 1, control: 4, army: 150 } }],
          2: [{ name: '4', points: { tournament: 4, sos: 2, control: 1, army: 35 } }],
          3: [{ name: '3', points: { tournament: 3, sos: 3, control: 2, army: 35 } }],
          4: [{ name: '2', points: { tournament: 2, sos: 4, control: 5, army: 25 } }],
          5: [{ name: '1', points: { tournament: 1, sos: 5, control: 3, army: 5 } }],
        });

        this.state.ranking.player = 'cp';
        res = players.sortGroup(this.coll, this.state);
        expect(res).toEqual({
          1: [{ name: '2', points: { tournament: 2, sos: 4, control: 5, army: 25 } }],
          2: [{ name: '5', points: { tournament: 5, sos: 1, control: 4, army: 150 } }],
          3: [{ name: '1', points: { tournament: 1, sos: 5, control: 3, army: 5 } }],
          4: [{ name: '3', points: { tournament: 3, sos: 3, control: 2, army: 35 } }],
          5: [{ name: '4', points: { tournament: 4, sos: 2, control: 1, army: 35 } }],
        });

        this.state.ranking.player = 'ap';
        res = players.sortGroup(this.coll, this.state);
        expect(res).toEqual({
          1: [{ name: '5', points: { tournament: 5, sos: 1, control: 4, army: 150 } }],
          2: [{ name: '3', points: { tournament: 3, sos: 3, control: 2, army: 35 } },
              { name: '4', points: { tournament: 4, sos: 2, control: 1, army: 35 } }],
          4: [{ name: '2', points: { tournament: 2, sos: 4, control: 5, army: 25 } }],
          5: [{ name: '1', points: { tournament: 1, sos: 5, control: 3, army: 5 } }],
        });
      });
    });
  });

});
