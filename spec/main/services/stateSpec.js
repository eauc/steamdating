'use strict';

describe('service', function() {

  beforeEach(function() {
    angular.module('srApp.services')
      .factory('$window', function() {
        return {
          localStorage: jasmine.createSpyObj('localStorage', ['getItem', 'setItem' ])
        };
      });
    module('srApp.services');
  });

  describe('state', function() {

    var state;

    beforeEach(inject([ 'state', function(_state) {
      state = _state;
    }]));

    describe('isEmpty()', function() {
      using([
        [ 'players' , 'rounds' , 'isEmpty' ],
        [ [[],[]]   , [[]]     , true      ],
        [ [[],[1]]  , [[]]     , false     ],
        [ [[],[]]   , [[1]]    , false     ],
      ], function(e, d) {
        it('should test whether teams players and rounds are empty, '+d, function() {
          expect(state.isEmpty({ players: e.players, rounds: e.rounds }))
            .toBe(e.isEmpty);
        });
      });
    });

    describe('create(<data>)', function() {
      beforeEach(function() {
        spyOn(state, 'updatePlayersPoints')
          .and.callFake(function(s) { s.players.push('updated'); return s; });
        spyOn(state, 'store');
        this.data = {
          test: 'value'
        };
        this.result = state.create(this.data);
      });

      it('should update players points', function() {
        expect(state.updatePlayersPoints).toHaveBeenCalled();
      });

      it('should create default state', function() {
        expect(this.result).toEqual({
          test: 'value',
          players: [ [], 'updated' ],
          rounds: [],
          bracket: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
          },
          custom_fields: {
            player: null,
            game: null
          },
            tables_groups_size: null
        });
      });
      
      it('should store state', function() {
        expect(state.store).toHaveBeenCalledWith(this.result);
      });

      when('expected fields exist in data', function() {
        this.data = {
          test: 'value',
          players: [ [ { name: 'toto' } ] ],
          rounds: [ [ { table: 1 } ] ],
          bracket: [ 'bracket' ],
          ranking: {
            player: 'player',
            team: 'team'
          },
          custom_fields: {
            player: 'pcustom',
            game: 'gcustom'
          },
          tables_groups_size: 4
        };
        this.result = state.create(this.data);
      }, function() {
        it('should not modify them', function() {
          expect(this.result).toEqual({
            bracket: [ 'bracket' ],
            players: [ [ { name : 'toto', droped: null, faction : null, origin : null, team : null,
                           custom_field : 0, notes : null, lists : [  ], lists_played : [  ],
                           points : { tournament : 0, sos : 0, control : 0,
                                      army : 0, custom_field : 0 }
                         }
                       ], 'updated' ],
            rounds: [ [ { table: 1,
                          victory: null,
                          p1 : { name : null, list : null, tournament : null,
                                 control : null, army : null, custom_field : null },
                          p2 : { name : null, list : null, tournament : null,
                                 control : null, army : null, custom_field : null }
                        } ] ],
            ranking: {
              player : 'player',
              team : 'team'
            },
            custom_fields: {
              player : 'pcustom',
              game : 'gcustom'
            },
            tables_groups_size: 4,
            test : 'value'
          });
        });
      });
    });

    describe('init()', function() {
      beforeEach(inject(function($window) {
        spyOn(state, 'create').and.returnValue(['new_state']);
        this.windowService = $window;
      }));

      when('stored data is valid', function() {
        this.windowService.localStorage.getItem.and.returnValue('["stored_state"]');

        this.result = state.init();
      }, function() {
        it('should retrieve stored state', function() {
          expect(this.windowService.localStorage.getItem)
            .toHaveBeenCalledWith('sdApp.state');
        });
        
        it('should create new state with stored data', function() {
          expect(state.create)
            .toHaveBeenCalledWith(['stored_state']);
        });
      });

      when('stored data is invalid', function() {
        this.windowService.localStorage.getItem.and.returnValue('["stored_state');

        this.result = state.init();
      }, function() {
        it('should create new empty state', function() {
          expect(state.create)
            .toHaveBeenCalledWith();
        });
      });
    });

    describe('store()', function() {
      beforeEach(inject(function($window) {
        this.windowService = $window;
      }));

      it('should store state in localStorage', function() {
        state.store([ 'state' ]);

        expect(this.windowService.localStorage.setItem)
          .toHaveBeenCalledWith('sdApp.state', '["state"]');
      });
    });

    describe('hasPlayers()', function() {
      it('should test if one or more player are defined', function() {
        expect(state.hasPlayers({ players: [[]] })).toBe(false);
        expect(state.hasPlayers({ players: [[],[{}]] })).toBe(true);
      });
    });

    describe('hasPlayerGroups()', function() {
      it('should test if more than one player group is defined', function() {
        expect(state.hasPlayerGroups({ players: [[]] })).toBe(false);
        expect(state.hasPlayerGroups({ players: [[],[]] })).toBe(true);
      });
    });

    describe('isTeamTournament()', function() {
      it('should test if one or more team are defined', function() {
        expect(state.isTeamTournament({ teams: [[]] })).toBe(false);
        expect(state.isTeamTournament({ teams: [[],[{}]] })).toBe(true);
      });
    });

    describe('hasPlayerCustomField()', function() {
      using([
        [ 'pcustom' , 'hasPCustom' ],
        [ undefined , false ],
        [ null      , false ],
        [ ''        , false ],
        [ ' \t\n'   , false ],
        [ 'pcustom' , true ],
      ], function(e, d) {
        it('should test if player\'s custom field is defined, '+d, function() {
          expect(state.hasPlayerCustomField({ custom_fields: { player: e.pcustom } }))
            .toBe(e.hasPCustom);
        });
      });
    });

    describe('hasGameCustomField()', function() {
      using([
        [ 'gcustom' , 'hasGCustom' ],
        [ undefined , false ],
        [ null      , false ],
        [ ''        , false ],
        [ ' \t\n'   , false ],
        [ 'gcustom' , true ],
      ], function(e, d) {
        it('should test if game\'s custom field is defined, '+d, function() {
          expect(state.hasGameCustomField({ custom_fields: { game: e.gcustom } }))
            .toBe(e.hasGCustom);
        });
      });
    });

    describe('clearBracket()', function() {
      it('should clear all brackets', function() {
        expect(state.clearBracket({ players: R.repeat({}, 3) }))
          .toEqual({
            players: R.repeat({}, 3),
            bracket: [undefined, undefined, undefined]
          });
      });
    });

    describe('canBeBracketTournament(<group_index>)', function() {
      beforeEach(function() {
        spyOn(state, 'playersNotDropedInLastRound');
      });

      it('should request list of not droped players', function() {
        state.playersNotDropedInLastRound.and.returnValue([[]]);
        var st = { players: ['players'] };
        
        state.canBeBracketTournament(0, st);
        
        expect(state.playersNotDropedInLastRound)
          .toHaveBeenCalledWith(st);
      });
      
      using([
        [ 'players'           , 'can' ],
        [ [ [] ]              , false ],
        [ [ R.repeat({}, 1) ] , true  ],
        [ [ R.repeat({}, 2) ] , true  ],
        [ [ R.repeat({}, 3) ] , false ],
        [ [ R.repeat({}, 4) ] , true  ],
        [ [ R.repeat({}, 5) ] , false ],
        [ [ R.repeat({}, 7) ] , false ],
        [ [ R.repeat({}, 8) ] , true  ],
      ], function(e, d) {              
        it('should test whether group\'s length is a power of 2, '+d, function() {
          state.playersNotDropedInLastRound.and.returnValue(e.players);
          
          expect(state.canBeBracketTournament(0, {
            players: ['players']
          })).toBe(e.can);
        });
      });
    });

    describe('bracketNbRounds(<group_index>)', function() {
      when('bracket is set', function() {
      }, function() {
        using([
          [ 'rounds'               , 'nb' ],
          [ [ [], [] ]             , 0    ],
          [ [ [], [], [] ]         , 1    ],
          [ [ [], [], [], [], [] ] , 3    ],
        ], function(e, d) {
          it('should return number of rounds since bracket start, '+d, function() {
            expect(state.bracketNbRounds(0, { bracket: [ 2 ], rounds: e.rounds }))
              .toBe(e.nb);
          });
        });
      });

      when('bracket is not set', function() {
      }, function() {
        it('should return 0', function() {
          expect(state.bracketNbRounds(0, { bracket: [ undefined ], rounds: [ [], [] ] }))
            .toBe(0);
        });
      });
    });

    describe('bracketRoundof(, <group_index>, <round_index>)', function() {
      when('bracket is not set', function() {
      }, function() {
        it('should return "Not in bracket"', function() {
          expect(state.bracketRoundOf(0, 0, {
            bracket: [],
            rounds: [],
            players: [[]]
          })).toMatch(/not in bracket/i);
        });
      });

      when('bracket is set', function() {
      }, function() {
        using([
          [ 'round_index' , 'desc'            ],
          [ 0             , /round of 8/i     ],
          [ 1             , /quarter-finals/i ],
          [ 2             , /semi-finals/i    ],
          [ 3             , /final/i          ],
          [ 4             , /ended/i          ],
        ], function(e, d) {
          it('should return a description of the bracket round, '+d, function() {
            expect(state.bracketRoundOf(0, e.round_index, {
              bracket: [0],
              players: [ R.repeat({}, 16) ],
              rounds: []
            })).toMatch(e.desc);
          });
        });
      });
    });

    describe('updatePlayersPoints()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.updatePoints with bracket information', function() {
        var dummy_players = [ R.repeat({}, 4), R.repeat({}, 2), R.repeat({}, 5) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        
        expect(state.updatePlayersPoints({
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: ['rounds']
        })).toEqual({
          bracket: dummy_bracket,
          players: 'players.updatePoints.returnValue',
          rounds: ['rounds']
        });
        expect(this.playersService.updatePoints)
          .toHaveBeenCalledWith(dummy_bracket, [ 2, 1, 2.5 ],
                                [ 'rounds' ],
                                dummy_players);
      });
    });
    
    describe('updateBestsPlayers()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        spyOn(state, 'sortPlayersByRank')
          .and.returnValue([[
            { rank: 1,
              players: [ { name: 'p1', faction: 'f1' },
                         { name: 'p2', faction: 'f2' },
                         { name: 'p3', faction: 'f1' } ]
            },
            { rank: 2,
              players: [ { name: 'p4', faction: 'f2' },
                         { name: 'p5', faction: 'f3' } ]
            },
            { rank: 3,
              players: [ { name: 'p6', faction: 'f3' },
                         { name: 'p7', faction: 'f4' },
                         { name: 'p8', faction: 'f1' } ]
            },
          ]]);

        this.dummy_players = [ R.repeat({}, 4), R.repeat({}, 2), R.repeat({}, 5) ];
        this.ret = state.updateBestsPlayers({
          players: this.dummy_players,
          rounds: ['round1', 'round2', 'round3']
        });
      });

      it('should call players.bests with nb rounds information', function() {
        expect(this.ret.bests).toBe('players.bests.returnValue');
        expect(this.playersService.bests)
          .toHaveBeenCalledWith(3, this.dummy_players);
      });

      it('should extract bests players in each faction', function() {
        expect(this.ret.bests_in_faction).toEqual({
          f1: [ 'p1', 1 ],
          f2: [ 'p2', 1 ],
          f3: [ 'p5', 2 ],
          f4: [ 'p7', 3 ]
        });
      });
    });
    
    describe('isPlayerBest(<type>, <player>)', function() {
      beforeEach(function() {
        this.state = {
          bests: {
            undefeated: [ 'p1' ],
            custom_field: [ 'p1', 'p3' ],
            points: {
              sos: [ 'p1' ],
              control: [ 'p2', 'p3' ],
              army: [ 'p3' ],
              custom_field: [ 'p2' ],
            }
          }
        };
      });

      using([
        [ 'type'                , 'name' , 'isBest' ],
        [ 'undefeated'          , 'p1'   , true  ],
        [ 'undefeated'          , 'p2'   , false ],
        [ 'custom_field'        , 'p3'   , true  ],
        [ 'custom_field'        , 'p4'   , false ],
        [ 'points.sos'          , 'p1'   , true  ],
        [ 'points.sos'          , 'p2'   , false ],
        [ 'points.custom_field' , 'p2'   , true  ],
        [ 'points.custom_field' , 'p3'   , false ],
      ], function(e, d) {
        it('should test whether <name> is in the bests players for <type>, '+d, function() {
          expect(state.isPlayerBest(e.type, { name: e.name }, this.state))
            .toBe(e.isBest);
        });
      });
    });
    
    describe('isPlayerBestInFaction(<player>)', function() {
      beforeEach(function() {
        this.state = {
          bests_in_faction: {
            f1: [ 'p1', 1 ],
            f2: [ 'p2', 1 ],
            f3: [ 'p5', 2 ],
            f4: [ 'p7', 3 ]
          }
        };
      });

      using([
        [ 'faction' , 'name'    , 'isBest' ],
        [ 'f1'      , 'p1'      , true  ],
        [ 'f1'      , 'p2'      , false ],
        [ 'f3'      , 'p5'      , true  ],
        [ 'f3'      , 'p4'      , false ],
        [ 'unknown' , 'p1'      , false ],
        [ 'f1'      , 'unknown' , false ],
        [ null      , 'p2'      , false ],
        [ 'f1'      , null      , false ],
      ], function(e, d) {
        it('should test whether <name> is the bests players for <faction>, '+d, function() {
          expect(state.isPlayerBestInFaction({
            name: e.name,
            faction: e.faction
          }, this.state))
            .toBe(e.isBest);
        });
      });
    });

    describe('sortPlayersByRank()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.sort with bracket information', function() {
        var dummy_players = [ R.repeat({}, 4), R.repeat({}, 2), R.repeat({}, 5) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        var st = {
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: R.repeat({}, 3)
        };

        expect(state.sortPlayersByRank(st))
          .toBe('players.sort.returnValue');
        expect(this.playersService.sort)
          .toHaveBeenCalledWith(st, [ false, false, true ], dummy_players);
      });
    });

    describe('sortPlayersByName()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.sort with bracket information', function() {
        var dummy_players = [ R.repeat({}, 4), R.repeat({}, 2), R.repeat({}, 5) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        var st = {
          players: [
            [ { name: 'toto' }, { name: 'titi' }, { name: 'tutu' }, ],
            [ { name: 'tete' }, { name: 'tata' } ],
          ],
        };

        expect(state.sortPlayersByName(st))
          .toEqual([
            [ { name : 'titi' }, { name : 'toto' }, { name : 'tutu' } ],
            [ { name : 'tata' }, { name : 'tete' } ]
          ]);
      });
    });

    describe('rankingTables()', function() {
      it('should build a ranking table', function() {
        var st = {
          players: [[ { name: 'p1', droped: null, origin: 'c1', faction: 'f1', custom_field: 21,
                        points: { tournament: 5, sos: 4, control: 15, army: 32,
                                  assassination: 3, custom_field: 12 } },
                      { name: 'p2', droped: 0, origin: 'c2', faction: 'f2', custom_field: 24,
                        points: { tournament: 3, sos: 4, control: 12, army: 32,
                                  assassination: 1, custom_field: 42 } },
                      { name: 'p3', droped: 5, origin: 'c3', faction: 'f3', custom_field: 27,
                        points: { tournament: 3, sos: 7, control: 12, army: 48,
                                  assassination: 6, custom_field: 72 } },
                    ]],
          bracket: [],
          rounds: [],
          ranking: { player: 'tp*10+sos' },
          custom_fields: {
            player: 'pCustom',
            game: 'gCustom'
          },
          bests: {
            undefeated: [ 'p1' ],
            custom_field: [ 'p1 p3' ],
            points: {
              sos: [ 'p1' ],
              control: [ 'p2 p3' ],
              army: [ 'p3' ],
              assassination: [ 'p5' ],
              custom_field: [ 'p2' ],
            }
          },
          bests_in_faction: {
            f1: [ 'p1', 1 ],
            f2: [ 'p2', 1 ],
            f3: [ 'p5', 2 ],
            f4: [ 'p7', 3 ]
          }
        };
        var res = state.rankingTables(st);
        expect(res).toEqual([
          [ [ 'Bests' ],
            [ 'Undefeated', 'pCustom', 'SoS', 'Scenario', 'Destruction', 'Assassin', 'gCustom' ],
            [ [ 'p1' ], [ 'p1 p3' ], [ 'p1' ], [ 'p2 p3' ], [ 'p3' ], [ 'p5' ], [ 'p2' ] ]
          ],
          [ [ 'Bests In Faction' ],
            [ 'Faction', 'Player', 'Rank' ],
            [ 'f1', 'p1', 1 ],
            [ 'f2', 'p2', 1 ],
            [ 'f3', 'p5', 2 ],
            [ 'f4', 'p7', 3 ]
          ],
          [ [ 'Group1' ],
            [ 'Rank', 'Name', 'Origin', 'Faction',
              'pCustom', 'TP', 'SoS', 'CP', 'AP', 'CK', 'gCustom', 'Drop' ],
            [ 1, 'p1', 'c1', 'f1', 21, 5, 4, 15, 32, 3, 12, '' ],
            [ 2, 'p3', 'c3', 'f3', 27, 3, 7, 12, 48, 6, 72, 'After Round 5' ],
            [ 3, 'p2', 'c2', 'f2', 24, 3, 4, 12, 32, 1, 42, 'After Round 0' ]
          ]
        ]);
      });
    });

    describe('roundTables(<round_index>)', function() {
      it('should build a result table for round <round_index>', function() {
        var st = { players: [
          [ {}, {} ],
          [ {}, {}, {}, {} ]
        ], bracket: [], rounds: [
          [],
          [ { table:1,
              victory: 'assassination',
              p1: { name: 'p1', list: 'list1', tournament: 1, control: 2, army: 3, custom_field: 21 },
              p2: { name: 'p2', list: 'list2', tournament: 2, control: 4, army: 6, custom_field: 12 } },
            { table:2,
              victory: null,
              p1: { name: 'p3', list: 'list3', tournament: 3, control: 6, army: 9, custom_field: 24 },
              p2: { name: 'p4', list: 'list4', tournament: 4, control: 8, army: 12, custom_field: 42 } },
            { table:3,
              victory: 'assassination',
              p1: { name: 'p5', list: 'list5', tournament: 5, control: 10, army: 15, custom_field: 27 },
              p2: { name: 'p6', list: 'list6', tournament: 6, control: 12, army: 18, custom_field: 72 } },
          ]
        ], custom_fields: {
          player: 'pCustom',
          game: 'gCustom'
        } };
        var res = state.roundTables(1, st);
        expect(res).toEqual([
          [ ['Group1'],
            [ 'Table', 'Player1', 'Player2', 'Player1.list', 'Player2.list',
              'Player1.tp', 'Player2.tp', 'Player1.cp', 'Player2.cp',
              'Player1.ap', 'Player2.ap', 'CasterKill', 'Player1.gCustom', 'Player2.gCustom' ],
            [ 1, 'p1', 'p2', 'list1', 'list2', 1, 2, 2, 4, 3, 6, 1, 21, 12 ]
          ],
          [ ['Group2'],
            [ 'Table', 'Player1', 'Player2', 'Player1.list', 'Player2.list',
              'Player1.tp', 'Player2.tp', 'Player1.cp', 'Player2.cp',
              'Player1.ap', 'Player2.ap', 'CasterKill', 'Player1.gCustom', 'Player2.gCustom' ],
            [ 2, 'p3', 'p4', 'list3', 'list4', 3, 4, 6, 8, 9, 12, 0, 24, 42 ],
            [ 3, 'p5', 'p6', 'list5', 'list6', 5, 6, 10, 12, 15, 18, 1, 27, 72 ]
          ]
        ]);
      });
    });
    
    describe('roundsSummaryTables(<round_index>)', function() {
      it('should build a result table for round <round_index>', function() {
        var st = { players: [
          [ { name: 'p1', droped: 0, lists: ['list11','list12'], lists_played: ['list11','list12'] },
            { name: 'p2', droped: 1, lists: ['list21','list22'], lists_played: ['list21'] } ],
          [ { name: 'p3', droped: null, lists: ['list31','list32'], lists_played: ['list31','list32'] },
            { name: 'p4', droped: null, lists: ['list41','list42'], lists_played: ['list41'] },
            { name: 'p5', droped: null, lists: ['list51','list52'], lists_played: ['list51','list52'] },
            { name: 'p6', droped: 6, lists: ['list61','list62'], lists_played: ['list62'] } ]
        ], bracket: [null, 1], rounds: [
          [ { table:1, games: [],
              victory: null,
              p1: { name: 'p1', list: 'list11',
                    tournament: 1, control: 111, army: 112, custom_field: 113 },
              p2: { name: 'p2', list: 'list21',
                    tournament: 0, control: 121, army: 122, custom_field: 123 } },
            { table:2, games: [],
              victory: null,
              p1: { name: 'p3', list: 'list31',
                    tournament: 1, control: 131, army: 132, custom_field: 133 },
              p2: { name: 'p6', list: 'list61',
                    tournament: 0, control: 161, army: 162, custom_field: 163 } },
            { table:3, games: [],
              victory: 'assassination',
              p1: { name: 'p4', list: 'list41',
                    tournament: 1, control: 141, army: 142, custom_field: 143 },
              p2: { name: 'p5', list: 'list51',
                    tournament: 0, control: 151, army: 152, custom_field: 153 } },
          ],
          [ { table:1, games: [],
              victory: 'assassination',
              p1: { name: 'p1', list: 'list12',
                    tournament: 1, control: 211, army: 212, custom_field: 213 },
              p2: { name: 'p2', list: 'list21',
                    tournament: 0, control: 221, army: 222, custom_field: 223 } },
            { table:2, games: [],
              victory: null,
              p1: { name: 'p3', list: 'list32',
                    tournament: 1, control: 231, army: 232, custom_field: 233 },
              p2: { name: 'p4', list: 'list42',
                    tournament: 0, control: 241, army: 242, custom_field: 243 } },
            { table:3, games: [],
              victory: 'assassination',
              p1: { name: 'p5', list: 'list51',
                    tournament: 1, control: 251, army: 252, custom_field: 253 },
              p2: { name: 'p6', list: 'list61',
                    tournament: 0, control: 261, army: 262, custom_field: 263 } },
          ]
        ], custom_fields: {
          player: 'pCustom',
          game: 'gCustom'
        } };
        var res = state.roundsSummaryTables(st);
        expect(res).toEqual([
          [ [ 'Group1' ],
            [ 'Player', 'Lists Played', 'Round1', 'Round2' ],
            [ 'p1', '2/2', 'DROPPED', 'DROPPED' ],
            [ 'p2', '1/2', 'L - p1', 'DROPPED' ]
          ],
          [ [ 'Group2' ],
            [ 'Player', 'Lists Played', 'Round1', 'Final' ],
            [ 'p3', '2/2', 'W - p6', 'W - p4' ],
            [ 'p4', '1/2', 'W - p5', 'L - p3' ],
            [ 'p5', '2/2', 'L - p4', 'W - p6' ],
            [ 'p6', '1/2', 'L - p3', 'L - p5' ]
          ]
        ]);
      });
    });

    describe('hasDropedPlayers()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.size.and.callThrough();
      });

      it('should request list of droped players', function() {
        state.hasDropedPlayers({ players: ['players'] });
        
        expect(this.playersService.dropedInRound)
          .toHaveBeenCalledWith(null, ['players']);
      });
      
      using([
        [ 'droped_players'   , 'has_droped' ],
        [ [ [], [ {}, {} ] ] , true         ],
        [ [ [], [ {} ] ]     , true         ],
        [ [ [], [ ] ]        , false        ],
      ], function(e, d) {
        it('should check wheter droped players list is empty, '+d, function() {
          this.playersService.dropedInRound._retVal = e.droped_players;

          expect(state.hasDropedPlayers({ players: ['players'] }))
            .toBe(e.has_droped);
        });
      });
    });

    describe('playersDroped()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should request list of droped players', function() {
        expect(state.playersDroped({ players: ['players'] }))
          .toBe('players.dropedInRound.returnValue');
        expect(this.playersService.dropedInRound)
          .toHaveBeenCalledWith(null, ['players']);
      });
    });

    describe('playersNotDroped()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should request list of not droped players', function() {
        expect(state.playersNotDroped({ players: ['players'] }))
          .toBe('players.notDropedInRound.returnValue');
        expect(this.playersService.notDropedInRound)
          .toHaveBeenCalledWith(null, ['players']);
      });
    });

    describe('playersNotDropedInLastRound()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should request list of not droped players', function() {
        expect(state.playersNotDropedInLastRound({
          players: ['players'],
          rounds: [ [], [], [] ]
        }))
          .toBe('players.notDropedInRound.returnValue');
        expect(this.playersService.notDropedInRound)
          .toHaveBeenCalledWith(3, ['players']);
      });
    });

    describe('createNextRound()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.roundsService = spyOnService('rounds');
      });

      it('should request list of not droped players', function() {
        state.createNextRound({
          players: ['players'],
          rounds: [ [], [], [] ]
        });
        
        expect(this.playersService.notDropedInRound)
          .toHaveBeenCalledWith(3, ['players']);
      });

      it('should create next round from not droped players', function() {
        expect(state.createNextRound({
          players: ['players'],
          rounds: [ [], [], [] ]
        }))
          .toBe('rounds.createNextRound.returnValue');
        expect(this.roundsService.createNextRound)
          .toHaveBeenCalledWith('players.notDropedInRound.returnValue');
      });
    });
  });

});
