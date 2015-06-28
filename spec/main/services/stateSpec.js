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
          version: 2,
          test: 'value',
          players: [ [], 'updated' ],
          rounds: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap'
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
          version: 2,
          test: 'value',
          players: [ [ { name: 'toto' } ] ],
          rounds: [ { scenario: 'scenar',
                      games: [ [ { table: 1 } ] ] } ],
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
            version: 2,
            players: [ [ { name : 'toto', members: [],
                           droped: null, faction : null, origin : null, team : null,
                           custom_field : 0, notes : null, lists : [  ], lists_played : [  ],
                           points : { tournament : 0, sos : 0, control : 0,
                                      army : 0, custom_field : 0 }
                         }
                       ], 'updated' ],
            rounds: [ { scenario: 'scenar',
                        games: [
              [ { table: 1,
                  victory: null,
                  games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                }
              ]
            ] } ],
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
            players: [
              [ {}, {}, {}, {} ],
              [ {}, {} ]
            ],
            rounds: [ [ { table: 1 }, { table: 2 }, { table: 3 } ] ],
          };
          var result = state.create(data);

          expect(result.version).toEqual(2);
          expect(result.rounds).toEqual([ {
            scenario: null,
            bracket: [],
            games: [
              [ { table : 1, victory : null, games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                },
                { table : 2, victory : null, games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                },
              ], [
                { table : 3, victory : null, games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                }
              ]
            ]
          } ]);
        });
      });
      
      describe('version 2 migration', function() {
        it('should wrap rounds games into groups', function() {
          var data = {
            version: 1,
            bracket: [ null, 1, 3, 5],
            rounds: [
              [ [ { table: 1 }, { table: 2 } ] ],
              [],
              [],
              []
            ],
          };
          var result = state.create(data);

          expect(result.version).toEqual(2);
          expect(result.rounds[0]).toEqual({
            scenario: null,
            bracket: [null, null, null, null],
            games: [
              [ { table : 1, victory : null, games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                },
                { table : 2, victory : null, games: [],
                  p1 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null },
                  p2 : { name : null, list : null, team_tournament : null, tournament : null,
                         control : null, army : null, custom_field : null }
                }
              ]
            ]
          });
          expect(result.rounds[1]).toEqual({
            scenario: null,
            bracket: [null, 1, null, null],
            games: []
          });
          expect(result.rounds[2]).toEqual({
            scenario: null,
            bracket: [null, 2, null, null],
            games: []
          });
          expect(result.rounds[3]).toEqual({
            scenario: null,
            bracket: [null, 3, 1, null],
            games: []
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
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });
      
      it('should test if state.players has teams', function() {
        expect(state.isTeamTournament({players: 'players'}))
          .toBe('players.hasTeam.returnValue');
        expect(this.playersService.hasTeam)
          .toHaveBeenCalledWith('players');
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

    describe('groupIsInBracket(<group_index>)', function() {
      when('rounds is empty', function() {
      }, function() {
        it('should return false', function() {
          expect(state.groupIsInBracket(0, {
            rounds: [],
          })).toBe(false);
        });
      });

      when('rounds is not empty', function() {
        this.roundService = spyOnService('round');
      }, function() {
        it('should return a description of the bracket round', function() {
          expect(state.groupIsInBracket(42, {
            rounds: [ 'first', 'last' ]
          })).toBe('round.groupIsInBracket.returnValue');

          expect(this.roundService.groupIsInBracket)
            .toHaveBeenCalledWith(42, 'last');
        });
      });
    });

    describe('groupBracketRoundof(<group_index>)', function() {
      when('rounds is empty', function() {
      }, function() {
        it('should return "Not in bracket"', function() {
          expect(state.groupBracketRoundOf(0, {
            rounds: [],
          })).toMatch(/not in bracket/i);
        });
      });

      when('rounds is not empty', function() {
        this.roundService = spyOnService('round');
      }, function() {
        it('should return a description of the bracket round', function() {
          expect(state.groupBracketRoundOf(42, {
            rounds: [ 'first', 'last' ]
          })).toBe('round.groupBracketRoundOf.returnValue');

          expect(this.roundService.groupBracketRoundOf)
            .toHaveBeenCalledWith(42, 'last');
        });
      });
    });

    describe('updatePlayersPoints()', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
      });

      it('should call players.updatePoints with bracket information', function() {
        var dummy_players = [ R.repeat({}, 4), R.repeat({}, 2), R.repeat({}, 5) ];
        
        expect(state.updatePlayersPoints({
          players: dummy_players,
          rounds: ['rounds']
        })).toEqual({
          players: 'players.updatePoints.returnValue',
          rounds: ['rounds']
        });
        expect(this.playersService.updatePoints)
          .toHaveBeenCalledWith([ 'rounds' ],
                                dummy_players);
      });
    });
    
    when('updateBestsPlayers()', function() {
      this.ret = state.updateBestsPlayers({
        players: this.dummy_players,
        rounds: ['round1', 'round2', 'round3']
      });
    }, function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.simplePlayers.and.callThrough();
        this.playersService.hasTeam.and.callThrough();
      });

      when('state is not a team tournament', function() {
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
        
        this.dummy_players = [
          [ { name: 'p1', faction: 'f1' } ]
        ];
      }, function() {
        it('should set state.bests from players.bests', function() {
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

      when('state is a team tournament', function() {
        spyOn(state, 'sortPlayersByRank')
          .and.returnValue([[
            { rank: 1,
              players: [ { name: 't1', members: [
                { name: 'p1', faction: 'f1' },
                { name: 'p2', faction: 'f2' },
                { name: 'p3', faction: 'f1' }
              ] } ]
            },
            { rank: 2,
              players: [ { name: 't2', members: [
                { name: 'p4', faction: 'f2' },
                { name: 'p5', faction: 'f3' }
              ] } ]
            },
            { rank: 3,
              players: [ { name: 't3', members: [
                { name: 'p6', faction: 'f3' },
                { name: 'p7', faction: 'f4' },
                { name: 'p8', faction: 'f1' }
              ] } ]
            },
          ]]);
        
        this.dummy_players = [
          [ 
            { name: 't1', members: [
              { name: 'p1', faction: 'f1' },
              { name: 'p2', faction: 'f2' },
              { name: 'p3', faction: 'f1' }
            ] }
          ]
        ];
      }, function() {
        it('should set state.bests_teams from players.bests', function() {
          expect(this.ret.bests_teams).toBe('players.bests.returnValue');
          expect(this.playersService.bests)
            .toHaveBeenCalledWith(3, this.dummy_players);
        });
        
        it('should set state.bests from players.bestsSimples', function() {
          expect(this.ret.bests).toBe('players.bestsSimples.returnValue');
          expect(this.playersService.bestsSimples)
            .toHaveBeenCalledWith(3, this.dummy_players);
        });
        
        it('should extract bests simple players in each faction', function() {
          expect(this.ret.bests_in_faction).toEqual({
            f1: [ 'p1', 1 ],
            f2: [ 'p2', 1 ],
            f3: [ 'p5', 2 ],
            f4: [ 'p7', 3 ]
          });
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
        var st = {
          players: dummy_players,
          rounds: [
            {},
            { bracket: [ null, 1, 4 ] }
          ]
        };

        expect(state.sortPlayersByRank(st))
          .toBe('players.sort.returnValue');
        expect(this.playersService.sort)
          .toHaveBeenCalledWith(st, [ false, true, true ], dummy_players);
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
        this.roundService = spyOnService('round');
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
          .toBe('round.create.returnValue');
        expect(this.roundService.create)
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
            { games: [ [ { table: 1, p1: { name: 'p1' }, p2: { name: 'p2' } },
                         { table: 2, p1: { name: 'p3' }, p2: { name: 'p4' } },
                         { table: 3, p1: { name: 'p5' }, p2: { name: 'p6' } },
                       ] ]
            },
            { games: [ [ { table: 2, p1: { name: 'p1' }, p2: { name: 'p3' } },
                         { table: 3, p1: { name: 'p2' }, p2: { name: 'p5' } },
                         { table: 1, p1: { name: 'p4' }, p2: { name: 'p6' } },
                       ] ]
            },
          ]
        };
      });
      
      it('should compute each game fitness', function() {
        var round = { games: [
          [ // same faction
            { table: 3, p1: { name: 'p1' }, p2: { name: 'p4' } },
            // table already
            { table: 2, p1: { name: 'p2' }, p2: { name: 'p3' } },
            // pair already, same origin
            { table: 1, p1: { name: 'p5' }, p2: { name: 'p6' } },
          ]
        ] };
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
