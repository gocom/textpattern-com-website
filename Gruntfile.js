module.exports = function (grunt)
{
    'use strict';

    // Define Sass implmentation (Dart-Sass).
    const Fiber = require('fibers');
    const sass = require('dart-sass');

    // Load all Grunt tasks.
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Set up paths.
        paths: {
            src: {
                fonts: 'src/assets/fonts/',
                sass: 'src/assets/sass/',
                js: 'src/assets/js/',
                mockups: 'src/mockups/',
                templates: 'src/templates/'
            },
            dest: {
                css: 'public/assets/css/',
                fonts: 'public/assets/fonts/',
                img: 'public/assets/img/',
                js: 'public/assets/js/',
                mockups: 'public/mockups/',
                templates: 'public/themes/textpattern-com/'
            }
        },

        // Set up timestamp.
        opt : {
            timestamp: '<%= new Date().getTime() %>'
        },

        // Clean distribution directories/files to start afresh.
        clean: [
            '<%= paths.dest.css %>',
            '<%= paths.dest.fonts %>',
            '<%= paths.dest.img %>',
            '<%= paths.dest.js %>',
            '<%= paths.dest.mockups %>*/',
            '<%= paths.dest.templates %>',
            'public/design-patterns.html'
        ],

        // Run some tasks in parallel to speed up the build process.
        concurrent: {
            dist: [
                'copy',
                'css',
                'jshint'
            ]
        },

        // Copy files.
        copy: {
            // Copy fonts.
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.src.fonts %>',
                        src: ['**'],
                        dest: '<%= paths.dest.fonts %>'
                    }
                ]
            },
            // Copy Textpattern branding assets.
            img: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/img/',
                        src: ['**'],
                        dest: '<%= paths.dest.img %>com/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/textpattern-branding/assets/img/',
                        src: ['**'],
                        dest: '<%= paths.dest.img %>branding/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/textpattern-branding/assets/img/apple-touch-icon/textpattern/',
                        src: ['**'],
                        dest: 'public/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/textpattern-branding/assets/img/favicon/textpattern/',
                        src: ['**'],
                        dest: 'public/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/textpattern-branding/assets/img/windows-site-tile/textpattern/',
                        src: ['**'],
                        dest: 'public/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/textpattern-branding/assets/img/misc/',
                        src: ['hi.png', 'hi@2x.png'],
                        dest: 'public/'
                    }
                ]
            },
            // Copy JavaScript from from `src/js/` when already minified (i.e. don't Uglify these).
            js: {
                files: [
                    {
                        '<%= paths.dest.js %>createjs.js': ['<%= paths.src.js %>createjs-2015.11.26.min.js']
                    }
                ]
            }
        },

        // Check code quality of Gruntfile.js and site-specific JavaScript using JSHint.
        jshint: {
            options: {
                bitwise: true,
                browser: true,
                curly: true,
                eqeqeq: true,
                esversion: 6,
                forin: true,
                globals: {
                    define: true,
                    module: true,
                    require: true,
                    Prism: true,
                    i: true
                },
                latedef: true,
                noarg: true,
                nonew: true,
                strict: false,
                undef: true,
                unused: false
            },
            files: [
                'Gruntfile.js',
                '<%= paths.src.js %>*.js',
                '!<%= paths.src.js %>*.min.js'
            ]
        },

        // Add vendor prefixed styles and other post-processing transformations.
        postcss: {
            options: {
                processors: [
                    require('autoprefixer'),
                    require("css-mqpacker"),
                    require('cssnano')
                ]
            },
            dist: {
                src: '<%= paths.dest.css %>*.css'
            }
        },

        // Generate filename timestamps within templates/mockup files.
        replace: {
            theme: {
                options: {
                    patterns: [
                        {
                            match: 'timestamp',
                            replacement: '<%= opt.timestamp %>'
                        },
                        {
                            match: 'ampcss',
                            replacement: '<%= grunt.file.read("public/assets/css/amp.css") %>'
                        }
                    ]
                },
                files: [
                    // Copy mockups to mockups directory.
                    {
                        expand: true,
                        cwd: '<%= paths.src.mockups %>',
                        src: '**',
                        dest: '<%= paths.dest.mockups %>'
                    },
                    // Copy design patterns doc to public (root) directory.
                    {
                        src: 'src/docs/design-patterns.html',
                        dest: 'public/design-patterns.html'
                    },
                    // Copy Textpattern templates to themes directory.
                    {
                        expand: true,
                        cwd: '<%= paths.src.templates %>',
                        src: '**',
                        dest: '<%= paths.dest.templates %>'
                    }
                ]
            }
        },

        // Sass configuration.
        sass: {
            options: {
                fiber: Fiber,
                implementation: sass,
                outputStyle: 'expanded', // outputStyle = expanded, nested, compact or compressed.
                sourceMap: false
            },
            dist: {
                files: [
                    {'<%= paths.dest.css %>style.css': '<%= paths.src.sass %>style.scss'},
                    {'<%= paths.dest.css %>amp.css': '<%= paths.src.sass %>amp.scss'},
                    {'<%= paths.dest.css %>designpatterns.css': '<%= paths.src.sass %>designpatterns.scss'}
                ]
            }
        },

        // Validate Sass files via sass-lint.
        sasslint: {
            options: {
                configFile: '.sass-lint.yml'
            },
            target: ['<%= paths.src.sass %>**/*.scss']
        },

        // Uglify and copy JavaScript files from `node_modules` and from `src/js/` to `public/assets/js/`.
        uglify: {
            dist: {
                files: [
                    {
                        '<%= paths.dest.js %>app.js': [
                            // Prism: Core.
                            'node_modules/prismjs/prism.js',
                            // Prism: Plugins.
                            'node_modules/prismjs/plugins/line-numbers/prism-line-numbers.js',
                            // Prism: Additional languages.
                            'node_modules/prismjs/components/prism-markup-templating.js',
                            'node_modules/prismjs/components/prism-apacheconf.js',
                            'node_modules/prismjs/components/prism-bash.js',
                            'node_modules/prismjs/components/prism-nginx.js',
                            'node_modules/prismjs/components/prism-php.js',
                            'node_modules/prismjs/components/prism-scss.js',
                            'node_modules/prismjs/components/prism-textile.js',
                            // Site-specific JavaScript.
                            '<%= paths.src.js %>main.js'
                        ],
                        '<%= paths.dest.js %>createjs.js': ['node_modules/createjs/builds/1.0.0/createjs.js'],
                        '<%= paths.dest.js %>indexcanvas.js': ['<%= paths.src.js %>indexcanvas.js'],
                        '<%= paths.dest.js %>lunr.js': ['node_modules/lunr/lunr.js']
                    }
                ]
            }
        },

        // Directories watched and tasks performed by invoking `grunt watch`.
        watch: {
            sass: {
                files: '<%= paths.src.sass %>**/*.scss',
                tasks: 'css'
            },
            js: {
                files: '<%= paths.src.js %>*.js',
                tasks: [
                    'jshint',
                    'uglify'
                ]
            },
            html: {
                files: [
                    '<%= paths.src.mockups %>**',
                    '<%= paths.src.templates %>**',
                    'src/docs/design-patterns.html'
                ],
                tasks: 'replace'
            }
        }

    });

    // Register tasks.
    grunt.registerTask('build', ['clean', 'concurrent', 'replace', 'uglify']);
    grunt.registerTask('css', ['sasslint', 'sass', 'postcss']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('travis', ['build']);
};
