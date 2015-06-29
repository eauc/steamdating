'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('statsGroupByTotal', function() {

    var statsGroupByTotal;

    beforeEach(inject([ 'statsGroupByTotal', function(_statsGroupByTotal) {
      statsGroupByTotal = _statsGroupByTotal;
    }]));

    describe('group(<state>, <selection>)', function() {
      it('should simply forward <selection>', function() {
        expect(statsGroupByTotal.group(['state'],['selection']))
          .toEqual([[ 'Total', ['selection'] ]]);
      });
    });
  });

  describe('statsGroupOppFaction', function() {

    var statsGroupByOppFaction;

    beforeEach(inject([ 'statsGroupByOppFaction', function(_statsGroupByOppFaction) {
      statsGroupByOppFaction = _statsGroupByOppFaction;
    }]));

    describe('group(<state>, <selection>)', function() {
      beforeEach(function() {
        this.state = {
          players: [[
            { name: 't1', members: [ { name: 'p1', faction: 'p1Faction' },
                                     { name: 'p2', faction: 'p2Faction' } ] },
            { name: 'p3', faction: 'p3Faction' },
          ]]
        };
        this.selection = [
          [ 'p1', [ { p1: {name: 'p1'}, p2: {name: 'p2'} },
                    { p1: {name: 'p1'}, p2: {name: 'p3'} } ] ],
          [ 'p2', [ { p1: {name: 'p1'}, p2: {name: 'p2'} },
                    { p1: {name: 'p2'}, p2: {name: 'p3'} } ] ]
        ];
      });

      it('should simply forward <selection>', function() {
        expect(statsGroupByOppFaction.group(this.state, this.selection))
          .toEqual([
            [ 'P1Faction', [ [ 'p2', [ { p1 : { name : 'p1' }, p2 : { name : 'p2' } } ] ] ] ],
            [ 'P2Faction', [ [ 'p1', [ { p1 : { name : 'p1' }, p2 : { name : 'p2' } } ] ] ] ],
            [ 'P3Faction', [ [ 'p1', [ { p1 : { name : 'p1' }, p2 : { name : 'p3' } } ] ],
                             [ 'p2', [ { p1 : { name : 'p2' }, p2 : { name : 'p3' } } ] ] ] ]
          ]);
      });
    });
  });

  describe('statsGroupOppCaster', function() {

    var statsGroupByOppCaster;

    beforeEach(inject([ 'statsGroupByOppCaster', function(_statsGroupByOppCaster) {
      statsGroupByOppCaster = _statsGroupByOppCaster;
    }]));

    describe('group(<state>, <selection>)', function() {
      beforeEach(function() {
        this.state = {
          players: [[
            { name: 'p1', faction: 'p1Faction' },
            { name: 'p2', faction: 'p2Faction' },
            { name: 'p3', faction: 'p3Faction' },
          ]]
        };
        this.selection = [
          [ 'p1', [ { p1: {name: 'p1'}, p2: {name: 'p2', list: 'caster2'} },
                    { p1: {name: 'p1'}, p2: {name: 'p3', list: 'caster3'} } ] ],
          [ 'p2', [ { p1: {name: 'p1', list: 'caster1'}, p2: {name: 'p2'} },
                    { p1: {name: 'p2'}, p2: {name: 'p3', list: 'caster3'} } ] ]
        ];
      });

      it('should simply forward <selection>', function() {
        expect(statsGroupByOppCaster.group(this.state, this.selection))
          .toEqual([
            [ 'Caster1', [ [ 'p2', [ { p1 : { name : 'p1', list : 'caster1' },
                                       p2 : { name : 'p2' } } ] ] ] ], 
            [ 'Caster2', [ [ 'p1', [ { p1 : { name : 'p1' },
                                       p2 : { name : 'p2', list : 'caster2' } } ] ] ] ],
            [ 'Caster3', [ [ 'p1', [ { p1 : { name : 'p1' },
                                       p2 : { name : 'p3', list : 'caster3' } } ] ],
                           [ 'p2', [ { p1 : { name : 'p2' },
                                       p2 : { name : 'p3', list : 'caster3' } } ] ] ] ]
          ]);
      });
    });
  });

});
