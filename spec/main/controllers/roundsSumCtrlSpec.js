'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsSumCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.state = {
          players: ['players'],
          rounds: ['rounds']
        };

        this.stateService = spyOnService('state');
        this.stateTablesService = spyOnService('stateTables');
        this.playersService = spyOnService('players');
        this.fileExportService = spyOnService('fileExport');

        $controller('roundsSumCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should refresh players\' played lists', function() {
      expect(this.playersService.updateListsPlayed)
        .toHaveBeenCalledWith(['rounds'], ['players']);
      expect(this.scope.state.players)
        .toBe('players.updateListsPlayed.returnValue');
    });

    it('should init sorted players list', function() {
      expect(this.scope.sorted_players)
        .toBe('state.sortPlayersByName.returnValue');
      expect(this.stateService.sortPlayersByName)
        .toHaveBeenCalledWith(this.scope.state);
    });

    it('should init games by players list', function() {
      expect(this.scope.games_by_players)
        .toBe('players.gamesForRounds.returnValue');
      expect(this.playersService.gamesForRounds)
        .toHaveBeenCalledWith(this.scope.state.rounds,
                              this.scope.sorted_players);
    });

    it('should init exports', function() {
      expect(this.scope.exports).toBeAn('Object');

      expect(this.stateTablesService.roundsSummaryTables)
        .toHaveBeenCalledWith(this.scope.state);

      expect(this.scope.exports.csv)
        .toEqual({
          name: 'rounds_summary.csv',
          url: 'fileExport.generate.returnValue',
          label: 'CSV Rounds Summary'
        });
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('csv', 'stateTables.roundsSummaryTables.returnValue');

      expect(this.scope.exports.bb)
        .toEqual({
          name: 'rounds_summary.txt',
          url: 'fileExport.generate.returnValue',
          label: 'BBCode Rounds Summary'
        });
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('bb', 'stateTables.roundsSummaryTables.returnValue');
    });
  });

});
