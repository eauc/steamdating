'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('statsPlayersPerFactionEntry', function() {

    var statsPlayersPerFactionEntry;

    beforeEach(inject([ 'statsPlayersPerFactionEntry', function(_statsPlayersPerFactionEntry) {
      statsPlayersPerFactionEntry = _statsPlayersPerFactionEntry;
      this.factionsService = spyOnService('factions');
      this.factionsService.hueFor.and.callFake(function(f) {
        return f+'.hue';
      });
    }]));

    describe('count(<players_per_faction>)', function() {
      it('should convert <players_per_faction> to pieChart values', function() {
        expect(statsPlayersPerFactionEntry.count({
          f1: 10,
          f2: 15,
          f3: 5,
        })).toEqual({
          legends: [ 'f2', 'f1', 'f3' ],
          values: [ 15, 10, 5 ],
          colors : [ 'f2.hue', 'f1.hue', 'f3.hue' ]
        });
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should add tournament points & mean control/army points', function() {
        expect(statsPlayersPerFactionEntry.sum({
          f1: 10,
          f2: 15,
          f3: 5,
        }, {
          f1: 10,
          f3: 15,
          f4: 5,
        })).toEqual({
          f1: 20,
          f2: 15,
          f3: 20,
          f4: 5
        });
      });
    });
  });

  describe('statsPointsEntry', function() {

    var statsPointsEntry;

    beforeEach(inject([ 'statsPointsEntry', function(_statsPointsEntry) {
      statsPointsEntry = _statsPointsEntry;
    }]));

    describe('count(<selection>)', function() {
      it('should count tournament/control/army points', function() {
        expect(statsPointsEntry.count(['state'],[
          [ 'p1', [ ] ],
          [ 'p2', [ ] ],
          [ 'p3', [ ] ],
        ])).toEqual({
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss' : [ 0, 0 ],
                     Control : [ 0, 0 ],
                     Army : [ 0, 0 ],
                     CasterKill : [ 0, 0 ] }
        });

        expect(statsPointsEntry.count(['state'],[
          [ 'p1', [ { victory: 'assassination',
                      p1: {name:'p1' , tournament:1, control:2, army:3},
                      p2: {name:'p2', tournament:0, control:5, army:6} },
                    { victory: 'assassination',
                      p1: {name:'p1' , tournament:0, control:20, army:30},
                      p2: {name:'p2', tournament:1, control:50, army:60} },
                    { victory: null,
                      p1: {name:'p1' , tournament:1, control:200, army:300},
                      p2: {name:'p2', tournament:0, control:500, army:600} }, ] ],
        ])).toEqual({
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss' : [ 2, 1 ],
                     Control : [ 74, 185 ],
                     Army : [ 111, 222 ],
                     CasterKill : [ 1, 1 ] }
        });
        expect(statsPointsEntry.count(['state'],[
          [ 'p1', [ { victory: null,
                      p1: {name:'p1' , tournament:1, control:2, army:3},
                      p2: {name:'p2', tournament:0, control:5, army:6} } ] ],
          [ 'p2', [ { victory: 'assassination',
                      p1: {name:'p1' , tournament:0, control:20, army:30},
                      p2: {name:'p2', tournament:1, control:50, army:60} } ] ],
          [ 'p1', [ { victory: null,
                      p1: {name:'p1' , tournament:1, control:200, army:300},
                      p2: {name:'p2', tournament:0, control:500, army:600} }, ] ],
        ])).toEqual({
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss' : [ 3, 0 ],
                     Control : [ 84, 175 ],
                     Army : [ 121, 212 ],
                     CasterKill : [ 1, 0 ] }
        });
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should add tournament points & mean control/army points', function() {
        expect(statsPointsEntry.sum({
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss' : [ 1, 2 ],
                     Control : [ 3, 4 ],
                     Army : [ 5, 6 ],
                     CasterKill : [ 1, 3 ] }
        }, {
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss' : [ 7, 8 ],
                     Control : [ 9, 10 ],
                     Army : [ 11, 12 ],
                     CasterKill : [ 5, 2 ] }
        })).toEqual({
          colors : [ '#4AE34D', '#E3341D' ],
          values : { 'Win/Loss': [ 8, 10 ], // sum
                     Control: [ 6, 7 ], // mean
                     Army: [ 8, 9 ], //mean
                     CasterKill : [ 6, 5 ] //sum
                   }
        });
      });
    });
  });

  describe('statsCastersEntry', function() {

    var statsCastersEntry;

    beforeEach(inject([ 'statsCastersEntry', function(_statsCastersEntry) {
      statsCastersEntry = _statsCastersEntry;
      this.factionsService = spyOnService('factions');
      this.factionsService.hueFor.and.callFake(function(f) {
        return f+'Hue';
      });
      this.state = {
        players: [[
          { name: 't1', members: [ { name: 'p1', faction: 'p1Faction' } ] },
          { name: 't2', members: [ { name: 'p2', faction: 'p2Faction' } ] },
        ]]
      };
    }]));

    describe('count(<selection>)', function() {
      it('should count tournament/control/army casters', function() {
        expect(statsCastersEntry.count(this.state,[
          [ 'p1', [ ] ],
          [ 'p2', [ ] ],
          [ 'p3', [ ] ],
        ])).toEqual([]);

        expect(statsCastersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } },
                    { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } },
                    { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual([
          [ 'p1Faction', { caster1 : 1, caster3 : 1, caster2 : 1 }, 'p1FactionHue' ]
        ]);

        expect(statsCastersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } } ] ],
          [ 'p2', [ { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } } ] ],
          [ 'p1', [ { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual([
          [ 'p1Faction', { caster1 : 1, caster2 : 1 }, 'p1FactionHue' ],
          [ 'p2Faction', { caster1 : 1 }, 'p2FactionHue' ]
        ]);
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should merge both counts', function() {
        expect(statsCastersEntry.sum([
          [ 'p1Faction', { caster1 : 1, caster3 : 1, caster2 : 1 }, 'p1FactionHue' ]
        ], [
          [ 'p1Faction', { caster1 : 1, caster2 : 1 }, 'p1FactionHue' ],
          [ 'p2Faction', { caster1 : 1 }, 'p2FactionHue' ]
        ])).toEqual([
          [ 'p1Faction', { caster1 : 2, caster3 : 1, caster2 : 2 }, 'p1FactionHue' ],
          [ 'p2Faction', { caster1 : 1 }, 'p2FactionHue' ]
        ]);
      });
    });
  });

  describe('statsOppCastersEntry', function() {

    var statsOppCastersEntry;

    beforeEach(inject([ 'statsOppCastersEntry', function(_statsOppCastersEntry) {
      statsOppCastersEntry = _statsOppCastersEntry;
      this.factionsService = spyOnService('factions');
      this.factionsService.hueFor.and.callFake(function(f) {
        return f+'Hue';
      });
      this.state = {
        players: [[
          { name: 't1', members: [ { name: 'p1', faction: 'p1Faction' } ] },
          { name: 't2', members: [ { name: 'p2', faction: 'p2Faction' } ] },
        ]]
      };
    }]));

    describe('count(<selection>)', function() {
      it('should count tournament/control/army casters', function() {
        expect(statsOppCastersEntry.count(this.state,[
          [ 'p1', [ ] ],
          [ 'p2', [ ] ],
          [ 'p3', [ ] ],
        ])).toEqual([
        ]);

        expect(statsOppCastersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } },
                    { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } },
                    { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual([
          [ 'p2Faction', { caster2 : 1, caster1 : 1, caster3 : 1 }, 'p2FactionHue' ]
        ]);

        expect(statsOppCastersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } } ] ],
          [ 'p2', [ { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } } ] ],
          [ 'p1', [ { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual([
          [ 'p2Faction', { caster2 : 1, caster3 : 1 }, 'p2FactionHue' ],
          [ 'p1Faction', { caster3 : 1 }, 'p1FactionHue' ]
        ]);
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should merge both counts', function() {
        expect(statsOppCastersEntry.sum([
          [ 'p2Faction', { caster2 : 1, caster1 : 1, caster3 : 1 }, 'p2FactionHue' ]
        ], [
          [ 'p2Faction', { caster2 : 1, caster3 : 1 }, 'p2FactionHue' ],
          [ 'p1Faction', { caster3 : 1 }, 'p1FactionHue' ]
        ])).toEqual([
          [ 'p2Faction', { caster2 : 2, caster1 : 1, caster3 : 2 }, 'p2FactionHue' ],
          [ 'p1Faction', { caster3 : 1 }, 'p1FactionHue' ]
        ]);
      });
    });
  });

  describe('statsTiersEntry', function() {

    var statsTiersEntry;

    beforeEach(inject([ 'statsTiersEntry', function(_statsTiersEntry) {
      statsTiersEntry = _statsTiersEntry;
      this.factionsService = spyOnService('factions');
      this.factionsService.hueFor.and.callFake(function(f) {
        return f+'Hue';
      });
      this.state = {
        players: [[
          { name: 't1', members: [
            { name: 'p1', lists: [
              { caster: 'caster1', theme: 'Theme1' },
              { caster: 'caster2', theme: 'Theme2' },
              { caster: 'caster3', theme: null }
            ] }
          ] },
          { name: 't2', members: [
            { name: 'p2', lists: [
              { caster: 'caster1', theme: 'Theme3' }
            ] }
          ] },
        ]]
      };
    }]));

    describe('count(<selection>)', function() {
      it('should count tournament/control/army casters', function() {
        expect(statsTiersEntry.count(this.state,[
          [ 'p1', [ ] ],
          [ 'p2', [ ] ],
          [ 'p3', [ ] ],
        ])).toEqual({});

        expect(statsTiersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } },
                    { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } },
                    { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual({
          Theme1 : 1,
          None : 1,
          Theme2 : 1
        });

        expect(statsTiersEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } } ] ],
          [ 'p2', [ { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } } ] ],
          [ 'p1', [ { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual({
          Theme1 : 1,
          Theme3 : 1,
          Theme2 : 1
        });
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should merge both counts', function() {
        expect(statsTiersEntry.sum({
          Theme1 : 1,
          None : 1,
          Theme2 : 1
        }, {
          Theme1 : 1,
          Theme3 : 1,
          Theme2 : 1
        })).toEqual({
          Theme1: 2,
          None: 1,
          Theme2: 2,
          Theme3: 1
        });
      });
    });
  });

  describe('statsReferencesEntry', function() {

    var statsReferencesEntry;

    beforeEach(inject([ 'statsReferencesEntry', function(_statsReferencesEntry) {
      statsReferencesEntry = _statsReferencesEntry;
      this.factionsService = spyOnService('factions');
      this.factionsService.hueFor.and.callFake(function(f) {
        return f+'Hue';
      });
      this.state = {
        players: [[
          { name: 't1', members: [
            { name: 'p1', lists: [
              { caster: 'caster1', fk: 'Caster1\r\nRefs A\r\n' },
              { caster: 'caster2', fk: 'Caster2\r\nRefs B\r\n' },
              { caster: 'caster3', fk: null }
            ] },
          ] },
          { name: 't1', members: [
            { name: 'p2', lists: [
              { caster: 'caster1', fk: 'Caster1\r\nRefs C\r\n' }
            ] },
          ] },
        ]]
      };
    }]));

    describe('count(<selection>)', function() {
      it('should count tournament/control/army casters', function() {
        expect(statsReferencesEntry.count(this.state,[
          [ 'p1', [ ] ],
          [ 'p2', [ ] ],
          [ 'p3', [ ] ],
        ])).toEqual({});

        expect(statsReferencesEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } },
                    { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } },
                    { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual({
          'Refs A' : 1,
          'Refs B' : 1
        });

        expect(statsReferencesEntry.count(this.state,[
          [ 'p1', [ { p1: {name:'p1', list: 'caster1' },
                      p2: {name:'p2', list: 'caster2' } } ] ],
          [ 'p2', [ { p1: {name:'p1', list: 'caster3' },
                      p2: {name:'p2', list: 'caster1' } } ] ],
          [ 'p1', [ { p1: {name:'p1', list: 'caster2' },
                      p2: {name:'p2', list: 'caster3' } }, ] ],
        ])).toEqual({
          'Refs A' : 1,
          'Refs C' : 1,
          'Refs B' : 1
        });
      });
    });

    describe('sum(<base>, <other>)', function() {
      it('should merge both counts', function() {
        expect(statsReferencesEntry.sum({
          RefsA : 1,
          RefsB : 1
        }, {
          RefsA : 1,
          RefsC : 1,
          RefsB : 1
        })).toEqual({
          RefsA: 2,
          RefsB: 2,
          RefsC: 1
        });
      });
    });
  });

});
