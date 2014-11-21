module.exports = function(grunt) {

  grunt.initConfig({

    requirejs: {
      unmin: {
        options: {
          baseUrl: './src',
          include: ['app'],
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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

};