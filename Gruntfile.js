'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	var browsers = [{
		browserName: "firefox",
		version: "19",
		platform: "XP"
	}, {
		browserName: "chrome",
		platform: "XP"
	}, {
		browserName: "chrome",
		platform: "linux"
	}, {
		browserName: "internet explorer",
		platform: "WIN8",
		version: "10"
	}, {
		browserName: "internet explorer",
		platform: "VISTA",
		version: "9"
	}, {
		browserName: "opera",
		platform: "Windows 2008",
		version: "12"
	}];

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
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
//        jasmine: {
//            src: 'src/**/*.js',
//            options: {
//                specs: 'test/*-test.js',
//                vendor: 'test/vendor/*.js',
//                helpers: 'test/*-helper.js',
//                template: require('grunt-template-jasmine-requirejs')
//            }
//        },
		jasmine: {
			requirejs: {
				src: [],
				options: {
					specs: 'test/*-test.js',
					vendor: 'test/vendor/*.js',
					helpers: 'test/*-helper.js',
					template: require('grunt-template-jasmine-requirejs')
				}
			},
			global: {
				src: 'src/**/*.js',
				options: {
					specs: 'test/*-test.js',
					vendor: 'test/vendor/*.js',
					helpers: 'test/*-helper.js',
					template: require('grunt-template-jasmine-requirejs')
				}
			}
		},
		"jasmine_node": {
			match: "node-integration.",
			matchall: true,
			projectRoot: "./test",
			useHelpers: false
		},
		'saucelabs-jasmine': {
			all: {
				options: {
					urls: ["http://127.0.0.1:8000/_SpecRunner.html"],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "htmlsave jasmine tests",
					tags: ["master"]
				}
			}
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
    grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify']);

    // Just tests
    grunt.registerTask('test', ['jshint', 'jasmine:global','jasmine_node']);

	grunt.registerTask("sauce", ["connect:sauce:keepalive", "saucelabs-jasmine"]);
	// Test with lots of browsers on saucelabs. Requires valid SAUCE_USERNAME and SAUCE_ACCESS_KEY in env to run.
	grunt.registerTask('saucelabs', ['jasmine:requirejs:src:build', 'connect:test', 'saucelabs-jasmine']);

    // Test with a live server and an actual browser
    grunt.registerTask('integration-test', ['jasmine:src:build', 'connect:test:keepalive', 'open:jasmine']);


};
