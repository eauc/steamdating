'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('state', function() {

    var state;

    beforeEach(inject([ 'state', function(_state) {
      state = _state;
    }]));

    describe('isEmpty()', function() {
      it('should test whether teams players and rounds are empty', function() {
        expect(state.isEmpty({ players: [[],[]], rounds: [[]] })).toBe(true);
        expect(state.isEmpty({ players: [[],[1]], rounds: [[]] })).toBe(false);
        expect(state.isEmpty({ players: [[],[]], rounds: [[1]] })).toBe(false);
      });
    });

    describe('create(<data>)', function() {
      beforeEach(function() {
        this.data = {
          test: 'value'
        };
        this.result = state.create(this.data);
      });

      it('should not modify data', function() {
        expect(this.data).toEqual({ test: 'value' });
        expect(this.result).not.toBe(this.data);
      });

      it('should add default fields', function() {
        expect(this.result.players).toEqual([[]]);
        expect(this.result.rounds).toEqual([]);
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
          expect(this.result).toEqual(this.data);
        });
      });
    });

    describe('init()', function() {
      beforeEach(function() {
        this.result = state.init();
      });

      it('should create default state', function() {
        expect(this.result).toEqual({
          players: [[]],
          rounds: [],
          bracket: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
          }
        });
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
          expect(state.setBracketLength(this.coll, 1)).toEqual(this.coll.bracket);
          expect(state.setBracketLength(this.coll, 2)).toEqual(this.coll.bracket);
          expect(state.setBracketLength(this.coll, 3)).toEqual(this.coll.bracket);
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
      it('should test whether group\'s length is a power of 2', function() {
        expect(state.canBeBracketTournament({
          players: [ [] ]
        }, 0)).toBe(false);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(1, {}) ]
        }, 0)).toBe(true);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(2, {}) ]
        }, 0)).toBe(true);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(3, {}) ]
        }, 0)).toBe(false);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(4, {}) ]
        }, 0)).toBe(true);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(5, {}) ]
        }, 0)).toBe(false);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(7, {}) ]
        }, 0)).toBe(false);
        expect(state.canBeBracketTournament({
          players: [ _.repeat(8, {}) ]
        }, 0)).toBe(true);
      });
    });

    describe('bracketNbRounds(<st>, <group_index>)', function() {
      when('bracket is set', function() {
      }, function() {
        it('should return number of rounds since bracket start', function() {
          expect(state.bracketNbRounds({ bracket: [ 2 ], rounds: [ [], [] ] }, 0))
            .toBe(0);
          expect(state.bracketNbRounds({ bracket: [ 2 ], rounds: [ [], [], [] ] }, 0))
            .toBe(1);
          expect(state.bracketNbRounds({ bracket: [ 2 ], rounds: [ [], [], [], [], [] ] }, 0))
            .toBe(3);
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
        it('should return a description of the bracket round', function() {
          expect(state.bracketRoundOf({
            bracket: [0],
            players: [ _.repeat(16, {}) ]
          }, 0, 0)).toMatch(/round of 8/i);
          expect(state.bracketRoundOf({
            bracket: [0],
            players: [ _.repeat(16, {}) ]
          }, 0, 1)).toMatch(/quarter-finals/i);
          expect(state.bracketRoundOf({
            bracket: [0],
            players: [ _.repeat(16, {}) ]
          }, 0, 2)).toMatch(/semi-finals/i);
          expect(state.bracketRoundOf({
            bracket: [0],
            players: [ _.repeat(16, {}) ]
          }, 0, 3)).toMatch(/final/i);
          expect(state.bracketRoundOf({
            bracket: [0],
            players: [ _.repeat(16, {}) ]
          }, 0, 4)).toMatch(/ended/i);
        });
      });
    });

    describe('updatePlayersPoints()', function() {
      beforeEach(inject(function(players) {
        this.players = players;
        spyOn(players, 'updatePoints').and.returnValue([ 'new_players' ]);
      }));

      it('should call players.updatePoints with bracket information', function() {
        var dummy_players = [ _.repeat(4, {}), _.repeat(2, {}), _.repeat(5, {}) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        
        expect(state.updatePlayersPoints({
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: ['rounds']
        })).toEqual([ 'new_players' ]);
        expect(this.players.updatePoints)
          .toHaveBeenCalledWith(dummy_players, [ 'rounds' ],
                                dummy_bracket, [ 2, 1, 2.5 ]);
      });
    });

    describe('sortPlayers()', function() {
      beforeEach(inject(function(players) {
        this.players = players;
        spyOn(players, 'sort').and.returnValue([ 'new_players' ]);
      }));

      it('should call players.sort with bracket information', function() {
        var dummy_players = [ _.repeat(4, {}), _.repeat(2, {}), _.repeat(5, {}) ];
        var dummy_bracket = [ 4, undefined, 2 ];
        var st = {
          bracket: dummy_bracket,
          players: dummy_players,
          rounds: _.repeat(3, {})
        };

        expect(state.sortPlayers(st)).toEqual([ 'new_players' ]);
        expect(this.players.sort)
          .toHaveBeenCalledWith(dummy_players, st, [ false, false, true ]);
      });
    });
  });

});
