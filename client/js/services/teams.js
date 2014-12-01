'use strict';

angular.module('srApp.services')
  .factory('team', [
    function() {
      var chainComp = function(comp) {
        return function(ret, a, b) {
          return ret===0 ? comp(a, b) : ret;
        };
      };
      var lessOrEqual = chainComp(_.comparator(_.lt));
      var greaterOrEqual = chainComp(_.comparator(_.gt));
      return {
        is: _.rcurry2(function(t, name) {
          return t.name === name;
        }),
        compare: function(t1, t2) {
          return _.chain(0)
            .apply(lessOrEqual, t1.points.tournament, t2.points.tournament)
            .apply(lessOrEqual, t1.points.tournament, t2.points.tournament)
            .apply(lessOrEqual, t1.points.sos, t2.points.sos)
            .apply(lessOrEqual, t1.points.control, t2.points.control)
            .apply(lessOrEqual, t1.points.army, t2.points.army)
            .apply(greaterOrEqual, t1.name, t2.name)
            .value();
        },
        create: function teamCreate(name, city) {
          return {
            name: name,
            city: city,
            points: {
              team_tournament: 0,
              tournament: 0,
              sos: 0,
              control: 0,
              army: 0
            }
          };
        }
      };
    }
  ])
  .factory('teams', [
    'team',
    function(team) {
      var teams = {
        add: function(coll, t) {
          return _.cat(coll, t);
        },
        drop: function(coll, t) {
          return _.reject(coll, _.unary(team.is(t.name)));
        },
        team: function(coll, name) {
          return _.find(coll, _.unary(team.is(name)));
        },
        names: function(coll) {
          return _.mapWith(coll, _.getPath, 'name');
        },
        cities: function(coll) {
          return _.chain(coll)
            .mapWith(_.getPath, 'city')
            .uniq()
            .without(undefined)
            .value();
        },
        sort: function(coll) {
          return coll.slice().sort(team.compare).reverse();
        },
        sosFrom: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(teams.team, coll))
            .reduce(function(mem, o) {
              return mem + _.getPath(o, 'points.team_tournament');
            }, 0)
            .value();
        },
      };
      return teams;
    }
  ]);
