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
        references: function(list) {
          return _.chain(list)
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
    function(listService) {
      var listsService = {
        add: function(coll, list) {
          return _.cat(coll, list);
        },
        drop: function(coll, index) {
          var new_coll = _.clone(coll);
          new_coll.splice(index, 1);
          return new_coll;
        },
        casters: function(coll) {
          return _.mapWith(coll, _.getPath, 'caster');
        },
        listForCaster: function(coll, caster_name) {
          return _.chain(coll)
            .where({ caster: caster_name })
            .first()
            .value();
        },
        themeForCaster: function(coll, caster_name) {
          return _.chain(coll)
            .apply(listsService.listForCaster, caster_name)
            .getPath('theme')
            .value();
        },
        containsCaster: function(coll, caster_name) {
          return _.chain(coll)
            .findWhere({ caster: caster_name })
            .exists()
            .value();
        }
      };
      return listsService;
    }
  ]);
