'use strict';

angular.module('srApp.services')
  .factory('list', [
    function() {
      var listService = {
        create: function playerCreate(data) {
          return R.merge({
            faction: null,
            caster: null,
            theme: null,
            fk: null
          }, data);
        },
        references: function(list) {
          return R.pipe(
            R.prop('fk'),
            s.lines,
            R.reject(s.isBlank),
            R.reject(function(s) { return s.match(/^\s*Tiers?/); }),
            R.map(function(s) { return s.replace(/\(.*\)/,''); }),
            R.map(function(s) { return s.replace(/\[.*\]/,''); }),
            R.map(function(s) { return s.replace(/- (PC|WJ|WB).*$/,''); }),
          // eliminate Warroom's "- (Leader|Cylena) & Grunts"
            R.map(function(s) { return s.replace(/-[^-]*runt.*$/,''); }),
            R.map(function(s) { return s.replace(/Objective/,''); }),
            R.map(function(s) { return s.replace(/Specialists/,''); }),
            R.map(function(s) { return s.replace(/UA/,''); }),
            R.map(function(s) { return s.replace(/[^a-zA-Z\s&]/g,''); }),
            R.map(function(st) { return s.trim(st); }),
            R.map(function(st) { return s.titleize(st); }),
            R.filter(R.not(s.isBlank))
          )(list);
        }
      };
      R.curryService(listService);
      return listService;
    }
  ])
  .factory('lists', [
    'list',
    function(listService) {
      var listsService = {
        add: function(list, coll) {
          return R.append(list, coll);
        },
        drop: function(index, coll) {
          return R.remove(index, 1, coll);
        },
        casters: function(coll) {
          return R.pluck('caster', coll);
        },
        listForCaster: function(caster_name, coll) {
          return R.pipe(R.filter(R.propEq('caster', caster_name)),
                        R.head
                       )(coll);
        },
        themeForCaster: function(caster_name, coll) {
          return R.pipe(listsService.listForCaster$(caster_name),
                        R.defaultTo({}),
                        R.prop('theme')
                       )(coll);
        },
        containsCaster: function(caster_name, coll) {
          return R.pipe(R.find(R.propEq('caster', caster_name)),
                        R.not(R.isNil)
                       )(coll);
        }
      };
      R.curryService(listsService);
      return listsService;
    }
  ]);
