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
        },
        references: function(l) {
          return _.chain(l)
            .getPath('fk')
            .apply(s.lines)
            .filter(_.complement(s.isBlank))
            .map(function(s) { return s.replace(/\(.*\)/,''); })
            .map(function(s) { return s.replace(/\*/,''); })
            .map(function(s) { return s.replace(/\d+/,''); })
            .map(function(st) { return s.trim(st); })
            .value();
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
        casters: function(coll) {
          return _.mapWith(coll, _.getPath, 'caster');
        },
        listForCaster: function(coll, c) {
          return _.chain(coll)
            .filter(function(l) { return l.caster === c; })
            .first()
            .value();
        },
        themeForCaster: function(coll, c) {
          return _.chain(coll)
            .filter(function(l) { return l.caster === c; })
            .first()
            .getPath('theme')
            .value();
        },
        containsCaster: function(coll, c) {
          return _.chain(coll)
            .findWhere({ caster: c })
            .exists()
            .value();
        }
      };
      return lists;
    }
  ]);
