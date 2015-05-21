'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('statsCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.state = {
          players: ['players'],
        };

        this.playersService = spyOnService('players');
        this.playersService.factions._retVal = ['players.factions.returnValue'];
        this.playersService.names._retVal = ['players.names.returnValue'];
        this.playersService.casters._retVal = [{name:'players.casters.returnValue'}];
        this.statsService = spyOnService('stats');

        $controller('statsCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should setup panel', function() {
      expect(this.scope.panel)
        .toBe('general');
    });

    it('should setup select lists', function() {
      expect(this.playersService.factions)
        .toHaveBeenCalledWith([], this.scope.state.players);
      expect(this.scope.factions)
        .toEqual(['players.factions.returnValue']);

      expect(this.playersService.names)
        .toHaveBeenCalledWith(this.scope.state.players);
      expect(this.scope.players)
        .toEqual(['players.names.returnValue']);

      expect(this.playersService.casters)
        .toHaveBeenCalledWith(this.scope.state.players);
      expect(this.scope.casters)
        .toEqual([{name:'players.casters.returnValue'}]);
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
        // type: 'player',
        // type: 'caster',
        group_by: 'total',
        faction: 'players.factions.returnValue',
        player: 'players.names.returnValue',
        caster: 'players.casters.returnValue',
      });
    });

    describe('setGroup(<gr>)', function() {
      it('should set scope.group', function() {
        this.scope.group = 'previous';
        this.scope.setGroup('new');
        expect(this.scope.group).toBe('new');
      });
    });

    describe('getStats(<gr>)', function() {
      beforeEach(function() {
        this.scope.selection = {
          type: 'players',
          group_by: 'group',
          faction: 'factionVal',
          player: 'playerVal',
          caster: 'casterVal',
        };
      });

      using([
        [ 'type'    , 'value'      ],
        [ 'faction' , 'factionVal' ],
        [ 'player'  , 'playerVal'  ],
        [ 'caster'  , 'casterVal'  ],
      ], function(e,d) {
        it('should get stats for current selection, '+d, function() {
          this.scope.selection.type = e.type;

          expect(this.scope.getStats()).toBe('stats.get.returnValue');

          expect(this.statsService.get)
            .toHaveBeenCalledWith(this.scope.state,
                                  e.type, e.value, 'group',
                                  jasmine.any(Object));
        });
      });
    });
  });

});
