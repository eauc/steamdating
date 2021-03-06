'use strict';

angular.module('srApp.directives')
  .factory('appCache', [
    '$window',
    '$rootScope',
    function($window,
             $rootScope) {
      var instance = {
        progress: 0,
        onProgress: function() {},
        onUpdateReady: function() {}
      };
      var appCache = $window.applicationCache;

      function handleCacheEvent(e) {
        console.log('appcache ' + e.type);
        var downloading = ('progress' === e.type);
        if(downloading) {
          instance.progress = (instance.progress + 1) % 100;
        }
        else {
          instance.progress = 0;
        }
        instance.onProgress(downloading);
      }
      // Fired after the first cache of the manifest.
      appCache.addEventListener('cached', handleCacheEvent, false);
      // Checking for an update. Always the first event fired in the sequence.
      appCache.addEventListener('checking', handleCacheEvent, false);
      // An update was found. The browser is fetching resources.
      appCache.addEventListener('downloading', handleCacheEvent, false);
      // The manifest returns 404 or 410, the download failed,
      // or the manifest changed while the download was in progress.
      appCache.addEventListener('error', handleCacheEvent, false);
      // Fired after the first download of the manifest.
      appCache.addEventListener('noupdate', handleCacheEvent, false);
      // Fired if the manifest file returns a 404 or 410.
      // This results in the application cache being deleted.
      appCache.addEventListener('obsolete', handleCacheEvent, false);
      // Fired for each resource listed in the manifest as it is being fetched.
      appCache.addEventListener('progress', handleCacheEvent, false);
      // Fired when the manifest resources have been newly redownloaded.
      appCache.addEventListener('updateready', function(e) {
        console.log('appcache ' + e.type);
        if(appCache.status === appCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          instance.onUpdateReady();
        }
        else {
          // Manifest didn't changed. Nothing new to server.
          console.log('appcache nochange');
        }
        instance.progress = 0;
        instance.onProgress(false);
      }, false);
      return instance;
    }
  ])
  .directive('appCacheProgressBar', function() {
    return {
      restrict: 'E',
      template: '\
<div class="appcache-progress"\
     ng-show="appCache.progress != 0">\
  <div class="appcache-progress-bar"\
       ng-style="{\'width\': appCache.progress + \'%\' }"></div>\
</div>',
      controller: [
        '$scope',
        '$window',
        'prompt',
        'appCache',
        function($scope,
                 $window,
                 prompt,
                 appCache) {
          $scope.appCache = appCache;
          appCache.onProgress = function() {
            $scope.$digest();
          };
          appCache.onUpdateReady = function() {
            prompt.prompt('confirm', 'A new version of this site is available. Load it?')
              .then(function() {
                $window.location.reload();
              });
          };
        }
      ],
      link: function(scope, iElement, iAttrs) {
      }
    };
  });
