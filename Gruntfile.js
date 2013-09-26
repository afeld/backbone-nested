/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      files: ['grunt.js', '*.js', 'test/nested-model.js'],
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,

        globals: {
          jQuery: true
        }
      },
    },
    qunit: {
      index: ['test/index.html']
    },
    watch: {
      files: ['<config:lint.files>', 'test/**'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit']);
};
