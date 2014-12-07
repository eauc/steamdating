'use strict';

angular.module('srApp.services')
  .factory('team', [
    function() {
      return {
        is: _.rcurry2(function(t, name) {
          return t.name === name;
        }),
        rank: function(t, critFn) {
          var rank = critFn(t.points.team_tournament,
                            t.points.tournament,
                            t.points.sos,
                            t.points.control,
                            t.points.army);
          // console.log(t, rank);
          return rank;
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
    'players',
    function(team,
             players) {
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
        sort: function(coll, state) { //bracket, criterium, ps, n_rounds) {
          if(state.bracket) {
            return _.sortBy(coll.slice(),
                            function(p) { return p.points.bracket; })
              .reverse();
          }
          else {
            var baseCritFn = new Function('ttp', 'tp', 'sos', 'cp', 'ap',
                                          'team_size', 'n_teams', 'n_players', 'n_rounds',
                                          'return '+state.ranking.team+';');
            var team_size = _.chain(coll)
                .map(function(t) {
                  return players.inTeam(state.players, t.name).length;
                })
                .max()
                .value();
            var critFn = _.partial(baseCritFn, _, _, _, _, _,
                                   team_size, coll.length,
                                   state.players.length,
                                   state.rounds.length);
            return _.sortBy(coll.slice(),
                            _.partial(team.rank, _, critFn)).reverse();
          }
        },
        sosFrom: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(teams.team, coll))
            .reduce(function(mem, o) {
              return mem + _.getPath(o, 'points.team_tournament');
            }, 0)
            .value();
        },
        teamSize: function(coll, ps) {
          return _.chain(coll)
            .map(function(t) {
              return players.inTeam(ps, t.name).length;
            })
            .max()
            .value();
        }
      };
      return teams;
    }
  ]);
