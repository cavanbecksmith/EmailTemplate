/*
| Grunt Email Framework
|
| Prerequisites: `brew install trash`
|
| Author: cavanbecksmith@gmail.com
*/

'use strict';


module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),

        // ---------------------------------------------------------------------------------

        connect: {
            server: {
                options: {
                    livereload: true,
                    hostname: 'localhost',
                    port: 4567
                }
            }
        },

        // ---------------------------------------------------------------------------------

        sass: {
            body: {
                files: {
                    'dev/assets/stylesheets/dist/body.css' : 'dev/assets/stylesheets/dist/body.scss'
                }
            },

            responsive: {
                files: {
                    'dev/assets/stylesheets/dist/responsive.css' : 'dev/assets/stylesheets/dist/responsive.scss'
                }
            },

            head: {
                files: {
                    'dev/assets/stylesheets/dist/head.css' : 'dev/assets/stylesheets/dist/head.scss'
                }
            }
        },

        // ---------------------------------------------------------------------------------

        emailBuilder: {
            build: {
                files: {
                    'build/1024_WIDTH.html' : 'dev/1024_WIDTH.html',
                    'build/FULL_WIDTH.html' : 'dev/FULL_WIDTH.html',
                },

                options: {
                    encodeSpecialChars: true
                }
            }
        },

        // ---------------------------------------------------------------------------------

        shell: {
            zipImages: {
                command: [
                    'cd dev/assets',
                    'zip -r ../images.zip images',
                    'cd ..',
                    'mv images.zip ../build/',
                    'cd ../build/',
                    'unzip -o images.zip'
                ].join('&&')
            },

            initBuildFolder: {
                command: [
                    'trash build',
                    'sleep 1',
                    'mkdir build'
                ].join('&&')
            },

            buildMailchimp: {
                command: [
                    'zip -r mailchimp.zip build'
                ].join('&&')
            }
        },

        // ---------------------------------------------------------------------------------

        notify: {
            emailBuilderStarted: {
                options: {
                    title: 'Email Builder Started',
                    message: 'You\'re ready to go!'
                }
            },

            imagesUploaded: {
                options: {
                    title: 'Images Changed',
                    message: 'Files uploaded to resource server'
                }
            },

            buildMailchimpSuccess: {
                options: {
                    title: 'Mailchimp',
                    message: 'Build successfully zipped'
                }
            },

            build: {
                options: {
                    title: 'Email Template',
                    message: 'Successfully built'
                }
            }
        },

        // ---------------------------------------------------------------------------------

        lineremover: {
            build: {
                files: {
                    'build/build.html' : 'build/build.html'
                }
            },
        },

        // ---------------------------------------------------------------------------------

        'ftp-deploy': {
            images: {
                auth: {
                    host: '<%= config.resourcesIP %>',
                    port: 21,
                    authKey: 'default'
                },
                src: 'dev/assets/images/',
                dest: '/public_html/email-assets/' + '<%= config.client %>' + '/' + '<%= config.projectName %>',
                exclusions: ['dev/assets/images/**/.DS_Store']
            },

            webversion: {
                auth: {
                    host: '<%= config.resourcesIP %>',
                    port: 21,
                    authKey: 'default'
                },
                src: 'build/',
                dest: '/public_html/webversion/' + '<%= config.client %>' + '/' + '<%= config.projectName %>',
                exclusions: ['build/images.zip']
            }
        },

        // ---------------------------------------------------------------------------------

        nodemailer: {
            person: {
                options: {
                    transport: {
                        type: 'SMTP',
                        options: {
                            service: 'Gmail',
                            auth: {
                                user: '<%= config.mailBot %>',
                                pass: '<%= config.mailBotPass %>'
                            }
                        }
                    },

                    message: {
                        from: 'Testbot <testbot.example@example.com>',
                        replyTo: 'testbot.example@example.com'
                    },

                    recipients: '<%= config.emailRecipients %>'
                },

                src: ['build/build.html']
            }
        },

        // ---------------------------------------------------------------------------------

        replace: {
            build: {
                src: ['build/build.html'],
                overwrite: true,

                replacements: [{
                    from: '<%= config.resourcesURL %>email-assets/' + '<%= config.client %>' + '/' + '<%= config.projectName %>' + '/',
                    to: 'images/'
                }]
            }
        },

        // ---------------------------------------------------------------------------------

        search: {
            checkBuild: {
                files: {
                    src: ['build/build.html']
                },

                options: {
                    searchString: '<%= config.resourcesURL %>',
                    logFormat: 'console',
                    failOnMatch: true
                }
            }
        },

        // ---------------------------------------------------------------------------------

        watch: {
            options: {
                livereload: true
            },

            html: {
                files: ['**/*.html']
            },

            sass: {
                options: {
                    livereload: false
                },

                files: ['dev/assets/stylesheets/**/*.scss'],
                tasks: ['sass']
            },

            css: {
                files: [
                    'dev/assets/stylesheets/**/*.css'
                ]
            },

            images: {
                files: ['dev/assets/images/**/*'],
                tasks: ['ftp-deploy:images', 'notify:imagesUploaded']
            }
        }
    });

    // ------------------------------------------------------------------------

    grunt.registerTask('default', [
        'connect:server',
        'watch',
        'notify:emailBuilderStarted'
    ]);

    // ------------------------------------------------------------------------
    grunt.registerTask('push', [
        'ftp-deploy:images',
        'notify:imagesUploaded'
    ]);

    // ------------------------------------------------------------------------

    grunt.registerTask('litmus', [
        'shell:initBuildFolder',
        'sass',
        'emailBuilder:build',
        'shell:zipImages',
        'lineremover',
    ]);

    // ------------------------------------------------------------------------

    grunt.registerTask('webVersionURL', function() {
        console.log('URL: ' + grunt.config('config.resourcesURL') + '/webversion/' + grunt.config('config.client') + '/' + grunt.config('config.projectName') + '/build.html');
    });

    grunt.registerTask('webversion', [
        'emailBuilder:build',
        'replace:build',
        'ftp-deploy:webversion',
        'webVersionURL'
    ]);

    // ------------------------------------------------------------------------

    grunt.registerTask('email', [
        'emailBuilder:build',
        'nodemailer:person'
    ]);

    // ------------------------------------------------------------------------

    grunt.registerTask('mailchimp', [
        'shell:initBuildFolder',
        'sass',
        'emailBuilder:build',
        'shell:zipImages',
        'replace:build',
        'lineremover',
        'notify:buildMailchimpSuccess',
        'search:checkBuild',
        'shell:buildMailchimp'
    ]);

    // ------------------------------------------------------------------------

    grunt.registerTask('build', [
        'shell:initBuildFolder',
        'sass',
        'emailBuilder:build',
        'shell:zipImages',
        'replace:build',
        'lineremover',
        'notify:build',
        'search:checkBuild'
    ]);
};