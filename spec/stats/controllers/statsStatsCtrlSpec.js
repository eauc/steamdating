'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srAppStats.services');
    module('srAppStats.controllers');
  });

  describe('statsStatsCtrl', function(c) {

    var initCtrl;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.state = [
          { state: {
            players: [ [ { name: 's1p1', faction: 'cryx',
                           lists: [{ faction: 'cryx', caster: 'gaspy1' }] },
                         { name: 's1p2', faction: 'khador',
                           lists: [{ faction: 'khador', caster: 'vlad1' }] },
                         { name: 's1p3', faction: 'scyrah',
                           lists: [{ faction: 'scyrah', caster: 'rahn1' }] } ] ]
          } },
          { state: {
            players: [ [ { name: 't1', members: [
              { name: 's2p1', faction: 'khador',
                lists: [{ faction: 'khador', caster: 'sorscha1' }] },
              { name: 's2p2', faction: 'menoth',
                lists: [{ faction: 'menoth', caster: 'feora1' }] }
            ] } ] ]
          } },
        ];

        this.statsService = spyOnService('stats');

        $controller('statsCtrl', {
          '$scope': this.scope,
          '$state': this.router_state,
        });
        $rootScope.$digest();
      }
    ]));

    it('should setup panel', function() {
      expect(this.scope.panel)
        .toBe('general');
    });

    it('should init factions, players & casters list', function() {
      expect(this.scope.factions).toEqual(['cryx', 'khador', 'menoth', 'scyrah']);
      expect(this.scope.players).toEqual(['s1p1','s1p2','s1p3','s2p1','s2p2']);
      expect(this.scope.casters).toEqual([
        { faction : 'cryx', name : 'gaspy1' },
        { faction : 'khador', name : 'sorscha1' },
        { faction : 'khador', name : 'vlad1' },
        { faction : 'menoth', name : 'feora1' },
        { faction : 'scyrah', name : 'rahn1' }
      ]);
    });

    it('should build general stats', function() {
      expect(this.scope.general)
        .toBe('stats.getGeneral.returnValue');
      expect(this.statsService.getGeneral)
        .toHaveBeenCalledWith(this.scope.state);
    });

    it('should init selection', function() {
      expect(this.scope.selection).toEqual({
        type: 'faction',
        group_by: 'total',
        faction: 'cryx',
        player: 's1p1',
        caster: 'gaspy1'
      });
    });

    describe('setGroup(<gr>)', function() {
      it('should set scope group', function() {
        this.scope.setGroup('group');
        expect(this.scope.group).toBe('group');
      });
    });

    describe('getStats()', function() {
      it('should get stats', function() {
        this.scope.getStats();

        expect(this.statsService.get)
          .toHaveBeenCalledWith(this.scope.state,
                                this.scope.selection.type,
                                this.scope.selection.faction,
                                this.scope.selection.group_by,
                                jasmine.any(Object));
      });
    });
  });

});
