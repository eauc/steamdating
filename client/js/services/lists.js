'use strict';

angular.module('srApp.services')
  .factory('list', [
    function() {
      return {
        create: function playerCreate(data) {
          return _.deepExtend({
            faction: null,
            caster: null,
            theme: null,
            fk: null
          }, data);
        },
        references: function(list) {
          return _.chain(list)
            .getPath('fk')
            .apply(s.lines)
            .filter(_.complement(s.isBlank))
            .map(function(s) { return s.replace(/\(.*\)/,''); })
            .map(function(s) { return s.replace(/\[.*\]/,''); })
            .map(function(s) { return s.replace(/- (PC|WJ|WB).*$/,''); })
          // eliminate Warroom's "- (Leader|Cylena) & Grunts"
            .map(function(s) { return s.replace(/-[^-]*runt.*$/,''); })
            .map(function(s) { return s.replace(/Objective/,''); })
            .map(function(s) { return s.replace(/Specialists/,''); })
            .map(function(s) { return s.replace(/UA/,''); })
            .map(function(s) { return s.replace(/[^a-zA-Z\s&]/g,''); })
            .map(function(st) { return s.trim(st); })
            .map(function(st) { return s.titleize(st); })
            .filter(_.complement(s.isBlank))
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
