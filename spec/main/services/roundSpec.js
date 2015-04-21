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

    describe('create(<players>)', function() {
      beforeEach(inject(function(game) {
        spyOn(game, 'create').and.callFake(function(g) { return 'table'+g.table ; });
        this.game = game;
      }));

      it('should create new games for each player groups', function() {
        var ret = round.create([
          [ 'player1', 'player2', 'player3', 'player4' ],
          [ ],
          [ 'player5', 'player6' ],
        ]);
        expect(ret).toEqual({ games: [
          [ 'table1', 'table2' ],
          [ ],
          [ 'table3' ],
        ] });
        expect(this.game.create).toHaveBeenCalled();
        expect(this.game.create.calls.count()).toBe(3);
      });
    });

    describe('hasGamesGroups()', function() {
      using([
        [ 'round' , 'hasGamesGroups' ],
        [ []      , false      ],
        [ [[]]    , false      ],
        [ [[],[]] , true       ],
      ], function(e, d) {
        it('should check whether <round> as groups, '+d, function() {
          expect(round.hasGamesGroups({ games: e.round }))
            .toBe(e.hasGamesGroups);
        });
      });
    });

    describe('gameForPlayer(<name>)', function() {
      var coll = [
        [ { p1: { name: 'toto'}, p2: {name: 'tata' } },
          { p1: { name: 'tutu'}, p2: {name: 'titi' } }
        ],
        [ { p1: { name: 't1' } , p2: { name: 't2' } }
        ]
      ];

      using([
        [ 'name'    , 'game'           ],
        [ 'toto'    , coll[0][0]       ],
        [ 'titi'    , coll[0][1]       ],
        [ 't2'      , coll[1][0]       ],
        [ 'unknown' , undefined        ],
      ], function(e, d) {
        it('should return game involving <name>, '+d, function() {
          expect(round.gameForPlayer(e.name, { games: coll}))
            .toBe(e.game);
        });
      });
    });

    describe('gamesForGroup(<group_index>)', function() {
      it('should extract games for <group_index>', function() {
        var coll = [
          [ { table: 1 } ],
          [ { table: 2 },
            { table: 3 } ],
          [ { table: 4 } ],
        ];
        var players = [ [ {}, {} ], [ {}, {}, {}, {} ], [ {}, {} ] ];
        expect(round.gamesForGroup(1, { games: coll})).toEqual([
          { table: 2 },
          { table: 3 }
        ]);
      });

      it('should handle groups with odd length', function() {
        var coll = [
          [ { table: 1 },
            { table: 2 } ],
          [ { table: 3 },
            { table: 4 } ],
        ];
        var players = [ [ {}, {}, {} ], [ {}, {}, {} ], [ {}, {} ] ];
        expect(round.gamesForGroup(1, { games: coll })).toEqual([
          { table: 3 },
          { table: 4 }
        ]);
      });
    });

    describe('pairedPlayers()', function() {
      it('should return list of paired players', function() {
        expect(round.pairedPlayers({ games: [
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p3' }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: 'p6' } } ]
        ]})).toEqual([ 'p1', 'p2', 'p3', 'p4', 'p5', 'p6' ]);
        // uniq
        expect(round.pairedPlayers({ games: [
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p2' }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: 'p1' } } ]
        ]})).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
        // without null/undefined
        expect(round.pairedPlayers({ games: [
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: null }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: undefined } } ]
        ]})).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
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
          this.coll = { games: [
            [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
              { p1: { name: 'p2' }, p2: { name: null } } ],
            [ { p1: { name: 'p5' }, p2: { name: 'p1' } } ]
          ] };

          expect(round.isPlayerPaired({ name: e.name }, this.coll))
            .toBe(e.isPaired);
        });
      });
    });

    describe('allGamesHaveResult()', function() {
      it('should check whether all game have a defined result', function() {
        this.coll = { games: [
          [ { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
            { p1: { name: 'p3', tournament: 0 }, p2: { name: null, tournament: 1 } } ],
          [ { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } } ]
        ] };

        expect(round.allGamesHaveResult(this.coll)).toBe(true);

        this.coll = { games: [
          [ { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
            // this game has incomplete result
            { p1: { name: 'p3', tournament: null }, p2: { name: null, tournament: 1 } } ],
          [ { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } } ]
        ] };

        expect(round.allGamesHaveResult(this.coll)).toBe(false);
      });
    });
  });

});
