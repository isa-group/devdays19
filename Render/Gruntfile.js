/*!
governify-render 1.0.0, built on: 2018-05-09
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-render#readme

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


/**
 * USED ENV VARS:
 * 
 ** GITHUB_ACCESS_TOKEN
 ** GITHUB_USERNAME
 ** DOCKER_HUB_EMAIL
 ** DOCKER_HUB_USERNAME
 ** DOCKER_HUB_PASSWORD
 * 
 * CHANGES TO BE PERFORMED:
 * 
 ** REPLACE "<my-image-name>" by your DockerHub image (without user)
 ** REPLACE "<my-github-repo>" by your github repo. Eg. isa-group/project-template-nodejs
 * 
 */


'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.loadNpmTasks('grunt-release-github');

    grunt.loadNpmTasks('grunt-banner');

    grunt.loadNpmTasks('grunt-dockerize');

    grunt.loadNpmTasks("grunt-mocha-istanbul");

    // Project configuration.
    grunt.initConfig({
        //Load configurations
        pkg: grunt.file.readJSON('package.json'),
        licenseNotice: grunt.file.read('extra/license-notice', {
            encoding: 'utf8'
        }).toString(),
        latestReleaseNotes: grunt.file.read('extra/latest-release-notes', {
            encoding: 'utf8'
        }).toString(),

        //LICENCE NOTES AND HEADERS
        usebanner: {
            license: {
                options: {
                    position: 'top',
                    banner: '/*!\n<%= licenseNotice %>*/\n',
                    replace: true
                },
                files: {
                    src: ['src/**/*.js', 'tests/**/*.js', 'Gruntfile.js'] //If you want to inspect more files, you can change this.
                }
            },
            readme: {
                options: {
                    position: 'bottom',
                    banner: '## Copyright notice\n\n<%= latestReleaseNotes %>',
                    replace: /##\sCopyright\snotice(\s||.)+/g,
                    linebreak: false
                },
                files: {
                    src: ['README.md']
                }
            }
        },

        //JSLINT 
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', '!**/frontend/report/**', '!**/frontend/coverage/**', '!**/backend/node_modules/**', 'tests/**/*.js', 'index.js'], //If you want to inspect more file, you change this.
            options: {
                jshintrc: '.jshintrc'
            }
        },

        //AUTORELOAD CODE
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['jshint']
            }
        },

        //MOCHA UNIT TESTING
        mochaTest: {
            full: {
                options: {
                    reporter: 'spec',
                    //captureFile: 'test.results<%= grunt.template.today("yyyy-mm-dd:HH:mm:ss") %>.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['tests/**/*.js']
            }
        },

        //TASK FOR TESTING COVERAGE
        mocha_istanbul: {
            full: {
                src: [
                    "tests/**/*.test.js",

                ],

                options: {
                    mask: "*.test.js",
                    istanbulOptions: ["--harmony", "--handle-sigint"],
                    coverageFolder: "src/backend/coverage"
                }
            }
        },

        //MAKE A RELEASE IN GITHUB
        /**
         * Usage:
         *   grunt release:0.0.1" for patch versions
         *   grunt release:0.1.0" for minor versions
         *   grunt release:1.0.0" for major versions
         * */
        release: {
            options: {
                changelog: true,
                changelogFromGithub: true,
                githubReleaseBody: 'See [CHANGELOG.md](./CHANGELOG.md) for details.',
                npm: false, //CHANGE TO TRUE IF YOUR PROJECT IS A NPM MODULE 
                //npmtag: true, //default: no tag
                beforeBump: [],
                afterBump: [],
                beforeRelease: [],
                afterRelease: [],
                updateVars: ['pkg'],
                github: {
                    repo: "isa-group/project-template-nodejs",
                    accessTokenVar: "GITHUB_ACCESS_TOKEN",
                    usernameVar: "GITHUB_USERNAME"
                }
            }
        },

        //BUILDING AND PUSHING DOCKER IMAGES
        dockerize: {
            'governify-render-latest': { //CHANGEME: name of the image in dockerhub (without user)
                options: {
                    auth: {
                        email: "DOCKER_HUB_EMAIL",
                        username: "DOCKER_HUB_USERNAME",
                        password: "DOCKER_HUB_PASSWORD"
                    },
                    name: 'governify-render', //CHANGEME: name of the image in dockerhub (without user)
                    push: true
                }
            },
            'governify-render-version': { //CHANGEME: name of the image in dockerhub (without user)
                options: {
                    auth: {
                        email: "DOCKER_HUB_EMAIL",
                        username: "DOCKER_HUB_USERNAME",
                        password: "DOCKER_HUB_PASSWORD"
                    },
                    name: 'governify-render', //CHANGEME: name of the image in dockerhub (without user)
                    tag: '<%= pkg.version %>',
                    push: true
                }
            }
        },
    });

    grunt.registerTask('buildOn', function () {
        grunt.config('pkg.buildOn', grunt.template.today("yyyy-mm-dd"));
        grunt.file.write('package.json', JSON.stringify(grunt.config('pkg'), null, 2));
    });

    // # DEVELOPER TASKS # 

    //DEFAULT TASK
    grunt.registerTask('default', ['jshint']);

    //DEVELOPMENT TASK
    grunt.registerTask('watch', ['watch']);

    //TEST TASK
    grunt.registerTask('test', ['jshint', 'mochaTest:full']);

    //TEST AND COVERAGE TASK
    grunt.registerTask('coverage', ['test', 'mocha_istanbul:full']);



    // # RELEASE MANAGER TASKS # 
    //** HOW YO USE THEM: load env vars -next-> grunt build -next-> grunt release:xxx -next-> grunt deliver */

    //BUILD TASK
    grunt.registerTask('build', ['test', 'buildOn', 'usebanner']);

    //RELEASE TASK
    // already defined. Usage: grunt release:0.0.1" for patch versions; grunt release:0.1.0" for minor versions; grunt release:1.0.0" for major versions

    //DELIVER TASK
    grunt.registerTask('deliver', ['test', 'dockerize']);
};
