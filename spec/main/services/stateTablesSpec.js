'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('stateTables', function() {

    var stateTables;

    beforeEach(inject([ 'stateTables', function(_stateTables) {
      stateTables = _stateTables;
    }]));

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
        var res = stateTables.rankingTables(st);
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
          [ [ { table:1,
                victory: 'assassination',
                p1: { name: 'p1', list: 'list1', tournament: 1,
                      control: 2, army: 3, custom_field: 21 },
                p2: { name: 'p2', list: 'list2', tournament: 2,
                      control: 4, army: 6, custom_field: 12 } }
            ],
            [ { table:2,
                victory: null,
                p1: { name: 'p3', list: 'list3', tournament: 3,
                      control: 6, army: 9, custom_field: 24 },
                p2: { name: 'p4', list: 'list4', tournament: 4,
                      control: 8, army: 12, custom_field: 42 } },
              { table:3,
                victory: 'assassination',
                p1: { name: 'p5', list: 'list5', tournament: 5,
                      control: 10, army: 15, custom_field: 27 },
                p2: { name: 'p6', list: 'list6', tournament: 6,
                      control: 12, army: 18, custom_field: 72 } }
              ],
          ]
        ], custom_fields: {
          player: 'pCustom',
          game: 'gCustom'
        } };
        var res = stateTables.roundTables(1, st);
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
        var res = stateTables.roundsSummaryTables(st);
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
  });

});
