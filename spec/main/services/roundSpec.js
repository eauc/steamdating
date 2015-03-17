'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('round', function() {

    var round;

    beforeEach(inject([ 'round', function(_round) {
      round = _round;
    }]));

    describe('gameForPlayer(<name>)', function() {
      var coll = [
        { p1: { name: 'toto'}, p2: {name: 'tata' } },
        { p1: { name: 'tutu'}, p2: {name: 'titi' } },
        { p1: { name: 't1' } , p2: { name: 't2' } }
      ];

      using([
        [ 'name'    , 'game'           ],
        [ 'toto'    , coll[0]          ],
        [ 'titi'    , coll[1]          ],
        [ 't2'      , coll[2]          ],
        [ 'unknown' , undefined        ],
      ], function(e, d) {
        it('should return game involving <name>, '+d, function() {
          expect(round.gameForPlayer(e.name, coll)).toBe(e.game);
        });
      });
    });

    describe('gamesForGroup(<players>, <group_index>)', function() {
      it('should extract games for <group_index>', function() {
        var coll = [
          { table: 1 },
          { table: 2 },
          { table: 3 },
          { table: 4 },
        ];
        var players = [ [ {}, {} ], [ {}, {}, {}, {} ], [ {}, {} ] ];
        expect(round.gamesForGroup(players, 1, coll)).toEqual([
          { table: 2 },
          { table: 3 }
        ]);
      });

      it('should handle groups with odd length', function() {
        var coll = [
          { table: 1 },
          { table: 2 },
          { table: 3 },
          { table: 4 },
        ];
        var players = [ [ {}, {}, {} ], [ {}, {}, {} ], [ {}, {} ] ];
        expect(round.gamesForGroup(players, 1, coll)).toEqual([
          { table: 3 },
          { table: 4 }
        ]);
      });
    });

    describe('pairedPlayers()', function() {
      it('should return list of paired players', function() {
        expect(round.pairedPlayers([
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p3' }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: 'p6' } } ]
        ])).toEqual([ 'p1', 'p2', 'p3', 'p4', 'p5', 'p6' ]);
        // uniq
        expect(round.pairedPlayers([
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: 'p2' }, p2: { name: 'p4' } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ])).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
        // without null/undefined
        expect(round.pairedPlayers([
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: null }, p2: { name: 'p4' } },
          { p1: { name: 'p5' }, p2: { name: undefined } }
        ])).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
      });
    });

    describe('isPlayerPaired(<player>)', function() {
      using([
        [ 'name' , 'isPaired' ],
        [ 'p2'   , true       ],
        [ 'p5'   , true       ],
        [ 'p3'   , false      ],
        [ null   , false      ],
      ], function(e, d) {
        it('should check whether <player> is paired, '+d, function() {
          this.coll = [
            { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p2' }, p2: { name: null } },
            { p1: { name: 'p5' }, p2: { name: 'p1' } }
          ];

          expect(round.isPlayerPaired({ name: e.name }, this.coll))
            .toBe(e.isPaired);
        });
      });
    });

    describe('updatePlayer(<game_index>, <player_key>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: 'p2' }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ];
      });

      it('should remove game[<game_index>][<player_key>] player from all other games', function() {
        expect(round.updatePlayer(1, 'p1', this.coll)).toEqual([
          { p1: { name: 'p1' }, p2: { name: null } },
          { p1: { name: 'p2' }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ]);

        expect(round.updatePlayer(0, 'p2', this.coll)).toEqual([
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: null }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ]);
      });
    });

    describe('updateTable(<game_index>, <min_table>)', function() {
      beforeEach(function() {
        this.coll = [
          { table:4, p1: { name: 'p1' }, p2: { name: 'p2' } },
          { table:5, p1: { name: 'p2' }, p2: { name: null } },
          { table:4, p1: { name: 'p5' }, p2: { name: 'p1' } }
        ];
      });

      it('should reorder tables', function() {
        expect(round.updateTable(2, 4, this.coll)).toEqual([
          { table : 4, p1 : { name : 'p5' }, p2 : { name : 'p1' } },
          { table : 5, p1 : { name : 'p2' }, p2 : { name : null } },
          { table : 6, p1 : { name : 'p1' }, p2 : { name : 'p2' } }
        ]);
      });
    });

    describe('allGamesHaveResult()', function() {
      it('should check whether all game have a defined result', function() {
        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          { p1: { name: 'p3', tournament: 0 }, p2: { name: null, tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(round.allGamesHaveResult(this.coll)).toBe(true);

        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          // this game has incomplete result
          { p1: { name: 'p3', tournament: null }, p2: { name: null, tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(round.allGamesHaveResult(this.coll)).toBe(false);
      });
    });

    describe('winners()', function() {
      it('should extract list of winners', function() {
        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          { p1: { name: 'p3', tournament: 0 }, p2: { name: null, tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(round.winners(this.coll)).toEqual(['p1', null, 'p5']);
      });
    });

    describe('losers()', function() {
      it('should extract list of winners', function() {
        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          { p1: { name: 'p3', tournament: 0 }, p2: { name: null, tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(round.losers(this.coll)).toEqual(['p2', undefined, 'p6']);
      });
    });
  });

});
