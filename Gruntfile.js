"use strict";

module.exports = function(grunt) {

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    // Define Directory
    dirs: {
      js: "src/js",
      coffee: "src/coffee",
      build: "dist"
    },

    // Metadata
    pkg: grunt.file.readJSON("package.json"),
    banner: "\n" +
      "/*\n" +
      " * -------------------------------------------------------\n" +
      " * Project: <%= pkg.title %>\n" +
      " * Version: <%= pkg.version %>\n" +
      " *\n" +
      " * Author:  <%= pkg.author.name %>\n" +
      " * Site:     <%= pkg.author.url %>\n" +
      " * Contact: <%= pkg.author.email %>\n" +
      " *\n" +
      " *\n" +
      " * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>\n" +
      " * -------------------------------------------------------\n" +
      " */\n" +
      "\n",

    // Compile CoffeeScript
    coffee: {
      compileBare: {
        options: {
          bare: true
        },
        files: {
          "<%= dirs.js %>/spriter.js": "<%= dirs.coffee %>/spriter.coffee"
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['<%= dirs.js %>/*'],
        dest: '<%= dirs.build %>/spriter.js',
      },
    },

    // Minify and Concat archives
    uglify: {
      options: {
        mangle: false,
        banner: "<%= banner %>"
      },
      dist: {
        files: {
          "<%= dirs.build %>/spriter.min.js": "<%= dirs.build %>/spriter.js"
        }
      }
    },

    // Notifications
    notify: {
      coffee: {
        options: {
          title: "CoffeeScript - <%= pkg.title %>",
          message: "Compiled and minified with success!"
        }
      },
      js: {
        options: {
          title: "Javascript - <%= pkg.title %>",
          message: "Minified and validated with success!"
        }
      }
    }
  });


  // Register Taks
  // --------------------------

  // Observe changes, concatenate, minify and validate files
  grunt.registerTask("default", ["concat", "uglify", "notify:js"]);

};