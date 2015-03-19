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
        this.scope.edit = {};
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.updatePoints = jasmine.createSpy('updatePoints');
        this.scope.storeState = jasmine.createSpy('storeState');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.playersService = spyOnService('players');
        this.stateService = spyOnService('state');

        this.stateService.sortPlayersByRank._retVal = [
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
      expect(this.stateService.sortPlayersByRank)
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
          expect(this.playersService.chunkGroups)
            .toHaveBeenCalledWith(5, this.new_state_players);
        });

        it('should reset bracket', function() {
          expect(this.scope.new_state)
            .toEqual('state.clearBracket.returnValue');
          expect(this.stateService.clearBracket)
            .toHaveBeenCalledWith({
              players : 'players.chunkGroups.returnValue',
              bracket : [ 'bracket' ]
            });
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
        expect(this.playersService.splitNewGroup)
          .toHaveBeenCalledWith(['p1','p3'], this.new_state_players);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith({
            players : 'players.splitNewGroup.returnValue',
            bracket : [ 'bracket' ]
          });
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
        expect(this.playersService.movePlayerGroupFront.calls.count()).toBe(2);
        expect(this.playersService.movePlayerGroupFront)
          .toHaveBeenCalledWith('p1', this.new_state_players);
        expect(this.playersService.movePlayerGroupFront)
          .toHaveBeenCalledWith('p3', 'players.movePlayerGroupFront.returnValue');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith({
            players : 'players.movePlayerGroupFront.returnValue',
            bracket : [ 'bracket' ]
          });
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
        expect(this.playersService.movePlayerGroupBack.calls.count()).toBe(2);
        expect(this.playersService.movePlayerGroupBack)
          .toHaveBeenCalledWith('p1', this.new_state_players);
        expect(this.playersService.movePlayerGroupBack)
          .toHaveBeenCalledWith('p3', 'players.movePlayerGroupBack.returnValue');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith({
            players : 'players.movePlayerGroupBack.returnValue',
            bracket : [ 'bracket' ]
          });
      });
    });

    describe('moveGroupFront(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupFront(4);
      });

      it('should move <group_index> to front', function() {
        expect(this.playersService.moveGroupFront)
          .toHaveBeenCalledWith(4, this.new_state_players);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith({
            players : 'players.moveGroupFront.returnValue',
            bracket : [ 'bracket' ]
          });
      });
    });

    describe('moveGroupBack(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupBack(4);
      });

      it('should move <group_index> to back', function() {
        expect(this.playersService.moveGroupBack)
          .toHaveBeenCalledWith(4, this.new_state_players);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state)
          .toBe('state.clearBracket.returnValue');
        expect(this.stateService.clearBracket)
          .toHaveBeenCalledWith({
            players : 'players.moveGroupBack.returnValue',
            bracket : [ 'bracket' ]
          });
      });
    });

    describe('doClose(<validate>)', function() {
      when('no previous state is defined', function() {
        this.scope.edit= { back: undefined };
      }, function() {
        it('should return to players list', function() {
          this.scope.doClose(false);
          expect(this.scope.goToState)
            .toHaveBeenCalledWith('players_list');
        });
      });

      when('a previous state is defined', function() {
        this.scope.edit= { back: 'previous_state' };
      }, function() {
        it('should return to players list', function() {
          this.scope.doClose(false);
          expect(this.scope.goToState)
            .toHaveBeenCalledWith('previous_state');
        });
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
