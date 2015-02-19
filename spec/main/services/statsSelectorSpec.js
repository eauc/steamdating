'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('statsFactionSelector', function() {

    var statsFactionSelector;

    beforeEach(inject([ 'statsFactionSelector', function(_statsFactionSelector) {
      statsFactionSelector = _statsFactionSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.forFaction._retVal = [
          { name: 'p1' },
          { name: 'p2' },
          { name: 'p3' },
        ];
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(rs, p) {
          return [p+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games with faction <value>', function() {
        expect(statsFactionSelector.select(this.state, 'factionVal'))
          .toEqual([
            [ 'p1', [ 'p1Games' ] ],
            [ 'p2', [ 'p2Games' ] ],
            [ 'p3', [ 'p3Games' ] ]
          ]);

        expect(this.playersService.forFaction)
          .toHaveBeenCalledWith(['players'], 'factionVal');
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p1');
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p2');
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p3');
      });
    });
  });

  describe('statsPlayerSelector', function() {

    var statsPlayerSelector;

    beforeEach(inject([ 'statsPlayerSelector', function(_statsPlayerSelector) {
      statsPlayerSelector = _statsPlayerSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(rs, p) {
          return [p+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games for player <value>', function() {
        expect(statsPlayerSelector.select(this.state, 'playerVal'))
          .toEqual([
            [ 'playerVal', [ 'playerValGames' ] ],
          ]);

        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'playerVal');
      });
    });
  });

  describe('statsCasterSelector', function() {

    var statsCasterSelector;

    beforeEach(inject([ 'statsCasterSelector', function(_statsCasterSelector) {
      statsCasterSelector = _statsCasterSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.forCaster._retVal = [
          { name: 'p1' },
          { name: 'p2' },
          { name: 'p3' },
        ];
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(rs, p) {
          return [p+'Games'];
        });
        this.gamesService = spyOnService('games');
        this.gamesService.forCaster.and.callFake(function(gs, p, c) {
          return [p+c+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games with caster <value>', function() {
        expect(statsCasterSelector.select(this.state, 'casterVal'))
          .toEqual([
            [ 'p1', [ 'p1casterValGames' ] ],
            [ 'p2', [ 'p2casterValGames' ] ],
            [ 'p3', [ 'p3casterValGames' ] ]
          ]);

        expect(this.playersService.forCaster)
          .toHaveBeenCalledWith(['players'], 'casterVal');

        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p1');
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p2');
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith(['rounds'], 'p3');

        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith(['p1Games'], 'p1', 'casterVal');
        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith(['p2Games'], 'p2', 'casterVal');
        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith(['p3Games'], 'p3', 'casterVal');
      });
    });
  });

});
