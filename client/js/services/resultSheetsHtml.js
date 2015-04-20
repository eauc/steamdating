'use strict';

angular.module('srApp.services')
  .factory('resultSheetsHtml', [
    '$q',
    '$http',
    '$interpolate',
    'players',
    'rounds',
    'list',
    function($q,
             $http,
             $interpolate,
             playersService,
             roundsService,
             listService) {
      var templates = {
        page: null,
        sheet: null,
        player: null,
        rounds: null,
        round_row: null,
        lists: null,
        list_header: null,
        list_caster: null,
        list_theme: null,
        list_content: null,
      };
      var templates_ready = false;
      var defers = [];
      var resultSheetsHtmlService = {
        init: function() {
          R.pipe(
            R.keys,
            R.map(function(key) {
              return $http.get('data/result_sheets/'+key+'.html')
                .then(function(response) {
                  templates[key] = $interpolate(response.data);
                }, function(response) {
                  console.log('error get result_sheets/'+key+'.html', response);
                  return $q.reject();
                });
            }),
            $q.all
          )(templates)
            .then(function() {
              templates_ready = true;
              R.map(function(defer) {
                defer.resolve();
              }, defers);
            });
        },
        generate: function(players) {
          if(templates_ready) {
            return generateHtml(players);
          }
          else {
            var defer = $q.defer();
            defers.push(defer);
            return defer.promise.then(function() {
              return generateHtml(players);
            });
          }
        }
      };

      function generateHtml(players) {
        var sheets = interpolateSheets(players);
        return templates.page({ sheets: sheets });
      }
      
      function interpolateSheets(players) {
        var nb_players = playersService.size(players);
        var nb_rounds = roundsService.nbRoundsNeededForNPlayers(nb_players);
        
        return R.join('', R.map(function(group) {
          return R.join('', R.map(function(player) {
            return templates.sheet({
              players: templates.player(player),
              rounds: interpolateRounds(nb_rounds, player),
              lists: interpolateLists(player)
            });
          }, group));
        }, players));
      }

      function interpolateRounds(nb_rounds, player) {
        return templates.rounds({
          rounds: R.pipe(
            R.max,
            R.inc,
            R.range(1),
            R.map(interpolateRoundRow$(player)),
            R.join('\r\n')
          )([5, nb_rounds])
        });
      }

      function interpolateRoundRow(player, index) {
        var nb_lists = R.defaultTo(1, player.lists.length);
        var lists = R.range(1, nb_lists).join(' / ');
        return templates.round_row({
          index: index,
          lists: lists
        });
      }
      var interpolateRoundRow$ = R.curry(interpolateRoundRow);
      
      function interpolateLists(player) {
        var lists = player.lists;
        while(lists.length < 2) {
          lists = R.append(listService.create(), lists);
        }
        return templates.lists({
          headers: interpolateListsHeaders(lists),
          casters: interpolateListsCasters(lists),
          themes: interpolateListsThemes(lists),
          lists: interpolateListsContents(lists)
        });
      }
      
      function interpolateListsHeaders(lists) {
        return R.join('', R.mapIndexed(function(list, index) {
          return templates.list_header({ index: index+1 });
        }, lists));
      }

      function interpolateListsCasters(lists) {
        return R.join('', R.mapIndexed(function(list, index) {
          return templates.list_caster({ caster: list.caster });
        }, lists));
      }

      function interpolateListsThemes(lists) {
        return R.join('', R.mapIndexed(function(list, index) {
          return templates.list_theme({ theme: list.theme });
        }, lists));
      }

      function interpolateListsContents(lists) {
        return R.join('', R.mapIndexed(function(list, index) {
          var lines = R.join('<br />\r\n', s.lines(list.fk));
          return templates.list_content({ lines: lines });
        }, lists));
      }

      R.curryService(resultSheetsHtmlService);
      return resultSheetsHtmlService;
    }
  ]);
