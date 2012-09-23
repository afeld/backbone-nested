/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
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
        eqnull: true
      },
      globals: {
        jQuery: true
      }
    },
    lint: {
      files: ['grunt.js', '*.js', 'test/nested-model.js']
    },
    qunit: {
      index: ['test/index.html']
    },
    watch: {
      files: ['<config:lint.files>', 'test/**'],
      tasks: 'lint qunit'
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit');
};
