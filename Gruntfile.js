'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
	require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']});

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.

        browserify: {
            dist: {
                src: 'src/htmlsave.js',
                dest: 'dist/htmlsave.js',
                options: {

                    transform: ['es6ify','debowerify', 'decomponentify', 'deamdify', 'deglobalify']
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= browserify.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
// Unit tests.
        simplemocha: {
            options: {
                globals: ['should'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd'
            },

            all: { src: ['test/**/*-test.js'] },
            truncate: { src: ['test/truncate-test.js'] },
            slice: { src: ['test/slice-test.js'] },
            utils: { src: ['test/utils-test.js'] }
        },
        open: {
            jasmine: {
                path: 'http://127.0.0.1:8000/_SpecRunner.html'
            }
        },
        connect: {
            test: {
                port: 8000,
                keepalive: true
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'jasmine']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'jasmine']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['test', 'browserify', 'uglify']);

    // Just tests
    grunt.registerTask('test', ['jshint', 'simplemocha:all']);

	grunt.registerTask("sauce", ["connect:sauce:keepalive", "saucelabs-jasmine"]);
	// Test with lots of browsers on saucelabs. Requires valid SAUCE_USERNAME and SAUCE_ACCESS_KEY in env to run.
	grunt.registerTask('saucelabs', ['jasmine:requirejs:src:build', 'connect:test', 'saucelabs-jasmine']);

    // Test with a live server and an actual browser
    grunt.registerTask('integration-test', ['jasmine:src:build', 'connect:test:keepalive', 'open:jasmine']);


};
