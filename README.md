Fakefile
================

You need a **Fork** to eat a **Cake**!

This `Forkfile` is a assistance file for `Cakefile` with several useful
functions to keep `Cakefile` as simple as possible.

Features
----------------
`Cakefile` bundled in this repository give you the following features powered
by `Fakefile`

-   Compile CoffeeScript files to JavaScript files
-   Compile CoffeeScript files to a single JavaScript file
-   Compose generated JavaScript file with Library JavaScript files
-   Compile LESS files to CSS files
-   Compile LESS files to a single CSS file
-   Compose generated CSS file with Library CSS files
-   Minify JavaScript/CSS files via YUI Compressor
-   Run unittests via Mocha
-   Create a HTML for testing in Browser via Mocha
-   Create instrumented JavaScript files via CoverJS
-   Run demo web server (0.0.0.0:8000 default)


How to use
--------------------
1.  Download `Cakefile` and `Forkfile` to your project directory.
    The `Cakefile` assume that you have a directory tree something like the
    below

        root
        |
        +- src
        |   +- coffee                   - CoffeeScript files come here
        |   |
        |   +- js                       - Compiled JavaScript files come here
        |
        +- lib                          - Library JavaScript files come here (Included in Product JavaScript file)
        |
        +- style
        |   +- less                     - LESS files come here
        |   |
        |   +- css                      - Compiled CSS files come here
        |
        +- test
        |   +- coffee                   - CoffeeScript files for unittest come here
        |   |
        |   +- js                       - Compiled JavaScript files come here
        |
        +- demo
        |   +- index.html               - A index HTML file for DEMO server
        |   |
        |   +- test.html                - Generated HTML file for testing in Browser
        |
        +- build
        |   +- Product.0.0.0.js         - Product JavaScript file come here
        |   |
        |   +- Product.0.0.0.min.js     - Minified JavaScript file come here
        |   |
        |   +- Product.0.0.0.css        - Product CSS file come here
        |   |
        |   +- Product.0.0.0.min.css    - Minified CSS file come here
        |
        +- Cakefile
        |
        +- Fakefile

2.  First, you need to install required node modules so execute the command
    below

        $ cake install

3.  After that, open `Cakefile` and change the settings as you want. You can
    use the following commands to compile, minify, or etc.

    -   `cake develop`

        Run develop mode. In this mode, the file changes are watched and
        automatically compiled to JavaScript/CSS file. The unittests and lint
        are executed at first run.

    -   `cake release`

        Run release mode. First, everything will be tested with mocha and
        lint. After all, everything is composed into a single JavaScript/CSS
        file and minified. The generated files are in `build` directory

    -   `cake demo`

        Run demo server at 0.0.0.0:8000 (in default).

    -   `cake test:mocha`

        Run unittests via mocha in node.js

    -   `cake test:html`

        Create a HTML file for testing in Browser via mocha

    -   `cake clean`

        Clean all generated files

4.  You can regulate files you interest with `SRC_FILES`, `LIB_FILES`,
    `TEST_FILES`, `STYLE_FILES`, and `COV_FILES`. All files are included in
    file list as glob pattern except if the pattern starts with `-`

File Patterns
--------------------------
You can use *glob pattern* to regulate files include. You also can exclude
files by adding `-` at the begining of the pattern. See example below

    # Include all CoffeeScript files
    SRC_FILES = ['**/*.coffee']

    # Several files required to be order
    SRC_FILES = [
        'first.coffee',
        'second.coffee',
        'third.coffee',
        '**/*.coffee'
    ]

    # Several files should not be included (like @import in LESS)
    STYLE_FILES = [
        '**/*.less',
        '-mixin.less',
    ]

Information
----------------------

-   Version: 0.1.1
-   Author: lambdalisue
-   License: MIT license
-   Url: http://github.com/lambdalisue/Forkfile

Copyright(c) 2012 lambdalisue, hashnote.net all right reserved.
