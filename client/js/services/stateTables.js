'use strict';

angular.module('srApp.services')
  .factory('stateTables', [
    'player',
    'game',
    'round',
    'state',
    function(playerService,
             gameService,
             roundService,
             stateService) {
      var stateTablesService = {
        rankingTables: function(state) {
          var bests_table = bestsTable(state);
          var bests_in_faction_table = bestsInFactionTable(state);
          var players_tables = playersTables(state);

          var ret = R.concat(bests_table, bests_in_faction_table);
          ret = R.concat(ret, players_tables);
          return ret;
        },
        roundsSummaryTables: function(state) {
          return R.pipe(
            stateService.sortPlayersByName,
            R.mapIndexed(function(group, group_index) {
              var headers = roundsSummaryHeadersForGroup(state, group_index);
              var rows = roundsSummaryRowsForGroup(state, group);
              return R.concat([ ['Group'+(group_index+1)],
                                headers
                              ], rows);
            })
          )(state);
        },
        roundTables: function(round_index, state) {
          var is_team_tournament = stateService.isTeamTournament(state);
          var has_game_custom_field = stateService.hasGameCustomField(state);
          return R.pipe(
            R.nth(round_index),
            R.prop('games'),
            R.map(R.chain(gameService.toArray$(is_team_tournament, has_game_custom_field))),
            R.mapIndexed(function(group, group_index) {
              var headers = gameService.arrayHeaders(is_team_tournament,
                                                     state.custom_fields.game);
              return R.concat([ ['Group'+(group_index+1)],
                                headers
                              ], group);
            })
          )(state.rounds);
        }
      };
      
      function bestsTable(state) {
        var ret = [];
        var headers = bestsTableHeaders(state);
        if(stateService.isTeamTournament(state)) {
          var teams_values = bestsTableValues('bests_teams', 'team_undefeated', state);
          ret = R.append([
            ['Bests Teams'],
            headers,
            teams_values
          ], ret);
        }
        var players_values = bestsTableValues('bests', 'undefeated', state);
        return R.append([
          ['Bests Players'],
          headers,
          players_values
        ], ret);
      }
      function bestsTableHeaders(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Undefeated'];
        if(has_player_custom_field) {
          headers.push(state.custom_fields.player);
        }
        headers = R.concat(headers, ['SoS', 'Scenario', 'Destruction', 'Assassin']);
        if(has_game_custom_field) {
          headers.push(state.custom_fields.game);
        }
        return headers;
      }
      function bestsTableValues(bests, undefeated, state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var values = [R.path([bests, undefeated], state)];
        if(has_player_custom_field) {
          values.push(R.path([bests,'custom_field'], state));
        }
        values = R.concat(values, [ R.path([bests,'points','sos'], state),
                                    R.path([bests,'points','control'], state),
                                    R.path([bests,'points','army'], state),
                                    R.path([bests,'points','assassination'], state)
                                  ]);
        if(has_game_custom_field) {
          values.push(R.path([bests,'points','custom_field'], state));
        }
        return values;
      }

      function bestsInFactionTable(state) {
        var values = R.pipe(
          R.prop('bests_in_faction'),
          R.toPairs,
          R.map(function(pair) {
            return R.concat([pair[0]], pair[1]);
          }),
          R.sortBy(R.nth(2))
        )(state);
        return [ R.concat([ ['Bests In Faction'],
                            ['Faction', 'Player', 'Rank'],
                          ], values)
               ];
      }
      
      function playersTables(state) {
        return R.pipe(
          stateService.sortPlayersByRank,
          R.mapIndexed(groupRows$(state)),
          R.mapIndexed(groupTable$(state))
        )(state);
      }
      function groupTable(state, group_rows, group_index) {
        var headers = groupHeaders(state);
        return R.concat([ ['Group'+(group_index+1)],
                          headers
                        ], group_rows);
      }
      var groupTable$ = R.curry(groupTable);
      function groupHeaders(state) {
        var is_team_tournament = stateService.isTeamTournament(state);
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Rank', 'Name', 'Origin', 'Faction'];
        if(has_player_custom_field) {
          headers = R.concat(headers, [state.custom_fields.player]);
        }
        if(is_team_tournament) {
          headers = R.concat(headers, ['TTP']);
        }
        headers = R.concat(headers, ['TP', 'SoS', 'CP', 'AP', 'CK']);
        if(has_game_custom_field) {
          headers = R.concat(headers, [state.custom_fields.game]);
        }
        headers = R.concat(headers, ['Drop']);
        return headers;
      }
      function groupRows(state, group) {
        var is_team_tournament = stateService.isTeamTournament(state);
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        return R.pipe(
          R.map(function(rank) {
            return R.map(playerRow$(state, rank.rank), rank.players);
          }),
          R.flatten,
          R.chunkAll(10 +
                     (has_player_custom_field ? 1 : 0) +
                     (has_game_custom_field ? 1 : 0) +
                     (is_team_tournament ? 1 : 0), null)
        )(group);
      }
      var groupRows$ = R.curry(groupRows);
      function playerRow(state, rank, player) {
        var is_team_tournament = stateService.isTeamTournament(state);
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);
        
        var row = [ rank, player.name, player.origin, player.faction ];
        if(has_player_custom_field) {
          row = R.concat(row, [player.custom_field]);
        }
        if(is_team_tournament) {
          row = R.concat(row, [player.points.team_tournament]);
        }
        row = R.concat(row, [ player.points.tournament, player.points.sos,
                              player.points.control, player.points.army,
                              player.points.assassination
                            ]);
        if(has_game_custom_field) {
          row = R.concat(row, [player.points.custom_field]);
        }
        row = R.concat(row, [ playerService.hasDropedInRound(null, player) ?
                              'After Round '+player.droped :
                              ''
                            ]);
        if(playerService.hasMembers(player)) {
          row = R.concat(row, R.chain(playerRow$(state, ''),
                                      playerService.members(player))
                        );
        }
        return row;
      }
      var playerRow$ = R.curry(playerRow);

      function roundsSummaryHeadersForGroup(state, group_index) {
        var rounds_headers = R.mapIndexed(function(round, round_index) {
          return ( roundService.groupIsInBracket(group_index, round) ?
                   roundService.groupBracketRoundOf(group_index, round) :
                   'Round'+(round_index+1)
                 );
        }, state.rounds);
        var player_headers = [ 'Player', 'Lists Played' ];
        if(stateService.isTeamTournament(state)) {
          player_headers = R.prepend('Team', player_headers);
        }
        return R.concat(player_headers, rounds_headers);
      }
      function roundsSummaryRowsForGroup(state, group) {
        return R.chain(roundsSummaryRowForPlayer$(state), group);
      }
      function roundsSummaryRowForPlayer(state, player) {
        var row;
        if(playerService.hasMembers(player)) {
          row = [ player.name, '', '' ];
        }
        else {
          row = [ player.name, R.length(player.lists_played)+'/'+R.length(player.lists) ];
          if(stateService.isTeamTournament(state)) {
            row = R.prepend('', row);
          }
        }
        R.forEachIndexed(function(round, round_index) {
          if(playerService.hasDropedInRound(round_index, player)) {
            row.push('DROPPED');
            return;
          }
          
          var game = roundService.gameForPlayer(player.name, round);
          if(R.isNil(game)) {
            row.push('-');
            return;
          }

          var is_win = gameService.winForPlayer(player.name, game);
          row.push({
            value: ((is_win ? 'W' : 'L') +
                    ' - ' +
                    gameService.opponentForPlayer(player.name, game)
                   ),
            color: is_win ? 'limegreen':'red'
          });
        }, state.rounds);
        if(playerService.hasMembers(player)) {
          row = R.concat([row], R.chain(roundsSummaryRowForPlayer$(state), player.members));
        }
        else {
          row = [row];
        }
        return row;
      }
      var roundsSummaryRowForPlayer$ = R.curry(roundsSummaryRowForPlayer);

      R.curryService(stateTablesService);
      return stateTablesService;
    }
  ]);
