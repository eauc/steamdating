'use strict';

angular.module('srApp.services')
  .factory('list', [
    function() {
      return {
        create: function playerCreate(faction, caster, theme, fk) {
          return {
            faction: faction,
            caster: caster,
            theme: theme,
            fk: fk
          };
        }
      };
    }
  ])
  .factory('lists', [
    'list',
    function(list) {
      var lists = {
        add: function(coll, l) {
          return _.cat(coll, l);
        },
        drop: function(coll, i) {
          var new_coll = coll.slice();
          new_coll.splice(i, 1);
          return new_coll;
        },
        // casters: function(coll) {
        //   return _.mapWith(coll, _.getPath, 'caster');
        // }
      };
      return lists;
    }
  ]);
