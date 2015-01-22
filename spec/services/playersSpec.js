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

      it('should leave at least one group', function() {
        expect(players.drop([ [{ name: 'toto1' }] ], { name: 'toto1' }))
          .toEqual([[]]);
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
        var bracket_start = [ 3, 4 ];
        var bracket_weight = [ 32, 42 ];
        var res = players.updatePoints(this.coll, dummy_rounds,
                                       bracket_start, bracket_weight);

        expect(this.rounds.pointsForPlayer.calls.count()).toBe(5);
        expect(this.rounds.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'toto1', 3, 32);
        expect(this.rounds.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'toto2', 3, 32);
        expect(this.rounds.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'toto3', 3, 32);
        expect(this.rounds.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'tata1', 4, 42);
        expect(this.rounds.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'tata2', 4, 42);

        expect(res[0][2].points).toBe(this.dummy_points);
        expect(res[1][1].points).toBe(this.dummy_points);
      });

      it('should update SoS gained in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];
        var bracket_start = [ 3, 4 ];
        var bracket_weight = [ 32, 42 ];

        var res = players.updatePoints(this.coll, dummy_rounds,
                                       bracket_start, bracket_weight);

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
        this.is_bracket = [ false, false, true ];
        spyOn(players, 'sortGroup').and.callFake(function(g) { return g+'sorted'; });
      });

      it('should sort each group using players.sortGroup', function() {
        expect(players.sort(this.coll, this.state, this.is_bracket))
          .toEqual([ 'group1sorted', 'group2sorted', 'group3sorted' ]);

        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.coll[0], this.state, this.is_bracket[0]);
        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.coll[1], this.state, this.is_bracket[1]);
        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.coll[2], this.state, this.is_bracket[2]);
      });
    });

    describe('sortGroup(<state>, <is_bracket>)', function() {
      beforeEach(function() {
        this.coll = [
          { name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } },
          { name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } },
          { name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } },
          { name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } },
          { name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } },
        ];
        this.state = {
          rounds: _.repeat(4, {}),
          ranking: {}
        };
      });

      when('<is bracket> is false', function() {
      }, function() {
        it('should sort group using <state.ranking.player> criterion', function() {
          this.state.ranking.player = 'sos';
          var res = players.sortGroup(this.coll, this.state);
          expect(res).toEqual([
{ rank: 1,
  players: [{ name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } }] },
{ rank: 2,
  players: [{ name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } }] },
{ rank: 3,
  players: [{ name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } }] },
{ rank: 4,
  players: [{ name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } }] },
{ rank: 5,
  players: [{ name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } }] },
          ]);

          this.state.ranking.player = 'tp';
          res = players.sortGroup(this.coll, this.state);
          expect(res).toEqual([
{ rank: 1, 
  players: [{ name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } }] },
{ rank: 2, 
  players: [{ name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } }] },
{ rank: 3, 
  players: [{ name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } }] },
{ rank: 4, 
  players: [{ name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } }] },
{ rank: 5, 
  players: [{ name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } }] },
          ]);

          this.state.ranking.player = 'cp';
          res = players.sortGroup(this.coll, this.state);
          expect(res).toEqual([
{ rank: 1, 
  players: [{ name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } }] },
{ rank: 2, 
  players: [{ name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } }] },
{ rank: 3, 
  players: [{ name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } }] },
{ rank: 4, 
  players: [{ name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } }] },
{ rank: 5, 
  players: [{ name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } }] },
          ]);

          this.state.ranking.player = 'ap';
          res = players.sortGroup(this.coll, this.state);
          expect(res).toEqual([
{ rank: 1, 
  players: [{ name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } }] },
{ rank: 2, 
  players: [{ name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } },
            { name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } }] },
{ rank: 4, 
  players: [{ name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } }] },
{ rank: 5, 
  players: [{ name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } }] },
          ]);
        });
      });

      when('<is bracket> is true', function() {
      }, function() {
        it('should sort group using <player.points.bracket>', function() {
          var res = players.sortGroup(this.coll, this.state, true);
          expect(res).toEqual([
{ rank: 1, 
  players: [{ name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } },
            { name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } } ] },
{ rank: 3, 
  players: [{ name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } },
            { name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } },
            { name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } }] },
          ]);
        });
      });
    });

    describe('areAllPaired(<round>)', function() {
      beforeEach(inject(function(round) {
        this.round = round;
        spyOn(round, 'pairedPlayers');

        this.coll = [
          { name: 'p1' },
          { name: 'p2' },
          { name: 'p3' },
        ];
        this.dummy_round = [ 'round' ];
      }));

      it('should check whether all players are paired in <round>', function() {
        this.round.pairedPlayers.and.returnValue([]);
        expect(players.areAllPaired(this.coll, this.dummy_round)).toBe(false);

        this.round.pairedPlayers.and.returnValue([ 'p1', 'p2' ]);
        expect(players.areAllPaired(this.coll, this.dummy_round)).toBe(false);

        this.round.pairedPlayers.and.returnValue([ 'p1', 'p2', 'p3' ]);
        expect(players.areAllPaired(this.coll, this.dummy_round)).toBe(true);

        this.round.pairedPlayers.and.returnValue([ 'p1', 'p2', 'p3', 'p4' ]);
        expect(players.areAllPaired(this.coll, this.dummy_round)).toBe(true);
      });
    });

    describe('indexRangeForGroup(<group>)', function() {
      beforeEach(function() {
        this.players = [
          [ {},{},{},{} ],
          [ {},{} ],
          [ ],
          [ {},{},{} ],
          [ {},{} ]
        ];
      });

      it('should return global players\' index range for <group>', function() {
        expect(players.indexRangeForGroup(this.players, 0)).toEqual([ 0, 4 ]);
        expect(players.indexRangeForGroup(this.players, 1)).toEqual([ 4, 6 ]);
        expect(players.indexRangeForGroup(this.players, 2)).toEqual([ 6, 6 ]);
        expect(players.indexRangeForGroup(this.players, 3)).toEqual([ 6, 9 ]);
        expect(players.indexRangeForGroup(this.players, 4)).toEqual([ 9, 11 ]);
      });
    });

    describe('chunkGroups(<size>)', function() {
      it('should repartition players into group of <size> players', function() {
        var coll = [
          [ {}, {}, {} ],
          [ {}, {}, {}, {} ],
          [ {}, {} ]
        ];
        expect(players.chunkGroups(coll, 2)).toEqual([
          [ {}, {} ],
          [ {}, {} ],
          [ {}, {} ],
          [ {}, {} ],
          [ {} ]
        ]);
        expect(players.chunkGroups(coll, 5)).toEqual([
          [ {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {} ]
        ]);
      });
    });

    describe('splitNewGroup(<player_names>)', function() {
      it('should create a new group from <player_names>', function() {
        var coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
        expect(players.splitNewGroup(coll, [ 'p2', 'p5', 'p6' ]))
          .toEqual([
            [ { name: 'p1' }, { name: 'p3' } ],
            [ { name: 'p4' }, { name: 'p7' } ],
            [ { name: 'p8' }, { name: 'p9' } ],
            [ { name: 'p2' }, { name: 'p5' }, { name: 'p6' } ]
          ]);
        // remove groups that end up empty
        expect(players.splitNewGroup(coll, [ 'p2', 'p8', 'p9' ]))
          .toEqual([
            [ { name: 'p1' }, { name: 'p3' } ],
            [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
            // third group was removed
            [ { name: 'p2' }, { name: 'p8' }, { name: 'p9' } ]
          ]);
      });
    });

    describe('groupForPlayer(<player_name>)', function() {
      it('should return group index for <player_name>', function() {
        var coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
        expect(players.groupForPlayer(coll, 'p2')).toEqual(0);
        expect(players.groupForPlayer(coll, 'p6')).toEqual(1);
        expect(players.groupForPlayer(coll, 'p8')).toEqual(2);
      });
    });

    describe('movePlayerGroupFront(<player_name>)', function() {
      beforeEach(function() {
        this.coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
      });

      when('player is not in first group', function() {
        this.player_name = 'p5';
      }, function() {
        it('should move <player_name> in previous group', function() {
          expect(players.movePlayerGroupFront(this.coll, this.player_name))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' }, { name: 'p5' } ],
              [ { name: 'p4' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });

      when('player is already in first group', function() {
        this.player_name = 'p2';
      }, function() {
        it('should not modify players', function() {
          expect(players.movePlayerGroupFront(this.coll, this.player_name))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });
    });

    describe('movePlayerGroupBack(<player_name>)', function() {
      beforeEach(function() {
        this.coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
      });

      when('player is not in last group', function() {
        this.player_name = 'p5';
      }, function() {
        it('should move <player_name> in previous group', function() {
          expect(players.movePlayerGroupBack(this.coll, this.player_name))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' }, { name: 'p5' } ]
            ]);
        });
      });

      when('player is already in last group', function() {
        this.player_name = 'p9';
      }, function() {
        it('should not modify players', function() {
          expect(players.movePlayerGroupBack(this.coll, this.player_name))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });
    });

    describe('moveGroupFront(<group_index>)', function() {
      beforeEach(function() {
        this.coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
      });

      when('group is not in front', function() {
        this.group_index = 1;
      }, function() {
        it('should move <group_index> one place front', function() {
          expect(players.moveGroupFront(this.coll, this.group_index))
            .toEqual([
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });

      when('group is already in front', function() {
        this.group_index = 0;
      }, function() {
        it('should not modify players', function() {
          expect(players.moveGroupFront(this.coll, this.group_index))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });
    });

    describe('moveGroupBack(<group_index>)', function() {
      beforeEach(function() {
        this.coll = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
          [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
      });

      when('group is not last', function() {
        this.group_index = 1;
      }, function() {
        it('should move <group_index> one place back', function() {
          expect(players.moveGroupBack(this.coll, this.group_index))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p8' }, { name: 'p9' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ]
            ]);
        });
      });

      when('group is already last', function() {
        this.group_index = 2;
      }, function() {
        it('should not modify players', function() {
          expect(players.moveGroupBack(this.coll, this.group_index))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });
    });

    describe('groupSizeIsEven(<group>)', function() {
      it('should check whether <group> size is even', function() {
        expect(players.groupSizeIsEven([ [], [] ])).toBe(true);
        expect(players.groupSizeIsEven([ [] ])).toBe(false);
        expect(players.groupSizeIsEven([ ])).toBe(true);
      });
    });
  });

});
