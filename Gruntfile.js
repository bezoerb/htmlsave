'use strict';

module.exports = function(grunt) {

    var browsers = [
        {
            browserName: "firefox",
            version: "30",
            platform: "Windows 8"
        },
        {
            browserName: "chrome",
            version: "35",
            platform: "Windows 8"
        },
        {
            browserName: "internet explorer",
            platform: "Windows 7",
            version: "9"
        },
        {
            browserName: "internet explorer",
            platform: "Windows 7",
            version: "10"
        },
        {
            browserName: "internet explorer",
            platform: "Windows 8.1",
            version: "11"
        },
        {
            browserName: "safari",
            platform: "OS X 10.9",
            version: "7"
        },
        {
            browserName: "firefox",
            platform: "OS X 10.9",
            version: "30"
        },
        {
            browserName: "chrome",
            platform: "OS X 10.9",
            version: "35"
        },
        {
            browserName: "iphone",
            platform: "OS X 10.9",
            version: "7.0"
        }
    ];


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
        clean: {
            tmp: ['.tmp']
        },
        browserify: {
            dist: {
                src: 'src/<%= pkg.name %>.js',
                dest: '.tmp/<%= pkg.name %>.js',
                options: {
                    bundleOptions: {
                        standalone: '<%= pkg.name %>',
                        debug: false
                    },
                    transform: ['es6ify', 'debowerify', 'decomponentify', 'deamdify', 'deglobalify']
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['<%= browserify.dist.dest %>'],
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
        connect: {
            sauce: {
                port: 8000
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ["http://127.0.0.1:8000/test/browser-integration-test.html"],
                    tunnelTimeout: 5,
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 3,
                    browsers: browsers,
                    testname: "mocha tests",
                    tags: ["master"]
                }
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
                src: ['src/**/*.js']
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
    grunt.registerTask('default', ['test', 'browserify', 'concat','uglify','clean']);

    // Just tests
    grunt.registerTask('test', ['jshint', 'simplemocha:all']);


    grunt.registerTask("sauce", ["connect:sauce", "saucelabs-mocha"]);


};
