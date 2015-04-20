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
          version: 1,
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
          version: 1,
          test: 'value',
          players: [ [ { name: 'toto' } ] ],
          rounds: [ [ [ { table: 1 } ] ] ],
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
            version: 1,
            bracket: [ 'bracket' ],
            players: [ [ { name : 'toto', droped: null, faction : null, origin : null, team : null,
                           custom_field : 0, notes : null, lists : [  ], lists_played : [  ],
                           points : { tournament : 0, sos : 0, control : 0,
                                      army : 0, custom_field : 0 }
                         }
                       ], 'updated' ],
            rounds: [ [ [ { table: 1,
                            victory: null,
                            p1 : { name : null, list : null, tournament : null,
                                   control : null, army : null, custom_field : null },
                            p2 : { name : null, list : null, tournament : null,
                                   control : null, army : null, custom_field : null }
                          } ] ] ],
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

      describe('version 1 migration', function() {
        it('should wrap rounds games into groups', function() {
          var data = {
            version: 0,
            rounds: [ [ { table: 1 }, { table: 2 } ] ],
          };
          var result = state.create(data);

          expect(result.version).toEqual(1);
          expect(result.rounds).toEqual([ [
            [ { table : 1, victory : null,
                p1 : { name : null, list : null, tournament : null,
                       control : null, army : null, custom_field : null },
                p2 : { name : null, list : null, tournament : null,
                       control : null, army : null, custom_field : null }
              },
              { table : 2, victory : null,
                p1 : { name : null, list : null, tournament : null,
                       control : null, army : null, custom_field : null },
                p2 : { name : null, list : null, tournament : null,
                       control : null, army : null, custom_field : null }
              }
            ]
          ] ]);
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

    describe('evaluateRoundFitness(<round>)', function() {
      beforeEach(function() {
        this.coll = {
          players: [
            [ { name: 'p1', faction: 'f1', origin: 'o1' },
              { name: 'p2', faction: 'f2', origin: 'o1' },
              { name: 'p3', faction: 'f3', origin: 'o2' },
              { name: 'p4', faction: 'f1', origin: 'o2' },
              { name: 'p5', faction: 'f2', origin: 'o3' },
              { name: 'p6', faction: 'f3', origin: 'o3' },
            ]
          ],
          rounds: [
            [ [ { table: 1, p1: { name: 'p1' }, p2: { name: 'p2' } },
                { table: 2, p1: { name: 'p3' }, p2: { name: 'p4' } },
                { table: 3, p1: { name: 'p5' }, p2: { name: 'p6' } },
              ] ],
            [ [ { table: 2, p1: { name: 'p1' }, p2: { name: 'p3' } },
                { table: 3, p1: { name: 'p2' }, p2: { name: 'p5' } },
                { table: 1, p1: { name: 'p4' }, p2: { name: 'p6' } },
              ] ],
          ]
        };
      });
      
      it('should compute each game fitness', function() {
        var round = [
          [ // same faction
            { table: 3, p1: { name: 'p1' }, p2: { name: 'p4' } },
            // table already
            { table: 2, p1: { name: 'p2' }, p2: { name: 'p3' } },
            // pair already, same origin
            { table: 1, p1: { name: 'p5' }, p2: { name: 'p6' } },
          ]
        ];
        var fitness = state.evaluateRoundFitness(round, this.coll);
        expect(fitness.games).toEqual([
          [ { pair : false, table : false, faction : true,  origin : false },
            { pair : false, table : true,  faction : false, origin : false },
            { pair : true,  table : true,  faction : false, origin : true  } ]
        ]);
        expect(fitness.summary).toEqual([
          '1 players pair(s) have already been played',
          '2 players pair(s) have already played on their table (group)',
          '1 factions mirror match(s)',
          '1 players pair(s) have the same origin'
        ]);
      });
    });

    describe('playerRankPairs', function() {
      beforeEach(function() {
        spyOn(state, 'sortPlayersByRank').and.returnValue([
          // group1
          [ { rank: 1, players: [  { name: 'p1' }, { name: 'p2' } ] },
            { rank: 3, players: [  { name: 'p3' }, { name: 'p4' } ] },
          ],
          // group2
          [ { rank: 1, players: [  { name: 'p5' } ] },
            { rank: 2, players: [  { name: 'p6' } ] },
          ]
        ]);

        this.ret = state.playerRankPairs([ 'state' ]);
      });

      it('should sort players by rank', function() {
        expect(state.sortPlayersByRank)
          .toHaveBeenCalledWith(['state']);
      });

      it('should create an hash of players names -> ranks', function() {
        expect(this.ret).toEqual([
          // group1
          { p1 : 1, p2 : 1, p3 : 3, p4 : 3 },
          // group2
          { p5 : 1, p6 : 2 }
        ]);
      });
    });
  });

});
