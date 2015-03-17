module.exports = function(grunt) {

  var js_src =  [ 'client/js/**/*.js', '!**/*.min.js' ];
  var spec_js_src = [ 'spec/main/**/*Spec.js' ];
  var spec_js_helpers = [ 'spec/support/helpers/*.js' ];

  var stats_js_src =  [ 'client/stats/js/**/*.js', '!client/stats/js/app.min.js' ];
  var stats_spec_js_src = [ 'spec/stats/**/*Spec.js' ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      app_src: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: js_src.concat(stats_js_src)
        }
      },
      spec_src: {
        options: {
          jshintrc: '.spec_jshintrc'
        },
        files: {
          src: spec_js_src.concat(stats_spec_js_src, spec_js_helpers)
        }
      }
    },
    uglify: {
      app_src: {
        options: {
          compress: {
            drop_console: true
          }
        },
        files: {
          'client/js/app.min.js': js_src,
          'client/stats/js/app.min.js': stats_js_src.concat(['client/js/mixins/**.js',
                                                             'client/js/services/**.js',
                                                             'client/js/directives/**.js',
                                                             '!client/js/services/stats.js'])
        }
      }
    },
    jasmine: {
      spec: {
        src: js_src,
        options: {
          specs: spec_js_src,
          helpers: spec_js_helpers,
          vendor: [
            'client/lib/ramda/ramda.js',
            'client/lib/underscore.string/underscore.string.js',
            'client/lib/angular/angular.js',
            'client/lib/angular-ui-router/angular-ui-router.min.js',
            'client/lib/angular/angular-mocks.js'
          ],
          outfile: 'spec/SpecRunner.html',
          keepRunner: true
        }
      },
      stats_spec: {
        src: stats_js_src.concat(['client/js/mixins/**.js',
                                  'client/js/services/**.js',
                                  'client/js/directives/**.js',
                                  '!client/js/services/stats.js']),
        options: {
          specs: stats_spec_js_src,
          helpers: spec_js_helpers,
          vendor: [
            'client/lib/ramda/ramda.js',
            'client/lib/underscore.string/underscore.string.js',
            'client/lib/angular/angular.js',
            'client/lib/angular-ui-router/angular-ui-router.min.js',
            'client/lib/angular/angular-mocks.js'
          ],
          outfile: 'spec/statsSpecRunner.html',
          keepRunner: true
        }
      }
    },
    watch: {
      app_src: {
        files: js_src.concat(stats_js_src),
        tasks: [ 'jshint:app_src', 'uglify:app_src' ],
        options: {
          spawn: true
        }
      },
      uglify: {
        files: js_src.concat(stats_js_src),
        tasks: [ 'uglify:app_src' ],
        options: {
          spawn: true
        }
      },
      spec_src: {
        files: js_src.concat(stats_js_src, spec_js_src, stats_spec_js_src, spec_js_helpers),
        tasks: [ 'jshint:app_src', 'jshint:spec_src', 'jasmine:spec', 'jasmine:stats_spec' ],
        options: {
          spawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
