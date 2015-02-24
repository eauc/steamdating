'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srAppStats.services');
  });

  describe('statsStats', function() {

    var stats;

    beforeEach(inject([ 'stats', function(_stats) {
      stats = _stats;

      this.statsPointsEntryService = spyOnService('statsPointsEntry');
      this.statsPointsEntryService.count.and.callFake(function(st, gr) {
        return 'statsPointsEntry('+st+','+gr+').returnValue';
      });
      this.statsCastersEntryService = spyOnService('statsCastersEntry');
      this.statsCastersEntryService.count.and.callFake(function(st, gr) {
        return 'statsCastersEntry('+st+','+gr+').returnValue';
      });
      this.statsOppCastersEntryService = spyOnService('statsOppCastersEntry');
      this.statsOppCastersEntryService.count.and.callFake(function(st, gr) {
        return 'statsOppCastersEntry('+st+','+gr+').returnValue';
      });
      this.statsTiersEntryService = spyOnService('statsTiersEntry');
      this.statsTiersEntryService.count.and.callFake(function(st, gr) {
        return 'statsTiersEntry('+st+','+gr+').returnValue';
      });
      this.statsReferencesEntryService = spyOnService('statsReferencesEntry');
      this.statsReferencesEntryService.count.and.callFake(function(st, gr) {
        return 'statsReferencesEntry('+st+','+gr+').returnValue';
      });
    }]));

    describe('get(<states>, <selector>, <selValue>, <groupBy>)', function() {
      beforeEach(function() {
        this.statsPlayerSelectorService = spyOnService('statsPlayerSelector');
        this.statsGroupByOppFaction = spyOnService('statsGroupByOppFaction');
        this.statsGroupByOppFaction.group._retVal = [
          ['sel_name1', 'sel_group1'],
          ['sel_name2', 'sel_group2'],
          ['sel_name3', 'sel_group3'],
        ];

        this.ret = stats.get([
          { state: 'state1' },
          { state: 'state2' }
        ], 'player', 'selValue', 'opp_faction', {});
      });

      it('should select games based on <selector>', function() {
        expect(this.statsPlayerSelectorService.select)
          .toHaveBeenCalledWith('state1', 'selValue');
        expect(this.statsPlayerSelectorService.select)
          .toHaveBeenCalledWith('state2', 'selValue');
      });

      it('should group selected games based on <groupBy>', function() {
        expect(this.statsGroupByOppFaction.group)
          .toHaveBeenCalledWith('state1', 'statsPlayerSelector.select.returnValue');
        expect(this.statsGroupByOppFaction.group)
          .toHaveBeenCalledWith('state2', 'statsPlayerSelector.select.returnValue');
      });

      using([
        [ 'service' ],
        [ 'statsPointsEntry' ],
        [ 'statsCastersEntry' ],
        [ 'statsOppCastersEntry' ],
        [ 'statsTiersEntry' ],
        [ 'statsReferencesEntry' ],
      ], function(e,d) {
        it('should compute stats for each selection group, '+d, function() {
          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state1', 'sel_group1');
          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state1', 'sel_group2');
          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state1', 'sel_group3');

          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state2', 'sel_group1');
          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state2', 'sel_group2');
          expect(this[e.service+'Service'].count)
            .toHaveBeenCalledWith('state2', 'sel_group3');
        });

        it('should sum stats for each selection group, '+d, function() {
          expect(this[e.service+'Service'].sum)
            .toHaveBeenCalledWith(e.service+'(state1,sel_group1).returnValue',
                                  e.service+'(state2,sel_group1).returnValue');
        });
      });

      it('should return computed stats', function() {
        expect(this.ret).toEqual([
          [ 'sel_name1', { points : 'statsPointsEntry.sum.returnValue',
                           casters : 'statsCastersEntry.sum.returnValue',
                           opp_casters : 'statsOppCastersEntry.sum.returnValue',
                           tiers : 'statsTiersEntry.sum.returnValue',
                           references : 'statsReferencesEntry.sum.returnValue' } ],
          [ 'sel_name2', { points : 'statsPointsEntry.sum.returnValue',
                           casters : 'statsCastersEntry.sum.returnValue',
                           opp_casters : 'statsOppCastersEntry.sum.returnValue',
                           tiers : 'statsTiersEntry.sum.returnValue',
                           references : 'statsReferencesEntry.sum.returnValue' } ],
          [ 'sel_name3', { points : 'statsPointsEntry.sum.returnValue',
                           casters : 'statsCastersEntry.sum.returnValue',
                           opp_casters : 'statsOppCastersEntry.sum.returnValue',
                           tiers : 'statsTiersEntry.sum.returnValue',
                           references : 'statsReferencesEntry.sum.returnValue' } ]
        ]);
      });
    });
  });

});
