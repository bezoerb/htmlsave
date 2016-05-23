'use strict';

module.exports = function (grunt) {
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
        }
    });

    // Default task.
    grunt.registerTask('default', ['connect:sauce', 'saucelabs-mocha']);
};
