'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('stats', function() {

    var stats;

    beforeEach(inject([ 'stats', function(_stats) {
      stats = _stats;

      this.statsPointsEntryService = spyOnService('statsPointsEntry');
      this.statsCastersEntryService = spyOnService('statsCastersEntry');
      this.statsOppCastersEntryService = spyOnService('statsOppCastersEntry');
      this.statsTiersEntryService = spyOnService('statsTiersEntry');
      this.statsReferencesEntryService = spyOnService('statsReferencesEntry');
    }]));

    describe('getGeneral(<state>)', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.statsPlayersPerFactionEntryService = spyOnService('statsPlayersPerFactionEntry');
      });

      it('should build players per faction stats', function() {
        var ret = stats.getGeneral({ players: 'players' });

        expect(this.playersService.countByFaction)
          .toHaveBeenCalledWith('players');
        expect(this.statsPlayersPerFactionEntryService.count)
          .toHaveBeenCalledWith('players.countByFaction.returnValue');
        expect(ret.factions)
          .toBe('statsPlayersPerFactionEntry.count.returnValue');
      });
    });

    describe('get(<state>, <selector>, <selValue>, <groupBy>)', function() {
      beforeEach(function() {
        this.statsPlayerSelectorService = spyOnService('statsPlayerSelector');
        this.statsGroupByOppFaction = spyOnService('statsGroupByOppFaction');
        this.statsGroupByOppFaction.group._retVal = [
          ['sel_name1', 'sel_group1'],
          ['sel_name2', 'sel_group2'],
          ['sel_name3', 'sel_group3'],
        ];

        this.ret = stats.get(['state'], 'player', 'selValue', 'opp_faction', {});
      });

      it('should select games based on <selector>', function() {
        expect(this.statsPlayerSelectorService.select)
          .toHaveBeenCalledWith(['state'], 'selValue');
      });

      it('should group selected games based on <groupBy>', function() {
        expect(this.statsGroupByOppFaction.group)
          .toHaveBeenCalledWith(['state'], 'statsPlayerSelector.select.returnValue');
      });

      using([
        [ 'service' ],
        [ 'statsPointsEntryService' ],
        [ 'statsCastersEntryService' ],
        [ 'statsOppCastersEntryService' ],
        [ 'statsTiersEntryService' ],
        [ 'statsReferencesEntryService' ],
      ], function(e,d) {
        it('should compute stats for each selection group, '+d, function() {
          expect(this[e.service].count)
            .toHaveBeenCalledWith(['state'], 'sel_group1');
          expect(this[e.service].count)
            .toHaveBeenCalledWith(['state'], 'sel_group2');
          expect(this[e.service].count)
            .toHaveBeenCalledWith(['state'], 'sel_group3');
        });
      });

      it('should return computed stats', function() {
        expect(this.ret).toEqual([
          [ 'sel_name1', { points : 'statsPointsEntry.count.returnValue',
                           casters : 'statsCastersEntry.count.returnValue',
                           opp_casters : 'statsOppCastersEntry.count.returnValue',
                           tiers : 'statsTiersEntry.count.returnValue',
                           references : 'statsReferencesEntry.count.returnValue' } ],
          [ 'sel_name2', { points : 'statsPointsEntry.count.returnValue',
                           casters : 'statsCastersEntry.count.returnValue',
                           opp_casters : 'statsOppCastersEntry.count.returnValue',
                           tiers : 'statsTiersEntry.count.returnValue',
                           references : 'statsReferencesEntry.count.returnValue' } ],
          [ 'sel_name3', { points : 'statsPointsEntry.count.returnValue',
                           casters : 'statsCastersEntry.count.returnValue',
                           opp_casters : 'statsOppCastersEntry.count.returnValue',
                           tiers : 'statsTiersEntry.count.returnValue',
                           references : 'statsReferencesEntry.count.returnValue' } ]
        ]);
      });
    });
  });

});
