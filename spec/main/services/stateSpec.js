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
        spyOn(state, 'updatePlayersPoints').and.returnValue(['updated_players']);
        spyOn(state, 'store');
        this.data = {
          test: 'value'
        };
        this.result = state.create(this.data);
      });

      it('should update players points', function() {
        expect(state.updatePlayersPoints).toHaveBeenCalled();
        expect(this.result.players).toEqual(['updated_players']);
      });

      it('should create default state', function() {
        expect(this.result).toEqual({
          test: 'value',
          players: ['updated_players'],
          rounds: [],
          bracket: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
          }
        });
      });

      it('should store state', function() {
        expect(state.store).toHaveBeenCalledWith(this.result);
      });

      when('expected fields exist in data', function() {
        this.data = {
          test: 'value',
          players: [ [ 'toto' ] ],
          rounds: [ 'titi' ],
          bracket: [ 'bracket' ],
          ranking: {
            player: 'player',
            team: 'team'
          }
        };
        this.result = state.create(this.data);
      }, function() {
        it('should not modify them', function() {
          expect(this.result).toEqual(_.extend(this.data, {
            players: ['updated_players']
          }));
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

    describe('hasPlayers(<st>)', function() {
      it('should test if one or more player are defined', function() {
        expect(state.hasPlayers({ players: [[]] })).toBe(false);
        expect(state.hasPlayers({ players: [[],[{}]] })).toBe(true);
      });
    });

    describe('hasPlayerGroups(<st>)', function() {
      it('should test if more than one player group is defined', function() {
        expect(state.hasPlayerGroups({ players: [[]] })).toBe(false);
        expect(state.hasPlayerGroups({ players: [[],[]] })).toBe(true);
      });
    });

    describe('isTeamTournament(<st>)', function() {
      it('should test if one or more team are defined', function() {
        expect(state.isTeamTournament({ teams: [[]] })).toBe(false);
        expect(state.isTeamTournament({ teams: [[],[{}]] })).toBe(true);
      });
    });

    describe('clearBracket(<st>)', function() {
      it('should clear all brackets', function() {
        expect(state.clearBracket({ players: _.repeat(3, {}) }))
          .toEqual([undefined, undefined, undefined]);
      });
    });

    describe('setBracketLength(<st>, <length>)', function() {
      when('bracket is longer than <length>', function() {
        this.coll = { bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should return bracket', function() {
          expect(state.setBracketLength(this.coll, 1))
            .toEqual(this.coll.bracket);
          expect(state.setBracketLength(this.coll, 2))
            .toEqual(this.coll.bracket);
          expect(state.setBracketLength(this.coll, 3))
            .toEqual(this.coll.bracket);
        });
      });

      when('bracket is shorter than <length>', function() {
        this.coll = { bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should append undefined', function() {
          expect(state.setBracketLength(this.coll, 4))
            .toEqual([ undefined, 4, 5, undefined ]);
          expect(state.setBracketLength(this.coll, 6))
            .toEqual([ undefined, 4, 5, undefined, undefined, undefined ]);
        });
      });
    });

    describe('setBracket(<st>, <index>)', function() {
      when('bracket is shorter than <length>', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should append undefined and set bracket[<index>]', function() {
          expect(state.setBracket(this.coll, 3))
            .toEqual([ undefined, 4, 5, 2 ]);
          expect(state.setBracket(this.coll, 5))
            .toEqual([ undefined, 4, 5, undefined, undefined, 2 ]);
        });
      });

      when('bracket is not set', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should set bracket[<index>]', function() {
          expect(state.setBracket(this.coll, 0))
            .toEqual([ 2, 4, 5 ]);
        });
      });

      when('bracket is set', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should not modify bracket[<index>]', function() {
          expect(state.setBracket(this.coll, 1))
            .toEqual([ undefined, 4, 5 ]);
          expect(state.setBracket(this.coll, 2))
            .toEqual([ undefined, 4, 5 ]);
        });
      });
    });

    describe('resetBracket(<st>, <index>)', function() {
      when('bracket is shorter than <length>', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should append undefined', function() {
          expect(state.resetBracket(this.coll, 3))
            .toEqual([ undefined, 4, 5, undefined ]);
          expect(state.resetBracket(this.coll, 5))
            .toEqual([ undefined, 4, 5, undefined, undefined, undefined ]);
        });
      });

      when('bracket is not set', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should not modify bracket', function() {
          expect(state.resetBracket(this.coll, 0))
            .toEqual([ undefined, 4, 5 ]);
        });
      });

      when('bracket is set', function() {
        this.coll = { rounds: [ [], [] ], bracket: [ undefined, 4, 5 ] };
      }, function() {
        it('should not modify bracket[<index>]', function() {
          expect(state.resetBracket(this.coll, 1))
            .toEqual([ undefined, undefined, 5 ]);
          expect(state.resetBracket(this.coll, 2))
            .toEqual([ undefined, 4, undefined ]);
        });
      });
    });

    describe('canBeBracketTournament(<st>, <group_index>)', function() {
      using([
        [ 'players'           , 'can' ],
        [ [ [] ]              , false ],
        [ [ _.repeat(1, {}) ] , true  ],
        [ [ _.repeat(2, {}) ] , true  ],
        [ [ _.repeat(3, {}) ] , false ],
        [ [ _.repeat(4, {}) ] , true  ],
        [ [ _.repeat(5, {}) ] , false ],
        [ [ _.repeat(7, {}) ] , false ],
        [ [ _.repeat(8, {}) ] , true  ],
      ], function(e, d) {
        it('should test whether group\'s length is a power of 2, '+d, function() {
          expect(state.canBeBracketTournament({
            players: e.players
          }, 0)).toBe(e.can);
        });
      });
    });

    describe('bracketNbRounds(<st>, <group_index>)', function() {
      when('bracket is set', function() {
      }, function() {
        using([
          [ 'rounds'               , 'nb' ],
          [ [ [], [] ]             , 0    ],
          [ [ [], [], [] ]         , 1    ],
          [ [ [], [], [], [], [] ] , 3    ],
        ], function(e, d) {
          it('should return number of rounds since bracket start, '+d, function() {
            expect(state.bracketNbRounds({ bracket: [ 2 ], rounds: e.rounds }, 0))
              .toBe(e.nb);
          });
        });
      });

      when('bracket is not set', function() {
      }, function() {
        it('should return 0', function() {
          expect(state.bracketNbRounds({ bracket: [ undefined ], rounds: [ [], [] ] }, 0))
            .toBe(0);
        });
      });
    });

    describe('bracketRoundof(<st>, <group_index>, <round_index>)', function() {
      when('bracket is not set', function() {
      }, function() {
        it('should return "Not in bracket"', function() {
          expect(state.bracketRoundOf({ bracket: [] }, 0, 0)).toMatch(/not in bracket/i);
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
            expect(state.bracketRoundOf({
              bracket: [0],
              players: [ _.repeat(16, {}) ]
            }, 0, e.round_index)).toMatch(e.desc);
          });
        });
      });
    });

    describe('updatePlayersPoints()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.updatePoints with bracket information', function() {
        var dummy_players = [ _.repeat(4, {}), _.repeat(2, {}), _.repeat(5, {}) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        
        expect(state.updatePlayersPoints({
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: ['rounds']
        })).toBe('players.updatePoints.returnValue');
        expect(this.playersService.updatePoints)
          .toHaveBeenCalledWith(dummy_players, [ 'rounds' ],
                                dummy_bracket, [ 2, 1, 2.5 ]);
      });
    });

    describe('sortPlayersByRank()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.sort with bracket information', function() {
        var dummy_players = [ _.repeat(4, {}), _.repeat(2, {}), _.repeat(5, {}) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        var st = {
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: _.repeat(3, {})
        };

        expect(state.sortPlayersByRank(st))
          .toBe('players.sort.returnValue');
        expect(this.playersService.sort)
          .toHaveBeenCalledWith(dummy_players, st, [ false, false, true ]);
      });
    });

    describe('sortPlayersByName()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.sort with bracket information', function() {
        var dummy_players = [ _.repeat(4, {}), _.repeat(2, {}), _.repeat(5, {}) ];
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
        var st = { players: [[
          { name: 'p1', origin: 'c1', faction: 'f1',
            points: { tournament: 5, sos: 4, control: 15, army: 32 } },
          { name: 'p2', origin: 'c2', faction: 'f2',
            points: { tournament: 3, sos: 4, control: 12, army: 32 } },
          { name: 'p3', origin: 'c3', faction: 'f3',
            points: { tournament: 3, sos: 7, control: 12, army: 48 } },
        ]], bracket: [], rounds: [], ranking: { player: 'tp*10+sos' } };
        var res = state.rankingTables(st);
        expect(res).toEqual([[
          [ 'Rank', 'Name', 'Origin', 'Faction', 'TP', 'SoS', 'CP', 'AP' ],
          [ 1, 'p1', 'c1', 'f1', 5, 4, 15, 32 ],
          [ 2, 'p3', 'c3', 'f3', 3, 7, 12, 48 ],
          [ 3, 'p2', 'c2', 'f2', 3, 4, 12, 32 ]
        ]]);
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
              p1: { name: 'p1', list: 'list1', tournament: 1, control: 2, army: 3 },
              p2: { name: 'p2', list: 'list2', tournament: 2, control: 4, army: 6 } },
            { table:2,
              p1: { name: 'p3', list: 'list3', tournament: 3, control: 6, army: 9 },
              p2: { name: 'p4', list: 'list4', tournament: 4, control: 8, army: 12 } },
            { table:3,
              p1: { name: 'p5', list: 'list5', tournament: 5, control: 10, army: 15 },
              p2: { name: 'p6', list: 'list6', tournament: 6, control: 12, army: 18 } },
          ]
        ]};
        var res = state.roundTables(st, 1);
        expect(res).toEqual([
          [ [ 'Table', 'Player1', 'Player2', 'Player1.list', 'Player2.list',
              'Player1.tp', 'Player2.tp', 'Player1.cp', 'Player2.cp', 'Player1.ap', 'Player2.ap' ],
            [ 1, 'p1', 'p2', 'list1', 'list2', 1, 2, 2, 4, 3, 6 ]
          ],
          [ [ 'Table', 'Player1', 'Player2', 'Player1.list', 'Player2.list',
              'Player1.tp', 'Player2.tp', 'Player1.cp', 'Player2.cp', 'Player1.ap', 'Player2.ap' ],
            [ 2, 'p3', 'p4', 'list3', 'list4', 3, 4, 6, 8, 9, 12 ],
            [ 3, 'p5', 'p6', 'list5', 'list6', 5, 6, 10, 12, 15, 18 ]
          ]
        ]);
      });
    });
  });

});
