'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('rounds', function() {

    var rounds;

    beforeEach(inject([ 'rounds', function(_rounds) {
      rounds = _rounds;
    }]));

    describe('lastRoundIsComplete(<name>)', function() {
      beforeEach(function() {
        this.roundService = spyOnService('round');
      });

      when('<coll> is empty', function() {
      }, function() {
        it('should return true', function() {
          expect(rounds.lastRoundIsComplete([])).toBe(true);
        });
      });

      when('<coll> is empty', function() {
        this.coll = [ 'first', 'last' ];
      }, function() {
        it('should check whether last round is complete', function() {
          expect(rounds.lastRoundIsComplete(this.coll))
            .toBe('round.allGamesHaveResult.returnValue');
          expect(this.roundService.allGamesHaveResult)
            .toHaveBeenCalledWith('last');
        });
      });
    });

    describe('gamesForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: 'caster5'  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
          { games: [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: null  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
        ];
      });

      using([
        [ 'name'   , 'games' ],
        // uniq
        [ 'toto'   , [{ p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' } },
                      { p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' } }
                     ] ],
        // without null
        [ 'titi'   , [{ p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : 'caster5' } },
                      { p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : null } }
                     ] ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return games played by <name>, '+d, function() {
          expect(rounds.gamesForPlayer(e.name, this.coll)).toEqual(e.games);
        });
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: 'caster5'  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
          { games: [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: null  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
        ];
      });

      using([
        [ 'name'   , 'lists'                ],
        // uniq
        [ 'toto'   , ['caster1']            ],
        // without null
        [ 'titi'   , ['caster5']            ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return lists played by <name>, '+d, function() {
          expect(rounds.listsForPlayer(e.name, this.coll)).toEqual(e.lists);
        });
      });
    });

    describe('drop(<index>)', function() {
      it('should remove <index> from collection', function() {
        expect(rounds.drop(1, [ 'r1', 'r2', 'r3' ])).toEqual([ 'r1', 'r3' ]);
      });
    });

    describe('pointsForPlayer(<name>, <group_index>, <bracket_weight>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { victory: 'assassination',
              p1: { name: 'toto', tournament: 1,
                    control: 2, army: 3, custom_field: 6 } }
          ] },
          { games: [
            { victory: 'assassination',
              p1: { name: 'other' },
              p2: { name: 'toto', tournament: 10,
                    control: 20, army: 30, custom_field: 60 } }
          ] },
          { games: [
            /* round without a game for this player */
            { victory: 'assassination',
              p1: { name: 'other' },
              p2: { name: 'another' }, games: [] }
          ] },
          { games: [ /* empty round */ ] },
          { games: [
            { victory: 'assassination',
              p1: { name: 'toto', tournament: 100,
                    control: 200, army: 300, custom_field: 600 } }
          ] },
        ];
      });

      when('bracket is not defined', function() {
        R.forEach(function(round) {
          round.bracket = [undefined];
        }, this.coll);
      }, function(){
        it('should sum points for <name>', function() {
          // uniq
          expect(rounds.pointsForPlayer('toto', 0, 32,
                                        this.coll))
            .toEqual({
              bracket: 0,
              tournament : 111,
              control: 222,
              army: 333,
              custom_field: 666,
              sos: 0,
              assassination: 1
            });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        using([
          [ 'brackets'                 , 'points' ],
          // bracket from start
          [ [1,2,3,4,5]                , { bracket: 392,
                                           tournament : 111,
                                           control: 222,
                                           army: 333,
                                           custom_field: 666,
                                           sos: 0,
                                           assassination: 1 } ],
          // started after a few rounds
          [ [null,null,1,2,3]          , { bracket: 800,
                                           tournament : 111,
                                           control: 222,
                                           army: 333,
                                           custom_field: 666,
                                           sos: 0,
                                           assassination: 1 } ],
          // not yet started
          [ [null,null,null,null,null] , { bracket: 0,
                                           tournament : 111,
                                           control: 222,
                                           army: 333,
                                           custom_field: 666,
                                           sos: 0,
                                           assassination: 1 } ],
        ], function(e, d) {
          it('should sum points for <name>, '+d, function() {
            R.forEachIndexed(function(round, index) {
              round.bracket = [e.brackets[index]];
            }, this.coll);
            
            expect(rounds.pointsForPlayer('toto', 0, 32,
                                          this.coll))
              .toEqual(e.points);
          });
        });
      });
    });

    describe('opponentsForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { p1: { name: 'toto' }, p2: { name: 'tata' } },
            { p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
          { games: [
            { p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { p1: { name: 'tata' }, p2: { name: undefined } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
        ];
      });

      using([
        [ 'name'    , 'opponents'      ],
        [ 'toto'    , ['tata', 'tutu'] ],
        // without null
        [ 'tata'    , ['toto']         ],
        // missing a game
        [ 'titi'    , ['tutu']         ],
        // undefined player
        [ 'unknown' , []               ],
      ], function(e, d) {
        it('should return opponents played by <name>, '+d, function() {
          expect(rounds.opponentsForPlayer(e.name, this.coll))
            .toEqual(e.opponents);
        });
      });
    });

    describe('pairAlreadyExist(<game>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { p1: { name: 'toto' }, p2: { name: 'tata' } },
            { p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
          { games: [
            { p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { p1: { name: 'tata' }, p2: { name: undefined } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
        ];
      });

      using([
        [ 'game'                                         , 'already' ],
        [ { p1: { name: 'toto' }, p2: { name: null } }   , false     ],
        [ { p1: { name: null }, p2: { name: 'tata' } }   , false     ],
        [ { p1: { name: 'toto' }, p2: { name: 'tata' } } , true      ],
        [ { p1: { name: 'toto' }, p2: { name: 'titi' } } , false     ],
      ], function(e, d) {
        it('should check whether the players of <game> have already beeen paired, '+d, function() {
          expect(rounds.pairAlreadyExists(e.game, this.coll))
            .toBe(e.already);
        });
      });
    });
    
    describe('registerNextRound(<next_round>)', function() {
      it('should append flattened <next_round> to <coll>', function() {
        expect(rounds.registerNextRound([ ['group1'], ['group2'] ],
                                        [ ['round1'], ['round2'] ]))
          .toEqual([
            ['round1'],
            ['round2'],
            [ ['group1'], ['group2'] ]
          ]);
      });
    });

    describe('tablesForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { games: [
            { table: 1, p1: { name: 'toto' }, p2: { name: 'tata' } },
            { table: 2, p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { table: 3, p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
          { games: [
            { table: 3, p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { table: 2, p1: { name: 'tata' }, p2: { name: undefined } },
            { table: 1, p1: { name: 't1' }, p2: { name: 't2' } }
          ] },
        ];
      });

      using([
        [ 'name'    , 'tables' ],
        [ 'toto'    , [1, 3]   ],
        // without null
        [ 'tata'    , [1, 2]   ],
        // missing a game
        [ 'titi'    , [2]      ],
        // undefined player
        [ 'unknown' , []       ],
      ], function(e, d) {
        it('should return tables played on by <name>, '+d, function() {
          expect(rounds.tablesForPlayer(e.name, this.coll))
            .toEqual(e.tables);
        });
      });
    });

    describe('tableGroup', function() {
      using([
        [ 'group_size', 'table', 'group' ],
        [ 1           , 42     , 42      ],
        [ 3           , 1      , 1       ],
        [ 3           , 3      , 1       ],
        [ 3           , 4      , 2       ],
        [ 3           , 6      , 2       ],
      ], function(e, d) {
        it('should compute the <group> for <table>, '+d, function() {
          expect(rounds.tableGroup(e.group_size, e.table)).toBe(e.group);
        });
      });
    });

    describe('tablesGroups', function() {
      using([
        [ 'group_size', 'tables'        , 'groups'       ],
        [ 1           , [ 34, 42, 71 ]  , [ 34, 42, 71 ] ],
        [ 3           , [ 1, 4, 7, 10 ] , [ 1, 2, 3, 4 ] ],
        // uniq
        [ 3           , [ 1, 3, 5, 6 ]  , [ 1, 2 ]       ],
      ], function(e, d) {
        it('should compute the <group> for <table>, '+d, function() {
          expect(rounds.tablesGroups(e.group_size, e.tables)).toEqual(e.groups);
        });
      });
    });

    describe('tableAlreadyPlayed', function() {
      using([
        [ 'group_size', 'game_p1', 'game_p2', 'game_table' , 'p1_tables', 'p2_tables', 'already' ],
        // empty rounds
        [ 1           , 'p1'     , 'p2'     , 34           , [ ]        , [ ]        , false     ],
        // no tables groups
        [ 1           , 'p1'     , 'p2'     , 3            , [ 1, 2 ]   , [ 1, 4 ]   , false     ],
        // player1 already
        [ 1           , 'p1'     , 'p2'     , 3            , [ 1, 3 ]   , [ 1, 4 ]   , true      ],
        // player2 already
        [ 1           , 'p1'     , 'p2'     , 3            , [ 1, 2 ]   , [ 3, 4 ]   , true      ],
        // with tables groups
        [ 3           , 'p1'     , 'p2'     , 5            , [ 1, 7 ]   , [ 2, 3 ]   , false     ],
        // player1 already
        [ 3           , 'p1'     , 'p2'     , 5            , [ 1, 6 ]   , [ 2, 3 ]   , true      ],
        // player2 already
        [ 3           , 'p1'     , 'p2'     , 5            , [ 1, 7 ]   , [ 4, 3 ]   , true      ],

        // with some undefined players
        [ 1           , null     , 'p2'     , 3            , [ 1, 2 ]   , [ 1, 4 ]   , false     ],
        [ 1           , 'p1'     , 'p4'     , 3            , [ 1, 3 ]   , [ 1, 4 ]   , true      ],
        [ 1           , 'p3'     , 'p2'     , 3            , [ 1, 2 ]   , [ 3, 4 ]   , true      ],
        [ 3           , 'p1'     , null     , 5            , [ 1, 7 ]   , [ 2, 3 ]   , false     ],
        [ 3           , 'p1'     , 'p4'     , 5            , [ 1, 6 ]   , [ 2, 3 ]   , true      ],
        [ 3           , 'p3'     , 'p2'     , 5            , [ 1, 7 ]   , [ 4, 3 ]   , true      ],
      ], function(e, d) {
        it('should check whether one of the player as played on the game\'s table (group), '+d, function() {
          var game = { table: e.game_table, p1: { name: e.game_p1 }, p2: { name: e.game_p2 } };
          spyOn(rounds, 'tablesForPlayer').and.callFake(function(name) {
            return e[name+'_tables'] || [];
          });

          expect(rounds.tableAlreadyPlayed(game, e.group_size, ['rounds']))
            .toEqual(e.already);

          if(!R.isNil(e.game_p1)) {
            expect(rounds.tablesForPlayer)
              .toHaveBeenCalledWith(e.game_p1, ['rounds']);
          }
          if(!R.isNil(e.game_p2)) {
            expect(rounds.tablesForPlayer)
              .toHaveBeenCalledWith(e.game_p2, ['rounds']);
          }
        });
      });
    });

    describe('nbRoundsNeededForNPlayers(<n_players>)', function() {
      using([
        [ 'n_players' , 'n_rounds' ],
        // min 5 rounds
        [ 2           , 1          ],
        [ 3           , 2          ],
        [ 4           , 2          ],
        [ 5           , 3          ],
        [ 8           , 3          ],
        [ 9           , 4          ],
        [ 16          , 4          ],
        [ 17          , 5          ],
        [ 1024        , 10         ],
        // max 10
        [ 1025        , 10         ],
      ], function(e, d) {
        it('should calculate the number of rounds needed for <n_players>, '+d, function() {
          expect(rounds.nbRoundsNeededForNPlayers(e.n_players)).toBe(e.n_rounds);
        });
      });
    });
  });

});
