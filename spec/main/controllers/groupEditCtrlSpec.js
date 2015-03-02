'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('groupEditCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.state = { players: ['players'], bracket: ['bracket'] };
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.updatePoints = jasmine.createSpy('updatePoints');
        this.scope.storeState = jasmine.createSpy('storeState');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.playersService = spyOnService('players');
        this.stateService = spyOnService('state');

        this.stateService.sortPlayers._retVal = [
          [ { rank: 1, players: [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ] },
            { rank: 2, players: [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ] } ],
          [ { rank: 3, players: [ { name: 'p8' }, { name: 'p9' } ] } ]
        ];
        this.new_state_players = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' },
          { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];

        $controller('groupEditCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should init selection object', function() {
      expect(this.scope.selection).toEqual({});
    });

    it('should make a copy the state', function() {
      expect(this.scope.new_state).toBeAn('Object');
      expect(this.scope.new_state).not.toBe(this.scope.state);
      expect(this.scope.new_state.bracket).toEqual(this.scope.state.bracket);
    });

    it('should sort players', function() {
      expect(this.stateService.sortPlayers)
        .toHaveBeenCalledWith(this.scope.state);
      expect(this.scope.new_state.players).toEqual(this.new_state_players);
    });

    describe('isSelectionEmpty()', function() {
      using([
        [ 'selection'                                , 'isEmpty' ],
        [ {}                                         , true      ],
        [ { 'p1': false, 'p2': false }               , true      ],
        [ { 'p1': false, 'toto': true, 'p2': false } , false     ],
      ], function(e, d) {
        it('should test whether the selection is empty, '+d, function() {
          this.scope.selection = e.selection;
          expect(this.scope.isSelectionEmpty()).toBe(e.isEmpty);
        });
      });
    });

    describe('chunkGroups()', function() {
      it('should prompt for new groups size', function() {
        this.scope.chunkGroups();

        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt', 'Groups size');
      });

      when('user enter new groups size', function() {
        this.scope.chunkGroups();
        this.promptService.prompt.resolve('5');
      }, function() {
        it('should chunk groups', function() {
          expect(this.scope.new_state.players)
            .toBe('players.chunkGroups.returnValue');
          expect(this.playersService.chunkGroups)
            .toHaveBeenCalledWith(this.new_state_players, 5);
        });

        it('should reset bracket', function() {
          expect(this.scope.new_state.bracket)
            .toEqual('state.clearBracket.returnValue');
          expect(this.stateService.clearBracket)
            .toHaveBeenCalledWith(this.scope.new_state);
        });
      });
    });

    describe('splitSelection()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.splitSelection();
      });

      it('should split selection into new group', function() {
        expect(this.scope.new_state.players)
          .toEqual('players.splitNewGroup.returnValue');
        expect(this.playersService.splitNewGroup)
          .toHaveBeenCalledWith(this.new_state_players, ['p1','p3']);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveSelectionFront()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionFront();
      });

      it('should move players in selection to front', function() {
        expect(this.scope.new_state.players)
          .toBe('players.movePlayerGroupFront.returnValue');
        expect(this.playersService.movePlayerGroupFront.calls.count()).toBe(2);
        expect(this.playersService.movePlayerGroupFront)
          .toHaveBeenCalledWith(this.new_state_players, 'p1');
        expect(this.playersService.movePlayerGroupFront)
          .toHaveBeenCalledWith('players.movePlayerGroupFront.returnValue', 'p3');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveSelectionBack()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionBack();
      });

      it('should move players in selection to back', function() {
        expect(this.scope.new_state.players)
          .toBe('players.movePlayerGroupBack.returnValue');
        expect(this.playersService.movePlayerGroupBack.calls.count()).toBe(2);
        expect(this.playersService.movePlayerGroupBack)
          .toHaveBeenCalledWith(this.new_state_players, 'p1');
        expect(this.playersService.movePlayerGroupBack)
          .toHaveBeenCalledWith('players.movePlayerGroupBack.returnValue', 'p3');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveGroupFront(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupFront(4);
      });

      it('should move <group_index> to front', function() {
        expect(this.scope.new_state.players)
          .toBe('players.moveGroupFront.returnValue');
        expect(this.playersService.moveGroupFront)
          .toHaveBeenCalledWith(this.new_state_players, 4);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveGroupBack(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupBack(4);
      });

      it('should move <group_index> to back', function() {
        expect(this.scope.new_state.players)
          .toBe('players.moveGroupBack.returnValue');
        expect(this.playersService.moveGroupBack)
          .toHaveBeenCalledWith(this.new_state_players, 4);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('doClose(<validate>)', function() {
      it('should return to players list', function() {
        this.scope.doClose(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('players_ranking');
      });

      when('<validate>', function() {
        this.scope.new_state.players = this.new_groups;
        this.scope.new_state.bracket = ['new_bracket'];

        this.scope.doClose(true);
      }, function() {
        it('should update state.players', function() {
          expect(this.scope.state.players).toBe(this.new_groups);
        });

        it('should update state.bracket', function() {
          expect(this.scope.state.bracket).toEqual(['new_bracket']);
        });

        it('should update points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });

        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });
      });
    });
  });

});
