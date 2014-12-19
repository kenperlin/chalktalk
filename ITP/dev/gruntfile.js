module.exports = function(grunt) {

  grunt.initConfig({

    requirejs: {
      unmin: {
        options: {
          // exclude: 'THREE',
          baseUrl: './src',
          include: ['app'],
          // paths: {
          //   "THREE" : "../deps/three"
          // },
          out: 'build/chalktalk.js',
          optimize: 'none',
          findNestedDependencies: true,
          onModuleBundleComplete: function( data ) {
            var fs = require('fs');
            var amdclean = require('amdclean');
            outputFile = data.path;
            fs.writeFileSync(outputFile, amdclean.clean({
              'filePath': outputFile
            }));
          }
        }
      },
      min: {
        options: {
          baseUrl: './src',
          include: ['app'],
          out: 'build/chalktalk.min.js',
          optimize: 'uglify2',
          paths: '<%= requirejs.unmin.options.paths %>',
          onModuleBundleComplete: function( data ) {
            var fs = require('fs');
            var amdclean = require('amdclean');
            outputFile = data.path;
            fs.writeFileSync(outputFile, amdclean.clean({
              'filePath': outputFile
            }));
          }
        }
      }
    },

    watch: {
      // 
      main: {
        files: ['**/*.js'],
        tasks: ['requirejs'],
        options: { livereload: true }
      },
    },

    shell: {  
      build_docs: {
          command: "./node_modules/.bin/jsdoc build/chalktalk.js --destination ./docs"
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('build',['requirejs','shell:build_docs']);
  // grunt.loadNpmTasks('grunt-contrib-grunt-shell');

  // require('load-grunt-shell')(grunt);
  // grunt.registerTask('default', ['shell:build_docs']);

};