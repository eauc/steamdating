'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('game', function() {

    var game;

    beforeEach(inject([ 'game', function(_game) {
      game = _game;
    }]));

    describe('create(<data>)', function() {
      it('should create a default object', function() {
        expect(game.create({ table: 4,
                             p1: { name: 'toto' },
                             p2: { name: 'titi' } }))
          .toEqual({
            table: 4,
            victory: null,
            p1: { name: 'toto', list: null,
                  team_tournament: null, tournament: null,
                  control: null, army: null, custom_field: null },
            p2: { name: 'titi', list: null,
                  team_tournament: null, tournament: null,
                  control: null, army: null, custom_field: null },
            games: []
          });
      });
    });

    describe('playerNames()', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s names', function() {
        expect(game.playerNames(this.game)).toEqual(['toto','titi']);
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
        this.game.p1.list = 'caster1';
        this.game.p2.list = 'caster2';
      });

      it('should return player\'s list', function() {
        expect(game.listForPlayer('toto', this.game)).toBe('caster1');
        expect(game.listForPlayer('titi', this.game)).toBe('caster2');
      });
    });

    describe('forPlayer(<name>)', function() {
      when('<game> involves player', function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      }, function() {
        it('should return <game>', function() {
          expect(game.forPlayer('toto', this.game)).toBe(this.game);
          expect(game.forPlayer('titi', this.game)).toBe(this.game);

          expect(game.forPlayer('tata', this.game)).toBe(undefined);
        });
      });
    });

    describe('tableForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s list', function() {
        expect(game.tableForPlayer('toto', this.game)).toBe(4);
        expect(game.tableForPlayer('titi', this.game)).toBe(4);
      });
    });

    describe('opponentForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s list', function() {
        expect(game.opponentForPlayer('toto', this.game)).toBe('titi');
        expect(game.opponentForPlayer('titi', this.game)).toBe('toto');
      });
    });

    describe('hasResult()', function() {
      using([
        [ 'p1' , 'p2' , 'hasResult' ],
        [ null , null , false       ],
        [ 1    , null , false       ],
        [ null , 1    , false       ],
        [ 1    , 0    , true        ],
      ], function(e, d) {
        it('should check whether the game result is defined, '+d, function() {
          var g = game.create();
          g.p1.tournament = e.p1;
          g.p2.tournament = e.p2;
          expect(game.hasResult(g)).toBe(e.hasResult);
        });
      });
    });

    describe('winForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.winForPlayer('toto', this.game)).toBe(undefined);
          expect(game.winForPlayer('titi', this.game)).toBe(undefined);
        });
      });

      when('game has subGames', function() {
        this.game.games = [ {} ];
      }, function() {
        when('result is defined', function() {
          this.game.p1.team_tournament = 1;
          this.game.p2.team_tournament = 0;
        }, function() {
          it('should return whether <name> has won', function() {
            expect(game.winForPlayer('toto', this.game)).toBe(true);
            expect(game.winForPlayer('titi', this.game)).toBe(false);
          });
        });
      });

      when('game does not have subGames', function() {
      }, function() {
        when('result is defined', function() {
          this.game.p1.tournament = 1;
          this.game.p2.tournament = 0;
        }, function() {
          it('should return whether <name> has won', function() {
            expect(game.winForPlayer('toto', this.game)).toBe(true);
            expect(game.winForPlayer('titi', this.game)).toBe(false);
          });
        });
      });
    });

    describe('lossForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.lossForPlayer('toto', this.game)).toBe(undefined);
          expect(game.lossForPlayer('titi', this.game)).toBe(undefined);
        });
      });

      when('game has subGames', function() {
        this.game.games = [ {} ];
      }, function() {
        when('result is defined', function() {
          this.game.p1.team_tournament = 1;
          this.game.p2.team_tournament = 0;
        }, function() {
          it('should return whether <name> has won', function() {
            expect(game.lossForPlayer('toto', this.game)).toBe(false);
            expect(game.lossForPlayer('titi', this.game)).toBe(true);
          });
        });
      });

      when('game does not have subGames', function() {
      }, function() {
        when('result is defined', function() {
          this.game.p1.tournament = 1;
          this.game.p2.tournament = 0;
        }, function() {
          it('should return whether <name> has won', function() {
            expect(game.lossForPlayer('toto', this.game)).toBe(false);
            expect(game.lossForPlayer('titi', this.game)).toBe(true);
          });
        });
      });
    });

    describe('isValid()', function() {
      using([
        [ 'p1' , 'p2' , 'isValid' ],
        [ null , null , false     ],
        [ 'p1' , null , false     ],
        [ null , 'p2' , false     ],
        [ 'p1' , 'p2' , true      ],
      ], function(e, d) {
        it('should check whether both players are defined, '+d, function() {
          expect(game.isValid(game.create({ table: 3,
                                            p1: { name: e.p1 },
                                            p2: { name: e.p2 } }))).toBe(e.isValid);
        });
      });
    });

    describe('isAssassination()', function() {
      using([
        [ 'victory'       , 'isAssassination' ],
        [ null            , false ],
        [ 'assassination' , true  ],
        [ 'other'         , false ],
      ], function(e, d) {
        it('should check whether both players are defined, '+d, function() {
          expect(game.isAssassination$(game.create({ table: 3,
                                                     victory: e.victory,
                                                     p1: { name: e.p1 },
                                                     p2: { name: e.p2 } })))
            .toBe(e.isAssassination);
        });
      });
    });

    describe('winner()', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.winner(this.game)).toBe(undefined);
        });
      });

      when('game has subGames', function() {
        this.game.games = [ {} ];
      }, function() {
        when('result is defined', function() {
        }, function() {
          using([
            [ 'p1_tp' , 'p2_tp' , 'winner' ],
            [ 1       , 0       , 'toto'   ],
            [ 0       , 1       , 'titi'   ],
          ], function(e, d) {
            it('should return the winner\'s name, '+d, function() {
              this.game.p1.team_tournament = e.p1_tp;
              this.game.p2.team_tournament = e.p2_tp;
              expect(game.winner(this.game)).toBe(e.winner);
            });
          });
        });
      });

      when('game does not have subGames', function() {
      }, function() {
        when('result is defined', function() {
        }, function() {
          using([
            [ 'p1_tp' , 'p2_tp' , 'winner' ],
            [ 1       , 0       , 'toto'   ],
            [ 0       , 1       , 'titi'   ],
          ], function(e, d) {
            it('should return the winner\'s name, '+d, function() {
              this.game.p1.tournament = e.p1_tp;
              this.game.p2.tournament = e.p2_tp;
              expect(game.winner(this.game)).toBe(e.winner);
            });
          });
        });
      });
    });

    describe('loser()', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.loser(this.game)).toBe(undefined);
        });
      });

      when('game has subGames', function() {
        this.game.games = [ {} ];
      }, function() {
        when('result is defined', function() {
        }, function() {
          using([
            [ 'p1_tp' , 'p2_tp' , 'loser' ],
            [ 1       , 0       , 'titi'  ],
            [ 0       , 1       , 'toto'  ],
            // double loss, return first player
            [ 0       , 0       , 'toto'  ],
          ], function(e, d) {
            it('should return the loser\'s name, '+d, function() {
              this.game.p1.team_tournament = e.p1_tp;
              this.game.p2.team_tournament = e.p2_tp;
              expect(game.loser(this.game)).toBe(e.loser);
            });
          });
        });
      });

      when('game does not have subGames', function() {
      }, function() {
        when('result is defined', function() {
        }, function() {
          using([
            [ 'p1_tp' , 'p2_tp' , 'loser' ],
            [ 1       , 0       , 'titi'  ],
            [ 0       , 1       , 'toto'  ],
            // double loss, return first player
            [ 0       , 0       , 'toto'  ],
          ], function(e, d) {
            it('should return the loser\'s name, '+d, function() {
              this.game.p1.tournament = e.p1_tp;
              this.game.p2.tournament = e.p2_tp;
              expect(game.loser(this.game)).toBe(e.loser);
            });
          });
        });
      });
    });

    when('updatePointsFromSubGames()', function() {
      this.ret = game.updatePointsFromSubGames(this.game);
    }, function() {
      beforeEach(function() {
        this.game = game.create();
        this.game.games = R.times(game.create, 5);
        R.times(R.bind(function(i) {
          R.extend(this.game.games[i].p1, {
            tournament: i%2,
            control: i,
            army: i*10,
            custom_field: i+5
          });
          R.extend(this.game.games[i].p2, {
            tournament: (i+1)%2,
            control: 5-i,
            army: 50-i*10,
            custom_field: 20-i,
          });
        }, this), 5);
      });

      it('should update tournament/control/army/custom_field/assassination points', function() {
        expect(this.ret.p1)
          .toEqual({ name : null, list : null,
                     team_tournament : 0, tournament : 2,
                     control : 10, army : 100, custom_field : 35, assassination : 0 });
        expect(this.ret.p2)
          .toEqual({ name : null, list : null,
                     team_tournament : 1, tournament : 3,
                     control : 15, army : 150, custom_field : 90, assassination : 0 });
      });

      when('p2 team wins', function() {
      }, function() {
        it('should update team_tournament points', function() {
          expect(this.ret.p1.team_tournament)
            .toBe(0);
          expect(this.ret.p2.team_tournament)
            .toBe(1);
        });
      });

      when('p1 team wins', function() {
        this.game.games[0].p1.tournament = 1;
        this.game.games[0].p2.tournament = 0;
      }, function() {
        it('should update team_tournament points', function() {
          expect(this.ret.p1.team_tournament)
            .toBe(1);
          expect(this.ret.p2.team_tournament)
            .toBe(0);
        });
      });

      when('teams are ex-aequo', function() {
        this.game.games[0].p1.tournament = 0;
        this.game.games[0].p2.tournament = 0;
      }, function() {
        it('should update team_tournament points', function() {
          expect(this.ret.p1.team_tournament)
            .toBe(0);
          expect(this.ret.p2.team_tournament)
            .toBe(0);
        });
      });
      
      when('some sub games results are missing', function() {
        this.game.games[1].p1.tournament = null;
      }, function() {
        it('should not update team_tournament points', function() {
          expect(this.ret.p1.team_tournament)
            .toBe(null);
          expect(this.ret.p2.team_tournament)
            .toBe(null);
        });
      });
    });

    when('updatePoints()', function() {
      this.ret = game.updatePoints(this.game);
    }, function() {
      beforeEach(function() {
        this.game = game.create();
      });

      using([
        ['assassination', 'p1_tp', 'p2_tp', 'p1_assa', 'p2_assa' ],
        [ false, 1, 0, 0, 0 ],
        [ false, 0, 1, 0, 0 ],
        [ true, 1, 0, 1, 0 ],
        [ true, 0, 1, 0, 1 ],
        [ true, 0, 0, 0, 0 ],
      ], function(e, d) {
        when('game does not have subGames', function() {
          this.game.victory = e.assassination ? 'assassination' : null;
          this.game.p1.tournament = e.p1_tp;
          this.game.p2.tournament = e.p2_tp;
        }, function() {
          it('should update assassination points, '+d, function() {
            expect(this.ret.p1.assassination)
              .toBe(e.p1_assa);
            expect(this.ret.p2.assassination)
              .toBe(e.p2_assa);
          });
        });

        when('game has subGames', function() {
          this.game.games = R.times(game.create, 5);
          R.times(R.bind(function(i) {
            this.game.games[i].victory = i%2 ? 'assassination' : null;
            R.extend(this.game.games[i].p1, {
              tournament: i%2,
              control: i,
              army: i*10,
              custom_field: i+5
            });
            R.extend(this.game.games[i].p2, {
              tournament: (i+1)%2,
              control: 5-i,
              army: 50-i*10,
              custom_field: 20-i,
            });
          }, this), 5);
        }, function() {
          it('should update game & subgames points', function() {
            expect(this.ret.p1)
              .toEqual({ name : null, list : null,
                         tournament : 2, control : 10,
                         army : 100, custom_field : 35, assassination : 2, team_tournament : 0 });
            expect(this.ret.p2)
              .toEqual({ name : null, list : null,
                         tournament : 3, control : 15,
                         army : 150, custom_field : 90, assassination : 0, team_tournament : 1 });
            
            expect(this.ret.games[0].p1.assassination)
              .toBe(0);
            expect(this.ret.games[0].p2.assassination)
              .toBe(0);
            expect(this.ret.games[1].p1.assassination)
              .toBe(1);
            expect(this.ret.games[1].p2.assassination)
              .toBe(0);
            expect(this.ret.games[2].p1.assassination)
              .toBe(0);
            expect(this.ret.games[2].p2.assassination)
              .toBe(0);
            expect(this.ret.games[3].p1.assassination)
              .toBe(1);
            expect(this.ret.games[3].p2.assassination)
              .toBe(0);
            expect(this.ret.games[4].p1.assassination)
              .toBe(0);
            expect(this.ret.games[4].p2.assassination)
              .toBe(0);
          });
        });
      });
    });

    describe('createSubGames(<n>)', function() {
      it('should create <n> SubGames for <game>', function() {
        expect(game.createSubGames(3, {}).games)
          .toEqual([
            { table : null, victory : null,
              p1 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              p2 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              games : [  ] },
            { table : null, victory : null,
              p1 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              p2 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              games : [  ] },
            { table : null, victory : null,
              p1 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              p2 : { name : null, list : null, team_tournament : null, tournament : null,
                     control : null, army : null, custom_field : null },
              games : [  ] }
          ]);
      });
    });

    describe('hasSubGames()', function() {
      using([
        [ 'game'                , 'hasSubGames' ],
        [ {}                    , false       ],
        [ { games: null }       , false       ],
        [ { games: [] }         , false       ],
        [ { games: [ {} ] }     , true        ],
        [ { games: [ {}, {} ] } , true        ],
      ], function(e, d) {
        it('should check whether the game has SubGames, '+d, function() {
          expect(game.hasSubGames(e.game)).toBe(e.hasSubGames);
        });
      });
    });

    describe('arrayHeaders(<is_team_tournament>, <with_custom_field>)', function() {
      using([
        [ 'team', 'custom' , 'headers' ],
        [ false , ''       , [ 'Table', 'Player1', 'Player2', 'Lists',
                               'Tourn.Points',
                               'ControlPoints', 'ArmyPoints', 'CasterKill' ] ],
        [ false , 'custom' , [ 'Table', 'Player1', 'Player2', 'Lists',
                               'Tourn.Points',
                               'ControlPoints', 'ArmyPoints', 'CasterKill', 'custom' ] ],
        [ true  , ''       , [ 'Table', 'Player1', 'Player2', 'Lists',
                               'TeamPoints', 'Tourn.Points',
                               'ControlPoints', 'ArmyPoints', 'CasterKill' ] ],
        [ true  , 'custom' , [ 'Table', 'Player1', 'Player2', 'Lists',
                               'TeamPoints', 'Tourn.Points',
                               'ControlPoints', 'ArmyPoints', 'CasterKill', 'custom' ] ],
      ], function(e, d) {
        it('should generate game description headers, '+d, function() {
          expect(game.arrayHeaders(e.team, e.custom))
            .toEqual(e.headers);
        });
      });
    });

    describe('toArray(<is_team_tournament>, <with_custom_field>)', function() {
      using([
        [ 'team', 'custom' , 'ck'  , 'array' ],
        [ false , false    , true  , [ [ 21,
                                         { value: 'toto', color: 'limegreen' },
                                         { value: 'titi', color: 'red' },
                                         'list1-list2', '1-0', '2-4', '3-5', '1-0' ]
                                     ] ],
        [ false , true     , false , [ [ 21,
                                         { value: 'toto', color: 'limegreen' },
                                         { value: 'titi', color: 'red' },
                                         'list1-list2', '1-0', '2-4', '3-5', '0-0', '42-24' ]
                                     ] ],
        [ true  , false    , false , [ [ 21,
                                         { value : 'toto', color : 'limegreen' },
                                         { value : 'titi', color : 'red' },
                                         '', '1-0', '2-0', '4-8', '6-10', '1-0' ],
                                       [ '',
                                         { value : 'toto1', color : 'limegreen' },
                                         { value : 'titi1', color : 'red' },
                                         'list11-list21', '', '1-0', '2-4', '3-5', '1-0' ],
                                       [ '',
                                         { value : 'toto2', color : 'limegreen' },
                                         { value : 'titi2', color : 'red' },
                                         'list12-list22', '', '1-0', '2-4', '3-5', '0-0' ]
                                     ] ],
        [ true  , true     , false , [ [ 21,
                                         { value : 'toto', color : 'limegreen' },
                                         { value : 'titi', color : 'red' },
                                         '', '1-0', '2-0', '4-8', '6-10', '1-0', '84-48' ],
                                       [ '',
                                         { value : 'toto1', color : 'limegreen' },
                                         { value : 'titi1', color : 'red' },
                                         'list11-list21', '', '1-0', '2-4', '3-5', '1-0', '42-24' ],
                                       [ '',
                                         { value : 'toto2', color : 'limegreen' },
                                         { value : 'titi2', color : 'red' },
                                         'list12-list22', '', '1-0', '2-4', '3-5', '0-0', '42-24' ]
                                     ] ],
      ], function(e, d) {
        it('should convert game to array, '+d, function() {
          this.game = {
            table: 21,
            victory: e.ck ? 'assassination' : null,
            p1: { name: 'toto', list: 'list1', team_tournament: 0, tournament: 1,
                  control: 2, army: 3, custom_field: 42, assassination: 3 },
            p2: { name: 'titi', list: 'list2', team_tournament: 1, tournament: 0,
                  control: 4, army: 5, custom_field: 24, assassination: 1 }
          };
          if(e.team) {
            this.game.games = [
              { victory: 'assassination', games: [],
                p1: { name: 'toto1', list: 'list11', tournament: 1,
                      control: 2, army: 3, custom_field: 42 },
                p2: { name: 'titi1', list: 'list21', tournament: 0,
                      control: 4, army: 5, custom_field: 24 }
              },
              { victory: null, games: [],
                p1: { name: 'toto2', list: 'list12', tournament: 1,
                      control: 2, army: 3, custom_field: 42 },
                p2: { name: 'titi2', list: 'list22', tournament: 0,
                      control: 4, army: 5, custom_field: 24 }
              }
            ];
          }
          expect(game.toArray(e.team, e.custom, this.game))
            .toEqual(e.array);
        });
      });
    });
  });
});
