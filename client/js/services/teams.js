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
    'factions',
    function(team,
             players,
             factions) {
      var base_factions = {};
      factions.baseFactions().then(function(f) {
        base_factions = f;
      });
      var teams = {
        add: function(coll, t, i) {
          coll[i] = _.cat(coll[i], t);
          return coll;
        },
        drop: function(coll, t) {
          return _.map(coll, function(group) {
            return _.reject(group, _.unary(team.is(t.name)));
          });
        },
        team: function(coll, name) {
          return _.chain(coll)
            .flatten()
            .find(_.unary(team.is(name)))
            .value();
        },
        names: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'name')
            .value();
        },
        cities: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'city')
            .uniq()
            .without(undefined)
            .value();
        },
        factions: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'faction')
            .cat(_.keys(base_factions))
            .uniq()
            .without(undefined)
            .value();
        },
        sortGroup: function(coll, i, state) {
          if(_.exists(state.bracket[i])) {
            return _.sortBy(coll.slice(),
                            function(p) { return -p.points.bracket; });
          }
          else {
            var baseCritFn = new Function('ttp', 'tp', 'sos', 'cp', 'ap',
                                          'team_size', 'n_teams', 'n_players', 'n_rounds',
                                          'return '+state.ranking.team+';');
            var team_size = _.chain(state.teams)
              .flatten()
              .map(function(t) {
                return players.inTeam(state.players, t.name).length;
              })
              .max()
              .value();
            var n_teams = _.flatten(state.teams).length;
            var n_players = _.flatten(state.players).length;
            var critFn = _.partial(baseCritFn, _, _, _, _, _,
                                   team_size, 
                                   n_teams,
                                   n_players,
                                   state.rounds.length);
            return _.sortBy(coll.slice(),
                            function(t) {
                              return -team.rank(t, critFn);
                            });
          }
        },
        sort: function(coll, state) {
          return _.map(coll, function(group, i) {
            return teams.sortGroup(group, i, state);
          });
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
            .flatten()
            .map(function(t) {
              return players.inTeam(ps, t.name).length;
            })
            .max()
            .value();
        },
        chunk: function(coll, size) {
          return _.chain(coll)
            .flatten()
            .chunk(size)
            .value();
        }
      };
      return teams;
    }
  ]);
