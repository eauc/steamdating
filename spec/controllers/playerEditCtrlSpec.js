'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('playerEditCtrl', function(c) {
    var initController;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        initController = function(ctxt, player) {
          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.storeState = jasmine.createSpy('storeState');
          ctxt.group = 4;
          ctxt.scope.edit = { player: player, group: ctxt.group };
          ctxt.current_state = {
            players: [ { name: 'titi'}, { name: 'toto' } ],
            store: jasmine.createSpy('storeState')
          };
          ctxt.scope.state = _.clone(ctxt.current_state);

          ctxt.players = jasmine.createSpyObj('players', [
            'factions',
            'cities',
            'names',
            'add'
          ]);
          ctxt.players.factions.and.returnValue('factions');
          ctxt.players.cities.and.returnValue('cities');
          ctxt.players.add.and.returnValue('new_players');

          ctxt.factions = jasmine.createSpyObj('factions', [ 'baseFactions' ]);
          ctxt.base_factions = [ 'base_factions' ];
          ctxt.factions.baseFactions.and.returnValue(ctxt.base_factions);

          ctxt.list = jasmine.createSpyObj('list', ['create']);
          ctxt.lists = jasmine.createSpyObj('list', ['add', 'drop']);
          ctxt.dummy_list = [ 'titi' ];
          ctxt.list.create.and.returnValue(ctxt.dummy_list);
          ctxt.dummy_lists = [ ['1'], ['2'] ];
          ctxt.lists.add.and.returnValue(ctxt.dummy_lists);
          ctxt.lists.drop.and.returnValue(ctxt.dummy_lists);

          ctxt.window = jasmine.createSpyObj('window', ['alert']);

          $controller('playerEditCtrl', { 
            '$scope': ctxt.scope,
            '$window': ctxt.window,
            'state': ctxt.state,
            'players': ctxt.players,
            'factions': ctxt.factions,
            'list': ctxt.list,
            'lists': ctxt.lists
          });
        };
        initController(this, { name: 'player', lists:[] });
        $rootScope.$digest();
      }
    ]));

    it('should edit a copy of given player', function() {
      expect(this.scope.player).not.toBe(this.scope.edit.player);
      expect(this.scope.player).toEqual(this.scope.edit.player);
    });

    it('should init list tab index', function() {
      // when lists is empty
      expect(this.scope.list).toBe(-1);

      // when lists is not empty
      initController(this, { name: 'player', lists:[[],[]] });

      expect(this.scope.list).toBe(0);
    });

    it('should init factions & cities', function() {
      expect(this.players.factions).toHaveBeenCalledWith(this.scope.state.players,
                                                         this.base_factions);
      expect(this.players.cities).toHaveBeenCalledWith(this.scope.state.players);
      expect(this.scope.factions).toBe('factions');
      expect(this.scope.cities).toBe('cities');
    });

    describe('doSwitchToList(<i>)', function() {
      it('should change list tab index', function() {
        this.scope.doSwitchToList(5);
        expect(this.scope.list).toBe(5);
      });
    });

    describe('doAddList()', function() {
      beforeEach(function() {
        initController(this, {
          name: 'player',
          faction: 'faction',
          lists:[[],[]]
        });

        this.scope.doAddList();
      });

      it('should change list tab index to last list', function() {
        expect(this.scope.list).toBe(this.scope.edit.player.lists.length);
      });

      it('should add a new list to player.lists', function() {
        expect(this.list.create).toHaveBeenCalledWith(this.scope.edit.player.faction);
        expect(this.lists.add).toHaveBeenCalledWith(this.scope.edit.player.lists,
                                                    this.dummy_list);
        expect(this.scope.player.lists).toBe(this.dummy_lists);
      });
    });

    describe('doDropList(<i>)', function() {
      beforeEach(function() {
        initController(this, {
          name: 'player',
          faction: 'faction',
          lists:[['1'],['2']]
        });

        this.scope.doDropList(2);
      });

      it('should drop list <i> from player.lists', function() {
        expect(this.lists.drop).toHaveBeenCalledWith(this.scope.edit.player.lists,
                                                     2);
        expect(this.scope.player.lists).toBe(this.dummy_lists);
      });
    });

    describe('doClose(<validate>)', function() {
      when('not validate', function() {
      },function() {
        it('should return to player state', function() {
          this.scope.doClose(false);
          
          expect(this.scope.goToState).toHaveBeenCalledWith('players');
        });
      });

      when('validate', function() {
      }, function() {
        it('should validate player\'s name', function() {
          this.scope.player.name = null;
          this.scope.doClose(true);
          expect(this.window.alert).toHaveBeenCalledWith('invalid player name');

          this.window.alert.calls.reset();
          this.scope.player.name = '';
          this.scope.doClose(true);
          expect(this.window.alert).toHaveBeenCalledWith('invalid player name');
        });

        when('editing an existing player', function() {
          initController(this, { name: 'titi', lists:[] });
          this.players.names.and.returnValue([ 'titi', 'toto' ]);
        }, function() {
          it('should check that the new name does not already exists', function() {
            // no change
            this.window.alert.calls.reset();
            this.scope.player.name = 'titi';
            this.scope.doClose(true);
            expect(this.window.alert).not.toHaveBeenCalled();
            // new name
            this.window.alert.calls.reset();
            this.scope.player.name = 'new';
            this.scope.doClose(true);
            expect(this.window.alert).not.toHaveBeenCalled();
            // existing name
            this.window.alert.calls.reset();
            this.scope.player.name = 'toto';
            this.scope.doClose(true);
            expect(this.window.alert)
              .toHaveBeenCalledWith('a player with the same name already exists');
          });

          it('should update existing player', function() {
            this.scope.player.name = 'new_n';
            this.scope.player.faction = 'new_f';
            this.scope.player.city = 'new_c';
            this.scope.player.team = 'new_t';
            this.scope.player.lists = [ 'new_l' ];

            this.scope.doClose(true);

            expect(this.scope.edit.player.name).toBe('new_n');
            expect(this.scope.edit.player.faction).toBe('new_f');
            expect(this.scope.edit.player.city).toBe('new_c');
            expect(this.scope.edit.player.team).toBe('new_t');
            expect(this.scope.edit.player.lists).toEqual([ 'new_l' ]);
          });
        });

        when('creating a new player', function() {
          initController(this, { name: undefined, lists:[] });
          this.players.names.and.returnValue([ 'titi', 'toto' ]);
        }, function() {
          it('should check that the new name does not already exists', function() {
            // new name
            this.window.alert.calls.reset();
            this.scope.player.name = 'new';
            this.scope.doClose(true);
            expect(this.window.alert).not.toHaveBeenCalled();
            // existing name
            this.window.alert.calls.reset();
            this.scope.player.name = 'toto';
            this.scope.doClose(true);
            expect(this.window.alert)
              .toHaveBeenCalledWith('a player with the same name already exists');
          });

          it('should add player to state', function() {
            this.scope.player.name = 'new_n';
            this.scope.player.faction = 'new_f';
            this.scope.player.city = 'new_c';
            this.scope.player.team = 'new_t';
            this.scope.player.lists = [ 'new_l' ];

            this.scope.doClose(true);

            expect(this.players.add).toHaveBeenCalledWith(this.current_state.players,
                                                          this.scope.player,
                                                          this.scope.edit.group);
            expect(this.scope.state.players).toBe('new_players');
          });
        });

        it('should store state', function() {
          this.scope.doClose(true);
          
          expect(this.scope.storeState).toHaveBeenCalled();
        });

        it('should return to player state', function() {
          this.scope.doClose(true);
          
          expect(this.scope.goToState).toHaveBeenCalledWith('players');
        });
      });
    });
  });

});
