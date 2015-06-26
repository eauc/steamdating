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
        expect(players.add(1, {name: 'toto2'}, this.coll)).toEqual([
          [],
          [
            { name: 'toto2' },
          ],
          []
        ]);
      });
    });

    describe('hasTeam()', function() {
      using([
        [ 'players', 'has' ],
        [ [[]] , false ],
        [ [[ { name: 'player' } ]] , false ],
        [ [[ { name: 'player' },
             { name: 'team', members: [] } ]] , false ],
        [ [[ { name: 'player' },
             { name: 'team', members: [{}] } ]] , true ],
        [ [[], [ { name: 'team', members: [{}] } ]] , true ],
      ], function(e, d) {
        it('should check whether <players> contains a team, '+d, function() {
          expect(players.hasTeam(e.players))
            .toBe(e.has);
        });
      });
    });

    describe('maxTeamSize()', function() {
      using([
        [ 'players', 'max' ],
        [ [[]] , 0 ],
        [ [[ { name: 'player' } ]] , 0 ],
        [ [[ { name: 'player' },
             { name: 'team', members: [] } ]] , 0 ],
        [ [[ { name: 'player' },
             { name: 'team', members: [{}] } ]] , 1 ],
        [ [[ { name: 'team', members: [{}] } ],
           [ { name: 'team', members: [{}, {}] } ]] , 2 ],
      ], function(e, d) {
        it('should find max team size in <players>, '+d, function() {
          expect(players.maxTeamSize(e.players))
            .toBe(e.max);
        });
      });
    });

    describe('addToTeam(<team>, <member>)', function() {
      beforeEach(function() {
        this.coll = [
          [],
          [ { name: 'team1' },
            { name: 'team2', members: [ { name: 'member1' } ] },
          ],
        ];
      });

      using([
        [ 'team', 'result' ],
        [ 'team1', [ [], [ { name : 'team1', members : [ { name : 'member' } ] },
                             { name : 'team2', members : [ { name : 'member1' } ] } ] ] ],
        [ 'team2', [ [], [ { name : 'team1' },
                           { name : 'team2', members : [ { name : 'member1' },
                                                         { name : 'member' } ] } ] ] ]
      ], function(e, d) {
        it('should add <member> to <team>', function() {
          this.result = players.addToTeam(e.team, { name: 'member' }, this.coll);
          expect(this.result).toEqual(e.result);
        });
      });
    });

    describe('switchPlayerToTeamMember(<team>, <player>)', function() {
      beforeEach(function() {
        this.coll = [
          [],
          [ { name: 'team1' },
            { name: 'team2', members: [ { name: 'member1' } ] },
          ],
        ];
      });

      it('should convert <player> to a member of <team>', function() {
        this.result = players.switchPlayerToTeamMember('team2',
                                                       { name: 'team1' },
                                                       this.coll);
        expect(this.result).toEqual([
          [ { name : 'team2', members : [ { name : 'member1' },
                                          { name : 'team1' } ] } ]
        ]);
      });
    });

    describe('switchTeamMemberToPlayer(<team>, <gri>, <member>)', function() {
      beforeEach(function() {
        this.coll = [
          [ {} ],
          [ { name: 'team2', members: [ { name: 'member1' },
                                        { name: 'member2' } ] },
          ],
        ];
      });

      it('should convert <member> to a player in <gri>', function() {
        this.result = players.switchTeamMemberToPlayer('team2', 0,
                                                       { name: 'member1' },
                                                       this.coll);
        expect(this.result).toEqual([
          [ {  }, { name : 'member1' } ],
          [ { name : 'team2', members : [ { name : 'member2' } ] } ]
        ]);
      });
    });

    describe('switchMemberBetweenTeams(<old_team>, <new_team>, <member>)', function() {
      beforeEach(function() {
        this.coll = [
          [ { name: 'team1' },
          ],
          [ { name: 'team2', members: [ { name: 'member1' },
                                        { name: 'member2' } ] },
          ],
        ];
      });

      it('should switch <member> between teams', function() {
        this.result = players.switchMemberBetweenTeams('team2', 'team1',
                                                       { name: 'member1' },
                                                       this.coll);
        expect(this.result).toEqual([
          [ { name : 'team1', members : [ { name : 'member1' } ] } ],
          [ { name : 'team2', members : [ { name : 'member2' } ] } ]
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

      using([
        [ 'name'  , 'dropped' ],
        [ 'toto2' , [ [ { name: 'toto1' },
                        { name: 'toto3' },
                      ],
                      [ { name: 'tata1' },
                      ],
                      [ { name: 'tutu1' },
                        { name: 'tutu2' },
                      ] ] ],
        [ 'tutu1' , [ [ { name: 'toto1' },
                        { name: 'toto2' },
                        { name: 'toto3' },
                      ],
                      [ { name: 'tata1' },
                      ],
                      [ { name: 'tutu2' },
                      ] ] ],
        // should drop empty groups
        [ 'tata1' , [ [ { name: 'toto1' },
                        { name: 'toto2' },
                        { name: 'toto3' },
                      ],
                      [ { name: 'tutu1' },
                        { name: 'tutu2' },
                      ] ] ],
      ], function(e, d) {
        it('should drop <player> from any group, '+d, function() {
          expect(players.drop({name: e.name}, this.coll)).toEqual(e.dropped);
        });
      });

      it('should leave at least one group', function() {
        expect(players.drop({ name: 'toto1' }, [ [{ name: 'toto1' }] ]))
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
            { name: 'tata1', members: [ { name: 'tata1a' },
                                        { name: 'tata1b' } ] },
            { name: 'tata2' },
          ]
        ];
      });

      using([
        [ 'name', 'result' ],
        [ 'tata2', { name: 'tata2' } ],
        [ 'toto1', { name: 'toto1' } ],
        // does not find members
        [ 'tata1a', undefined ],
      ], function(e, d) {
        it('should return player, '+d, function() {
          expect(players.player(e.name, this.coll)).toEqual(e.result);
        });
      });
    });

    describe('member(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1', members: [ { name: 'tata1a' },
                                        { name: 'tata1b' } ] },
            { name: 'tata2' },
          ]
        ];
      });

      using([
        [ 'name', 'result' ],
        // does not find primary players
        [ 'tata2', undefined ],
        [ 'toto1', undefined ],
        [ 'tata1a', { name: 'tata1a' } ],
        [ 'tata1b', { name: 'tata1b' } ],
      ], function(e, d) {
        it('should return member, '+d, function() {
          expect(players.member(e.name, this.coll)).toEqual(e.result);
        });
      });
    });

    describe('playerFull(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1', members: [ { name: 'tata1a' },
                                        { name: 'tata1b' } ] },
            { name: 'tata2' },
          ]
        ];
      });

      using([
        [ 'name', 'result' ],
        // does not find primary players
        [ 'tata2', { name: 'tata2' } ],
        [ 'toto1', { name: 'toto1' } ],
        [ 'tata1a', { name: 'tata1a' } ],
        [ 'tata1b', { name: 'tata1b' } ],
      ], function(e, d) {
        it('should return player or member, '+d, function() {
          expect(players.playerFull(e.name, this.coll)).toEqual(e.result);
        });
      });
    });

    describe('names()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto3', members: [ { name: 'member1' }, { name: 'member2' } ] },
            { name: 'toto1' },
            { name: 'toto2', members: [ { name: 'member3' }, { name: 'member6' } ] },
          ],
          [
            { name: 'tata2' },
            { name: 'tata1', members: [ { name: 'member5' }, { name: 'member4' } ] },
          ]
        ];
      });

      it('should return sorted player names list', function() {
        expect(players.names(this.coll)).toEqual([
          'tata1', 'tata2', 'toto1', 'toto2', 'toto3'
        ]);
      });
    });

    describe('namesMembers()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto3', members: [ { name: 'member1' }, { name: 'member2' } ] },
            { name: 'toto1' },
            { name: 'toto2', members: [ { name: 'member3' }, { name: 'member6' } ] },
          ],
          [
            { name: 'tata2' },
            { name: 'tata1', members: [ { name: 'member5' }, { name: 'member4' } ] },
          ]
        ];
      });

      it('should return sorted members names list', function() {
        expect(players.namesMembers(this.coll)).toEqual([
          'member1', 'member2', 'member3', 'member4', 'member5', 'member6'
        ]);
      });
    });

    describe('namesFull()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto3', members: [ { name: 'member1' }, { name: 'member2' } ] },
            { name: 'toto1' },
            { name: 'toto2', members: [ { name: 'member3' }, { name: 'member6' } ] },
          ],
          [
            { name: 'tata2' },
            { name: 'tata1', members: [ { name: 'member5' }, { name: 'member4' } ] },
          ]
        ];
      });

      it('should return sorted players + members names list', function() {
        expect(players.namesFull(this.coll)).toEqual([
          'tata1', 'tata2', 'toto1', 'toto2', 'toto3',
          'member1', 'member2', 'member3', 'member4', 'member5', 'member6'
        ]);
      });
    });

    describe('origins()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { origin: 'toto1' },
            { origin: 'toto2' },
            { origin: 'toto1' },
          ],
          [
            { origin: 'tata1' },
            { origin: undefined },
          ],
          [
            { origin: 'tata1' },
            { origin: 'tutu2' },
          ]
        ];
      });

      it('should return sorted uniq origin names list', function() {
        expect(players.origins(this.coll)).toEqual([
          'tata1', 'toto1', 'toto2', 'tutu2'
        ]);
      });
    });

    describe('originFor(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'player1', origin: 'toto1' },
            { name: 'player2', origin: 'toto2' },
            { name: 'player3', origin: 'toto1' },
          ],
          [
            { name: 'player4', origin: 'tata1' },
            { name: 'player5', origin: undefined },
          ],
          [
            { name: 'player6', origin: 'tata1' },
            { name: 'player7', origin: 'tutu2' },
          ]
        ];
      });

      using([
        [ 'name'    , 'origin'  ],
        [ 'player1' , 'toto1'   ],
        [ 'player4' , 'tata1'   ],
        [ 'player7' , 'tutu2'   ],
        [ 'player5' , undefined ],
        // unknown player
        [ 'unknown' , null      ],
      ], function(e, d) {
        it('should return faction played by <name>, '+d, function() {
          expect(players.originFor(e.name, this.coll)).toEqual(e.origin);
        });
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

      it('should return sorted uniq faction names list appended with base factions', function() {
        expect(players.factions({ toto2: {}, base1: {} }, this.coll)).toEqual([
          'base1', 'tata1', 'toto1', 'toto2', 'tutu2'
        ]);
      });
    });

    describe('forFaction(<f>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'player1', faction: 'f1' },
            { name: 'player2', faction: 'f2' },
            { name: 'player3', faction: 'f1' },
          ],
          [
            { name: 'player4', faction: 'f1' },
            { name: 'player5', faction: undefined },
          ],
          [
            { name: 'player6', faction: 'f1' },
            { name: 'player7', faction: 'f2' },
          ]
        ];
      });

      using([
        [ 'f' , 'players' ],
        [ 'f1' , [ { name: 'player1', faction: 'f1' },
                   { name: 'player3', faction: 'f1' },
                   { name: 'player4', faction: 'f1' },
                   { name: 'player6', faction: 'f1' } ] ],
        [ 'f2' , [ { name: 'player2', faction: 'f2' },
                   { name: 'player7', faction: 'f2' } ] ],
        // unplayed faction
        [ 'f3' , [ ] ],
      ], function(e, d) {
        it('should return list of players for faction <f>, '+d, function() {
          expect(players.forFaction(e.f, this.coll)).toEqual(e.players);
        });
      });
    });

    describe('factionFor<XXX>(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'player1', faction: null,
              members: [
                { name: 'member11', faction: 'f2' },
                { name: 'member12', faction: 'f1' },
              ]},
            { name: 'player2', faction: 'f2' },
            { name: 'player3', faction: 'f1' },
          ],
          [
            { name: 'player4', faction: 'f1' },
            { name: 'player5', faction: undefined },
          ],
          [
            { name: 'player6', faction: 'f1' },
            { name: 'player7', faction: 'f2' },
          ]
        ];
      });

      describe('factionFor(<name>)', function() {
        using([
          [ 'name'    , 'faction' ],
          [ 'player1' , null      ],
          [ 'player4' , 'f1'      ],
          [ 'player7' , 'f2'      ],
          [ 'player5' , undefined ],
          // does not find members
          [ 'member11' , null ],
          [ 'member12' , null ],
          // unknown player
          [ 'unknown' , null      ],
        ], function(e, d) {
          it('should return faction played by primary player <name>, '+d, function() {
            expect(players.factionFor(e.name, this.coll)).toEqual(e.faction);
          });
        });
      });
      
      describe('factionForMember(<name>)', function() {
        using([
          [ 'name'    , 'faction' ],
          [ 'member11' , 'f2' ],
          [ 'member12' , 'f1' ],
          // does not find primary players
          [ 'player1' , null      ],
          [ 'player4' , null      ],
          [ 'player5' , null      ],
          // unknown member
          [ 'unknown' , null      ],
        ], function(e, d) {
          it('should return faction played by member <name>, '+d, function() {
            expect(players.factionForMember(e.name, this.coll)).toEqual(e.faction);
          });
        });
      });
      
      describe('factionForFull(<name>)', function() {
        using([
          [ 'name'    , 'faction' ],
          [ 'member11' , 'f2' ],
          [ 'member12' , 'f1' ],
          // does not find primary players
          [ 'player1' , null      ],
          [ 'player4' , 'f1'      ],
          [ 'player5' , undefined ],
          // unknown member
          [ 'unknown' , null      ],
        ], function(e, d) {
          it('should return faction played by player or member <name>, '+d, function() {
            expect(players.factionForFull(e.name, this.coll)).toEqual(e.faction);
          });
        });
      });
    });

    describe('countByFaction()', function() {
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

      it('should count number of players per faction', function() {
        expect(players.countByFaction(this.coll))
          .toEqual({
            toto1 : 2,
            toto2 : 1,
            tata1 : 2,
            undefined : 1,
            tutu2 : 1
          });
      });
    });

    describe('gamesForRounds(<rounds>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ]
        ];
      });

      it('should update lists played in <rounds>', function() {
        var rounds = [
          { games: [ [ {p1: {name:'toto1'}, p2: {name:'toto2'}},
                       {p1: {name:'toto3'}, p2: {name:'toto4'}},
                       {p1: {name:'tata1'}, p2: {name:'tata2'}},
                       {p1: {name:'tata3'}, p2: {name:'tata4'}},
                     ]
                   ]
          },
          { games: [ [ {p1: {name:'toto4'}, p2: {name:'toto2'}},
                       {p1: {name:'toto3'}, p2: {name:'toto1'}},
                       {p1: {name:'tata2'}, p2: {name:'tata4'}},
                       {p1: {name:'tata1'}, p2: {name:'tata3'}},
                     ]
                   ]
          }
        ];
      
        var res = players.gamesForRounds(rounds, this.coll);

        expect(res).toEqual([
          // group1
          [ // toto1
            [ { p1 : { name : 'toto1' }, p2 : { name : 'toto2' } },
              { p1 : { name : 'toto3' }, p2 : { name : 'toto1' } }
            ],
            // toto3
            [ { p1 : { name : 'toto3' }, p2 : { name : 'toto4' } },
              { p1 : { name : 'toto3' }, p2 : { name : 'toto1' } }
            ]
          ],
          // group2
          [ // tata1
            [ { p1 : { name : 'tata1' }, p2 : { name : 'tata2' } },
              { p1 : { name : 'tata1' }, p2 : { name : 'tata3' } }
            ]
          ]
        ]);
      });
    });

    describe('updateListsPlayed(<rounds>)', function() {
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

        this.roundsService = spyOnService('rounds');
      });

      it('should update lists played in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];

        var res = players.updateListsPlayed(dummy_rounds, this.coll);

        expect(this.roundsService.listsForPlayer.calls.count()).toBe(5);
        expect(res[0][2].lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(res[1][1].lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
      });
    });

    describe('casters()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { lists: [ { faction: 'faction1',
                         caster: 'caster1' },
                       { faction: 'faction2',
                         caster: 'caster2' } ] },
            // ingored
            { lists: null },
            { lists: [ { faction: 'faction1',
                         caster: 'caster3' },
                       // caster names should be unique
                       // -> merged with faction1/caster1
                       { faction: 'faction2',
                         caster: 'caster1' } ] },
          ],
          [
            { lists: [ // caster name cannot be null
                       // ->ignored
                       { faction: 'faction1',
                         caster: null },
                       // faction name can be null
                       // -> ''
                       { faction: null,
                         caster: 'caster4' },
                       // ignored
                       { faction: null,
                         caster: null } ] },
            // ignored
            { lists: [ ] },
          ]
        ];
      });

      it('should return sorted uniq caster names list', function() {
        expect(players.casters(this.coll)).toEqual([
          { faction: '', name: 'caster4' },
          { faction: 'faction1', name: 'caster1' },
          { faction: 'faction1', name: 'caster3' },
          { faction: 'faction2', name: 'caster2' },
        ]);
      });
    });

    describe('forCaster(<c>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'player1', lists: [ { faction: 'faction1',
                                          caster: 'caster1' },
                                        { faction: 'faction2',
                                          caster: 'caster2' } ] },
            { name: 'player2', lists: null },
            { name: 'player3', lists: [ { faction: 'faction1',
                                          caster: 'caster3' },
                                        { faction: 'faction2',
                                          caster: 'caster1' } ] },
          ],
          [
            { name: 'player4', lists: [ { faction: 'faction1',
                                          caster: null },
                                        { faction: null,
                                          caster: 'caster4' },
                                        { faction: null,
                                          caster: null } ] },
            { name: 'player5', lists: [ ] },
          ]
        ];
      });

      using([
        [ 'c' , 'players' ],
        [ 'caster1', [ { name : 'player1', lists : [ { faction : 'faction1', caster : 'caster1' },
                                                     { faction : 'faction2', caster : 'caster2' } ] },
                       { name : 'player3', lists : [ { faction : 'faction1', caster : 'caster3' },
                                                     { faction : 'faction2', caster : 'caster1' }] }] ],
        [ 'caster2', [ { name : 'player1', lists : [ { faction : 'faction1', caster : 'caster1' },
                                                     { faction : 'faction2', caster : 'caster2' }] }] ],
        [ 'caster5', [ ] ],
      ], function(e,d) {
        it('should return players list for caster <c>', function() {
          expect(players.forCaster(e.c, this.coll)).toEqual(e.players);
        });
      });
    });

    describe('updatePoints(<rounds>)', function() {
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

        this.playerService = spyOnService('player');
        this.playerService.updatePoints.and.callFake(function(gri,bw,rs,p) {
          return R.assoc('points', { updatePoints: 'returnValue' }, p);
        });

        this.roundsService = spyOnService('rounds');
        this.roundsService.pointsForPlayer._retVal =
          [ 'rounds.pointsForPlayer.returnValue' ];

        spyOn(players, 'sosFromPlayers').and.returnValue(45);
      });

      it('should update points gained in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];
        var res = players.updatePoints(dummy_rounds,
                                       this.coll);

        expect(this.playerService.updatePoints.calls.count()).toBe(5);
        expect(this.playerService.updatePoints)
          .toHaveBeenCalledWith(0, 1.5, dummy_rounds, { name: 'toto1' });
        expect(this.playerService.updatePoints)
          .toHaveBeenCalledWith(0, 1.5, dummy_rounds, { name: 'toto2' });
        expect(this.playerService.updatePoints)
          .toHaveBeenCalledWith(0, 1.5, dummy_rounds, { name: 'toto3' });
        expect(this.playerService.updatePoints)
          .toHaveBeenCalledWith(1, 1, dummy_rounds, { name: 'tata1' });
        expect(this.playerService.updatePoints)
          .toHaveBeenCalledWith(1, 1, dummy_rounds, { name: 'tata2' });

        expect(res[0][2].points.updatePoints)
          .toBe('returnValue');
        expect(res[1][1].points.updatePoints)
          .toEqual('returnValue');
      });

      it('should update SoS gained in <rounds>', function() {
        var dummy_rounds = [ 'tata' ];
        var res = players.updatePoints(dummy_rounds,
                                       this.coll);

        expect(this.roundsService.opponentsForPlayer)
          .toHaveBeenCalledWith(jasmine.any(String), dummy_rounds);
        expect(this.roundsService.opponentsForPlayer.calls.count()).toBe(5);

        expect(players.sosFromPlayers)
          .toHaveBeenCalledWith('rounds.opponentsForPlayer.returnValue',
                                jasmine.any(Object));
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

      using([
        [ 'players'                   , 'sos' ],
        [ ['toto1', 'toto3', 'tata2'] , 9     ],
        [ ['toto2', 'tata1']          , 6     ],
      ], function(e, d) {
        it('should return SoS calculated from <players>, '+d, function() {
          expect(players.sosFromPlayers(e.players, this.coll))
            .toEqual(e.sos);
        });
      });
    });

    describe('sort(<state>)', function() {
      beforeEach(function() {
        this.coll = [ 'group1', 'group2', 'group3' ];
        this.state = {
          rounds: R.repeat({}, 4),
          ranking: {}
        };
        this.is_bracket = [ false, false, true ];
        spyOn(players, 'sortGroup').and.callFake(function(s, b, g) { return g+'sorted'; });
      });

      it('should sort each group using players.sortGroup', function() {
        expect(players.sort(this.state, this.is_bracket, this.coll))
          .toEqual([ 'group1sorted', 'group2sorted', 'group3sorted' ]);

        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.state, this.is_bracket[0], this.coll[0]);
        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.state, this.is_bracket[1], this.coll[1]);
        expect(players.sortGroup)
          .toHaveBeenCalledWith(this.state, this.is_bracket[2], this.coll[2]);
      });
    });

    describe('sortGroup(<state>, <is_bracket>)', function() {
      var coll = [
        { name: '1', points: { bracket: 1, tournament: 1, sos: 5, control: 3, army: 5 } },
        { name: '2', points: { bracket: 2, tournament: 2, sos: 4, control: 5, army: 25 } },
        { name: '3', points: { bracket: 1, tournament: 3, sos: 3, control: 2, army: 35 } },
        { name: '4', points: { bracket: 2, tournament: 4, sos: 2, control: 1, army: 35 } },
        { name: '5', points: { bracket: 1, tournament: 5, sos: 1, control: 4, army: 150 } },
      ];
      beforeEach(function() {
        this.coll = coll;
        this.state = {
          rounds: R.repeat({}, 4),
          ranking: {}
        };
      });

      when('<is bracket> is false', function() {
      }, function() {
        using([
          [ 'crit' , 'sorted' ],
          [ 'sos'  , [ { rank:1, players: [ coll[0] ] },
                       { rank:2, players: [ coll[1] ] },
                       { rank:3, players: [ coll[2] ] },
                       { rank:4, players: [ coll[3] ] },
                       { rank:5, players: [ coll[4] ] },
                     ] ],
          [ 'tp'   , [ { rank:1, players: [ coll[4] ] },
                       { rank:2, players: [ coll[3] ] },
                       { rank:3, players: [ coll[2] ] },
                       { rank:4, players: [ coll[1] ] },
                       { rank:5, players: [ coll[0] ] },
                     ] ],
          [ 'cp'   , [ { rank:1, players: [ coll[1] ] },
                       { rank:2, players: [ coll[4] ] },
                       { rank:3, players: [ coll[0] ] },
                       { rank:4, players: [ coll[2] ] },
                       { rank:5, players: [ coll[3] ] },
                     ] ],
          [ 'ap'   , [ { rank:1, players: [ coll[4] ] },
                       { rank:2, players: [ coll[2], coll[3] ] },
                       { rank:4, players: [ coll[1] ] },
                       { rank:5, players: [ coll[0] ] },
                     ] ],
        ], function(e, d) {
          it('should sort group using <state.ranking.player> criterion, '+d, function() {
          this.state.ranking.player = e.crit;
          var res = players.sortGroup(this.state, false, coll);
          expect(res).toEqual(e.sorted);
          });
        });
      });

      when('<is bracket> is true', function() {
      }, function() {
        it('should sort group using <player.points.bracket>', function() {
          var res = players.sortGroup(this.state, true, this.coll);
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

      using([
        [ 'paired'                   , 'all' ],
        [ []                         , false ],
        [ [ 'p1', 'p2' ]             , false ],
        [ [ 'p1', 'p2', 'p3' ]       , true  ],
        [ [ 'p1', 'p2', 'p3', 'p4' ] , true  ],
      ], function(e, d) {
        it('should check whether all players are paired in <round>, '+d, function() {
          this.round.pairedPlayers.and.returnValue(e.paired);
          expect(players.areAllPaired(this.dummy_round, this.coll)).toBe(e.all);
        });
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

      using([
        [ 'group' , 'range'  ],
        [ 0       , [ 0, 4 ] ],
        [ 1       , [ 4, 6 ] ],
        [ 2       , [ 6, 6 ] ],
        [ 3       , [ 6, 9 ] ],
        [ 4       , [ 9,11 ] ],
      ], function(e,d) {
        it('should return global players\' index range for <group>, '+d, function() {
          expect(players.indexRangeForGroup(e.group, this.players)).toEqual(e.range);
        });
      });
    });

    describe('chunkGroups(<size>)', function() {
      using([
        [ 'size' , 'chunked' ],
        [ 2      , [ [ {}, {} ],
                     [ {}, {} ],
                     [ {}, {} ],
                     [ {}, {} ],
                     [ {} ] ] ],
        [ 5      , [ [ {}, {}, {}, {}, {} ],
                     [ {}, {}, {}, {} ] ] ],
      ], function(e ,d) {
        it('should repartition players into group of <size> players, '+d, function() {
          var coll = [
            [ {}, {}, {} ],
            [ {}, {}, {}, {} ],
            [ {}, {} ]
          ];
          expect(players.chunkGroups(e.size, coll)).toEqual(e.chunked);
        });
      });
    });

    describe('splitNewGroup(<player_names>)', function() {
      using( [
        [ 'players'            , 'splited' ],
        [ [ 'p2', 'p5', 'p6' ] , [ [ { name: 'p1' }, { name: 'p3' } ],
                                   [ { name: 'p4' }, { name: 'p7' } ],
                                   [ { name: 'p8' }, { name: 'p9' } ],
                                   [ { name: 'p2' }, { name: 'p5' }, { name: 'p6' } ] ] ],
        // remove groups that end up empty
        [ [ 'p2', 'p8', 'p9' ] , [ [ { name: 'p1' }, { name: 'p3' } ],
                                   [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
                                   // third group was removed
                                   [ { name: 'p2' }, { name: 'p8' }, { name: 'p9' } ] ] ],
      ], function(e, d) {
        it('should create a new group from <player_names>, '+d, function() {
          var coll = [
            [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
            [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
            [ { name: 'p8' }, { name: 'p9' } ]
          ];
          expect(players.splitNewGroup(e.players, coll))
            .toEqual(e.splited);
        });
      });
    });

    describe('groupForPlayer(<player_name>)', function() {
      using([
        [ 'player' , 'group' ],
        [ 'p2'     , 0       ],
        [ 'p6'     , 1       ],
        [ 'p8'     , 2       ],
      ], function(e, d) {
        it('should return group index for <player_name>, '+d, function() {
          var coll = [
            [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
            [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
            [ { name: 'p8' }, { name: 'p9' } ]
          ];
          expect(players.groupForPlayer(e.player, coll)).toEqual(e.group);
        });
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
          expect(players.movePlayerGroupFront(this.player_name, this.coll))
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
          expect(players.movePlayerGroupFront(this.player_name, this.coll))
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
          expect(players.movePlayerGroupBack(this.player_name, this.coll))
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
          expect(players.movePlayerGroupBack(this.player_name, this.coll))
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
          expect(players.moveGroupFront(this.group_index, this.coll))
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
          expect(players.moveGroupFront(this.group_index, this.coll))
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
          expect(players.moveGroupBack(this.group_index, this.coll))
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
          expect(players.moveGroupBack(this.group_index, this.coll))
            .toEqual([
              [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
              [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
              [ { name: 'p8' }, { name: 'p9' } ]
            ]);
        });
      });
    });

    describe('size()', function() {
      beforeEach(function() {
        this.coll = [
          [ {}, {} ],
          [],
          [ {}, {}, {} ]
        ];
      });

      it('should return the number of players', function() {
        expect(players.size(this.coll)).toEqual(5);
      });
    });

    describe('nbGroups()', function() {
      beforeEach(function() {
        this.coll = [
          [ {}, {} ],
          [],
          [ {}, {}, {} ]
        ];
      });

      it('should return the number of groups', function() {
        expect(players.nbGroups(this.coll)).toEqual(3);
      });
    });

    describe('dropedInRound(<round_index>)', function() {
      using([
        [ 'players' , 'round_index' , 'not_droped' ],
        // simple case : no players droped
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , null ,
          [ [] ]
        ],
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , 0    ,
          [ [] ]
        ],
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , 5    ,
          [ [] ]
        ],
        // a player droped in tournament
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , null ,
          [ [ { name: 'p1', droped: 4 } ] ]
        ],
        // a player droped in later round
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 3    ,
          [ [] ]
        ],
        // a player droped in previous round
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 4    ,
          [ [ { name: 'p1', droped: 4 } ] ]
        ],
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 6    ,
          [ [ { name: 'p1', droped: 4 } ] ]
        ],
      ], function(e ,d) {
        it('should filter player that did drop by <round_index>, '+d, function() {
          expect(players.dropedInRound(e.round_index, e.players))
            .toEqual(e.not_droped);
        });
      });
    });

    describe('notDropedInRound(<round_index>)', function() {
      using([
        [ 'players' , 'round_index' , 'not_droped' ],
        // simple case : no players droped
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , null ,
          [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ]
        ],
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , 0    ,
          [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ]
        ],
        [ [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ] , 5    ,
          [ [ { name: 'p1', droped: null }, { name: 'p2', droped: null } ] ]
        ],
        // a player droped in tournament
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , null ,
          [ [ { name: 'p2', droped: null } ] ]
        ],
        // a player droped in a later round
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 3    ,
          [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ]
        ],
        // a player droped in a previous round
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 4    ,
          [ [ { name: 'p2', droped: null } ] ]
        ],
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: null } ] ] , 6    ,
          [ [ { name: 'p2', droped: null } ] ]
        ],
        // all players droped in a previous round
        [ [ [ { name: 'p1', droped: 4 }, { name: 'p2', droped: 3 } ] ] , 4    ,
          [ [  ] ]
        ],
      ], function(e ,d) {
        it('should filter player that did not drop by <round_index>, '+d, function() {
          expect(players.notDropedInRound(e.round_index, e.players))
            .toEqual(e.not_droped);
        });
      });
    });

    describe('groupSizeIsEven(<group>, <round_index>)', function() {
      using([
        [ 'group'                                , 'round_index' , 'isEven' ],
        // simple case : no players droped
        [ [ { droped: null }, { droped: null } ] , null          , true     ],
        [ [ { droped: null }, { droped: null } ] , 0             , true     ],
        [ [ { droped: null }, { droped: null } ] , 5             , true     ],
        [ [ { droped: null } ]                   , null          , false    ],
        [ [ { droped: null } ]                   , 0             , false    ],
        [ [ { droped: null } ]                   , 5             , false    ],
        // empty group is not even
        [ [ ]                                    , null          , true     ],
        // player droped, check in whole tournament
        [ [ { droped: null }, { droped: 5 } ]    , null          , false    ],
        // player droped in later round
        [ [ { droped: null }, { droped: 5 } ]    , 4             , true     ],
        // player droped in previous round
        [ [ { droped: null }, { droped: 5 } ]    , 5             , false    ],
      ], function(e ,d) {
        it('should check whether <group> size is even in <round_index>, '+d, function() {
          expect(players.groupSizeIsEven(e.round_index, e.group)).toBe(e.isEven);
        });
      });
    });

    describe('tableRangeForGroup(<players>, <group>)', function() {
      beforeEach(function() {
        this.players = [
          [ {},{},{},{} ],
          [ {},{} ],
          [ ],
          [ {},{},{} ],
          [ {},{} ]
        ];
      });

      using([
        [ 'group' , 'range'  ],
        [ 0       , [ 1, 2 ] ],
        [ 1       , [ 3 ]    ],
        [ 2       , [ ]      ],
        [ 3       , [ 4, 5 ] ],
        [ 4       , [ 6 ]    ],
      ], function(e, d) {
        it('should calculate table range for <group>, '+d, function() {
          expect(players.tableRangeForGroup(e.group, this.players)).toEqual(e.range);
        });
      });
    });

    describe('withPoints(<key>, <value>)', function() {
      beforeEach(function() {
        this.players = [
          [ { name: '2', custom_field: 0,
              points: { tournament: 2, sos: 4, control: 5, army: 25, custom_field: 2 } },
            { name: '4',  custom_field: 2,
              points: { tournament: 4, sos: 0, control: 1, army: 35, custom_field: 1 } }
          ],
          [ { name: '1',  custom_field: 1,
              points: { tournament: 1, sos: 1, control: 3, army: 5, custom_field: 1 } },
            { name: '3',  custom_field: 4,
              points: { tournament: 0, sos: 3, control: 0, army: 35, custom_field: 0 } },
            { name: '5',  custom_field: 2,
              points: { tournament: 1, sos: 1, control: 4, army: 0, custom_field: 3 } }
          ],
        ];
      });

      using([
        [ 'key'               , 'value' , 'result' ],
        [ 'custom_field'      , 2 ,  [ '4', '5' ] ],
        [ 'custom_field'      , 4 ,  [ '3' ] ],
        [ 'points.tournament' , 1 ,  [ '1', '5' ] ],
        [ 'points.tournament' , 2 ,  [ '2' ] ],
        // value=0 return empty list
        [ 'points.tournament' , 0 ,  [ ] ],
      ], function(e, d) {
        it('should return the players names with <key> points === <value>, '+d, function() {
          expect(players.withPoints(e.key, e.value, this.players)).toEqual(e.result);
        });
      });
    });

    describe('maxPoints(<key>)', function() {
      beforeEach(function() {
        this.players = [
          [ { name: '2', custom_field: 0,
              points: { tournament: 2, sos: 4, control: 5, army: 25, custom_field: 2 } },
            { name: '4',  custom_field: 2,
              points: { tournament: 4, sos: 0, control: 1, army: 35, custom_field: 1 } }
          ],
          [ { name: '1',  custom_field: 1,
              points: { tournament: 1, sos: 1, control: 3, army: 5, custom_field: 1 } },
            { name: '3',  custom_field: 4,
              points: { tournament: 0, sos: 3, control: 0, army: 35, custom_field: 0 } },
            { name: '5',  custom_field: 2,
              points: { tournament: 1, sos: 1, control: 4, army: 0, custom_field: 3 } }
          ],
        ];
      });

      using([
        [ 'key'               , 'max'],
        [ 'custom_field'      , 4 ],
        [ 'points.control'    , 5 ],
        [ 'points.tournament' , 4 ],
      ], function(e, d) {
        it('should return the max <key> points in players, '+d, function() {
          expect(players.maxPoints(e.key, this.players)).toEqual(e.max);
        });
      });
    });

    describe('bests(<nb_rounds>)', function() {
      beforeEach(function() {
        this.players = [
          [ { name: '2', custom_field: 0,
              points: { tournament: 2, sos: 4, control: 5, army: 25,
                        assassination: 4, custom_field: 2 } },
            { name: '4',  custom_field: 2,
              points: { tournament: 4, sos: 0, control: 1, army: 35,
                        assassination: 3, custom_field: 1 } }
          ],
          [ { name: '1',  custom_field: 1,
              points: { tournament: 1, sos: 1, control: 3, army: 5,
                        assassination: 5, custom_field: 1 } },
            { name: '3',  custom_field: 4,
              points: { tournament: 0, sos: 3, control: 0, army: 35,
                        assassination: 2, custom_field: 0 } },
            { name: '5',  custom_field: 2,
              points: { tournament: 1, sos: 1, control: 4, army: 0,
                        assassination: 0, custom_field: 3 } }
          ],
        ];
      });

      it('should compute bests players lists', function() {
        expect(players.bests(4, this.players)).toEqual({
          undefeated : [ '4' ],
          custom_field : [ '3' ],
          points : {
            sos : [ '2' ],
            control : [ '2' ],
            army : [ '4', '3' ],
            assassination: [ '1' ],
            custom_field : [ '5' ]
          }
        });
      });
    });

    describe('gameSameFactions', function() {
      using([
        [ 'game_p1', 'game_p2', 'p1_faction', 'p2_faction', 'same' ],
        [ 'p1'     , 'p2'     , 'f1'        , 'f2'        , false    ],
        [ 'p1'     , 'p2'     , 'f1'        , 'f1'        , true     ],
        [ 'p1'     , 'p2'     , null        , 'f2'        , false    ],
        [ 'p1'     , 'p2'     , 'f1'        , null        , false    ],
        [ 'p1'     , null     , 'f1'        , 'f2'        , false    ],
        [ null     , 'p2'     , 'f1'        , 'f2'        , false    ],
        [ null     , null     , 'f1'        , 'f2'        , false    ],
      ], function(e, d) {
        it('should check whether both players are from the same faction, '+d, function() {
          var game = { p1: { name: e.game_p1 }, p2: { name: e.game_p2 } };
          spyOn(players, 'factionFor').and.callFake(function(name) {
            return e[name+'_faction'] || null;
          });

          expect(players.gameSameFactions(game, ['players']))
            .toEqual(e.same);

          if(!R.isNil(e.game_p1)) {
            expect(players.factionFor)
              .toHaveBeenCalledWith(e.game_p1, ['players']);
          }
          if(!R.isNil(e.game_p2)) {
            expect(players.factionFor)
              .toHaveBeenCalledWith(e.game_p2, ['players']);
          }
        });
      });
    });

    describe('gameSameOrigins', function() {
      using([
        [ 'game_p1', 'game_p2', 'p1_origin', 'p2_origin', 'same' ],
        [ 'p1'     , 'p2'     , 'o1'       , 'o2'       , false    ],
        [ 'p1'     , 'p2'     , 'o1'       , 'o1'       , true     ],
        [ 'p1'     , 'p2'     , null       , 'o2'       , false    ],
        [ 'p1'     , 'p2'     , 'o1'       , null       , false    ],
        [ 'p1'     , null     , 'o1'       , 'o2'       , false    ],
        [ null     , 'p2'     , 'o1'       , 'o2'       , false    ],
        [ null     , null     , 'o1'       , 'o2'       , false    ],
      ], function(e, d) {
        it('should check whether both players are from the same origin, '+d, function() {
          var game = { p1: { name: e.game_p1 }, p2: { name: e.game_p2 } };
          spyOn(players, 'originFor').and.callFake(function(name) {
            return e[name+'_origin'] || null;
          });

          expect(players.gameSameOrigins(game, ['players']))
            .toEqual(e.same);

          if(!R.isNil(e.game_p1)) {
            expect(players.originFor)
              .toHaveBeenCalledWith(e.game_p1, ['players']);
          }
          if(!R.isNil(e.game_p2)) {
            expect(players.originFor)
              .toHaveBeenCalledWith(e.game_p2, ['players']);
          }
        });
      });
    });
  });

});
