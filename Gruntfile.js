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
			// Requires valid SAUCE_USERNAME and SAUCE_ACCESS_KEY in env to run.
			all: {
				options: {
					urls: ['http://localhost:8000/_SpecRunner.html'],
					browsers: [
						{"browserName": "firefox", "platform": "Windows 2003", "version": "3.6"},
						{"browserName": "firefox", "platform": "Windows 2003", "version": "4"},
						{"browserName": "firefox", "platform": "Windows 2003", "version": "25"},
						{"browserName": "safari", "platform": "Mac 10.6", "version": "5"},
						{"browserName": "safari", "platform": "Mac 10.8", "version": "6"},
						{"browserName": "googlechrome", "platform": "Windows 7"},
						{"browserName": "iehta", "platform": "Windows 7", "version": "9"},
						{"browserName": "iehta", "platform": "Windows 7", "version": "10"},
						{"browserName": "opera", "platform": "Windows 7", "version": "12"},
						{"browserName": "android", "platform": "Linux", "version": "4.0"},
						{"browserName": "iphone", "platform": "OS X 10.8", "version": "6"}
					],
					concurrency: 1,
					detailedError: true,
					testTimeout:10000,
					testInterval:1000,
					testReadyTimeout:2000,
					testname: 'htmlsave jasmine test',
					tags: [process.env.TRAVIS_REPO_SLUG || "local", process.env.TRAVIS_COMMIT || "manual"]
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
