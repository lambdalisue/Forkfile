###
Cakefile - Hashnote

Features:
  - Compile CoffeeScript files to JavaScript files
  - Compile CoffeeScript files to a single JavaScript file
  - Compose generated JavaScript file with Library JavaScript files
  - Compile LESS files to CSS files
  - Compile LESS files to a single CSS file
  - Minify JavaScript/CSS files via YUI Compressor
  - Run unittests via Mocha
  - Create instrumented JavaScript files via CoverJS
  - Run demo web server (0.0.0.0:8000 default)

Require:
  - Forkfile

Author:   lambdalisue
License:  MIT License

Copyright (c) lambdalisue, hashnote.net all right reserved.
###
NAME                    = 'Forkfile'
VERSION                 = '0.1.0'
RELEASE_ROOT            = 'out'
# Demo
DEMO_ROOT               = 'demo'
DEMO_SERVER             = '0.0.0.0'
DEMO_PORT               = '8000'
DEMO_TEST_FILENAME      = 'test.html'
DEMO_TEST_VENDER_ROOT   = 'vender'
DEMO_TEST_EXTRA_VENDERS = null
# Script
SCRIPT_CS_ROOT          = 'src/coffee'
SCRIPT_JS_ROOT          = 'src/js'
SCRIPT_FILES            = [
  'konsole',
  'core',
  '**/*',
]
# TEST
TEST_CS_ROOT          = 'test/coffee'
TEST_JS_ROOT          = 'test/js'
TEST_FILES            = [
  '**/*.spec',
]
TEST_HTML_ROOT        = DEMO_ROOT
TEST_HTML_FILE        = 'test.html'
# Style
STYLE_LESS_ROOT         = 'sty/less'
STYLE_CSS_ROOT          = 'sty/css'
STYLE_FILES             = [
  '**/*',
]

HEADER_JS = """
/**
 * #{NAME} #{VERSION}
 *
 * Author:  lambdalisue
 * URL:     http://hashnote.net/
 * License: MIT License
 * 
 * Copyright (C) 2012 lambdalisue, hashnote.net all right reserved.
 */
"""
HEADER_CSS = HEADER_JS
COFFEELINT_CONFIG = null
YUI_COMPRESSOR = '~/.yuicompressor/build/yuicompressor-2.4.7.jar'
REQUIRED_MODULES = []
###########################################################################
fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn
fork = require './out/Forkfile.0.1.0.js'

option '-e', '--encoding', 'Encoding used for read/write a file'
option '-w', '--watch', 'Continuously execute action'
option '-f', '--force', 'Force to execute action'

# Use Konsole as Console
console = fork.konsole
# Use `console.noColor = true` to disable coloring
#console.noColor = true

truncateString = (str, prefix, suffix) ->
  return str[prefix.length...str.length-suffix.length]

prependHeaderToFile = (file, header, encoding, done) ->
  fs.readFile file, encoding, (err, data) ->
    throw err if err
    data = header + "\n" + data
    fs.writeFile file, data, encoding, (err) ->
      throw err if err
      done() if done

compileCoffee = (files, csRoot, jsRoot, options, done) ->
  complete = ->
    if options.watch
      console.log " + Watching file changes..."
    done(options) if done
  # create file list
  fileList = fork.globset(files, csRoot, '.coffee')
  if fileList.length <= 0
    done(options) if done
    return
  console.log.strong "Compile CoffeeScript files to JavaScript files ..."
  # compile each CoffeeScript to JavaScript
  options.bare = true
  options.encoding = options.encoding or 'utf-8'
  remaining = fileList.length
  for src in fileList then do (src) ->
    base = truncateString(src, csRoot, '.coffee')
    dst = jsRoot + base + '.js'
    compile = ->
      fork.compiler.coffee src, dst, options, ->
        complete() if --remaining is 0
    compile()
    if options.watch
      fs.watchFile src, compile
  return false

task2 'clean', 'Clean up generated files', ->
  fork.execFile('rm', ['-rf', SCRIPT_JS_ROOT])
  fork.execFile('rm', ['-rf', TEST_JS_ROOT])
  fork.execFile('rm', ['-rf', STYLE_CSS_ROOT])

task2 'install', 'Install required node modules', ->
  fork.installRequiredModules(REQUIRED_MODULES)

task2 'demo', "Start Demo server at #{DEMO_SERVER}:#{DEMO_PORT}", ->
  if not fork.existsSync DEMO_ROOT
    console.error "There is no `#{DEMO_ROOT}` directory. You need to create it before starting Demo server."
    return
  server = fork.network.createStaticServer(DEMO_ROOT)
  console.log.strong "Start demo server at #{DEMO_SERVER}:#{DEMO_PORT}..."
  server.listen(DEMO_PORT, DEMO_SERVER)

task2 'release', "Create product JavaScript/CSS and minify to release the product", (options, done) ->
  invoke2 'compile:release', options, ->
    invoke2 'minify', options, done

task2 'compile', "Compile all CoffeeScript/LESS files into JavaScript/CSS files", (options, done) ->
  invoke2 'compile:coffee', options, ->
    invoke2 'compile:coffee:test', options, ->
      invoke2 'compile:less', options, done

task2 'compile:release', "Compile all CoffeeScript/LESS files into single JavaScript/CSS file", (options, done) ->
  invoke2 'compile:release:coffee', options, ->
    invoke2 'compile:release:less', options, done

task2 'minify', "Minify product JavaScript/CSS file", (options, done) ->
  invoke2 'minify:javascript', options, ->
    invoke2 'minify:css', options, done

task2 'compile:coffee', "Compile CoffeeScript files to JavaScript files", (options, done) ->
  compileCoffee(SCRIPT_FILES, SCRIPT_CS_ROOT, SCRIPT_JS_ROOT, options, done)

task2 'compile:coffee:test', "Compile CoffeeScript files to JavaScript files for Unittest", (options, done) ->
  compileCoffee(TEST_FILES, TEST_CS_ROOT, TEST_JS_ROOT, options, done)

task2 'compile:less', "Compile LESS files to CSS files", (options, done) ->
  complete = ->
    if options.watch
      console.log " + Watching file changes..."
    done(options) if done
  # create file list
  fileList = fork.globset(STYLE_FILES, STYLE_LESS_ROOT, '.less')
  return if fileList.length <= 0
  console.log.strong "Compile LESS files to CSS files ..."
  # compile each CoffeeScript to JavaScript
  options.bare = true
  options.encoding = options.encoding or 'utf-8'
  remaining = fileList.length
  for src in fileList then do (src) ->
    base = truncateString(src, lessRoot, '.less')
    dst = cssRoot + base + '.css'
    compile = ->
      fork.compiler.less src, dst, options, ->
        complete() if --remaining is 0
    compile()
    if options.watch
      fs.watchFile src, compile
  return false

task2 'compose:coffee', "Compose CoffeeScript files to a single file", (options, done) ->
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.coffee"
  # create file list
  fileList = fork.globset(SCRIPT_FILES, SCRIPT_CS_ROOT, '.coffee')
  return if fileList.length <= 0
  console.log.strong "Compose CoffeeScript files to a single CoffeeScript file ..."
  # compose to release file
  fork.compose fileList, dst, options.encoding, ->
    console.success "Compose CoffeeScript files to", dst
    done(options) if done
  return false

task2 'compose:less', "Compose LESS files to a single file", (options, done) ->
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.less"
  # create file list
  fileList = fork.globset(STYLE_FILES, STYLE_LESS_ROOT, '.less')
  return if fileList.length <= 0
  console.log.strong "Compose LESS files to a single LESS file ..."
  # compose to release file
  fork.compose fileList, dst, options.encoding, ->
    console.success "Compose LESS files to", dst
    done(options) if done
  return false

task2 'compile:release:coffee', "Compile composed CoffeeScript file to a single JavaScript file", (options, done) ->
  invoke2 'test:lint', options, ->
    invoke2 'compose:coffee', options, ->
      src = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.coffee"
      dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.js"
      if not fork.existsSync src
        done(options) if done
        return
      console.log.strong "Compile composed CoffeeScript file to a single JavaScript files ..."
      # compile
      options.bare = false
      options.encoding = options.encoding or 'utf-8'
      fork.compiler.coffee src, dst, options, ->
        prependHeaderToFile dst, HEADER_JS, options.encoding, ->
          console.success "Add Header to the compiled file ..."
          done(options) if done

task2 'compile:release:less', "Compile composed LESS file to a single CSS file", (options, done) ->
  invoke2 'compose:less', options, ->
    src = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.less"
    dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.css"
    if not fork.existsSync src
      done(options) if done
      return
    console.log.strong "Compile composed LESS file to a single CSS files ..."
    # compile
    options.bare = false
    options.encoding = options.encoding or 'utf-8'
    fork.compiler.less src, dst, options, ->
      prependHeaderToFile dst, HEADER_CSS, options.encoding, ->
        console.success "Add Header to the compiled file ..."
        done(options) if done

task2 'minify:javascript', "Minify product JavaScript file", (options, done) ->
  if YUI_COMPRESSOR
    fork.minify.YUI_COMPRESSOR = YUI_COMPRESSOR
  src = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.js"
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.min.js"
  return if not fork.existsSync(src)
  console.log.strong "Minify product JavaScript file ..."
  # minify
  fork.minify src, dst, (prevSize, currSize) ->
    prevSize = Math.round(prevSize / 100) / 10
    currSize = Math.round(currSize / 100) / 10
    console.success "Minify #{path.basename(src)} to #{dst} (#{prevSize} kb -> #{currSize} kb)"
    prependHeaderToFile dst, HEADER_JS, options.encoding, ->
      console.success "Add Header to the compiled file ..."
      done(options) if done
  return false

task2 'minify:css', "Minify product CSS file", (options, done) ->
  if YUI_COMPRESSOR
    fork.minify.YUI_COMPRESSOR = YUI_COMPRESSOR
  src = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.css"
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.min.css"
  return if not fork.existsSync(src)
  console.log.strong "Minify product CSS file ..."
  # minify
  fork.minify src, dst, (prevSize, currSize) ->
    prevSize = Math.round(prevSize / 100) / 10
    currSize = Math.round(currSize / 100) / 10
    console.success "Minify #{path.basename(src)} to #{dst} (#{prevSize} kb -> #{currSize} kb)"
    prependHeaderToFile dst, HEADER_CSS, options.encoding, ->
      console.success "Add Header to the compiled file ..."
      done(options) if done
  return false

task2 'test:lint', "Lint CoffeeScript files", (options, done) ->
  fileList = fork.globset(SCRIPT_FILES, SCRIPT_CS_ROOT, '.coffee')
  return if fileList.length <= 0
  console.log.strong "Lint CoffeeScript files ..."
  # lint
  fork.coffeelint fileList, COFFEELINT_CONFIG, (code) ->
    if done and (code is 0 or options.force)
      done(options)
    else if done
      console.log.strong "----------------------------------------------------------------------"
      console.error.strong "Fix listed issue(s) above before continue or use `--force` option"
      console.log.strong "----------------------------------------------------------------------"
  return false

task2 'test:mocha', "Unittest CoffeeScript files (mocha)", (options, done) ->
  fileList = fork.globset(TEST_FILES, TEST_CS_ROOT, '.coffee')
  return if fileList.length <= 0
  console.log.strong "Unittest CoffeeScript files with mocha ..."
  # mocha
  fork.mocha fileList, (code) ->
    if done and (code is 0 or options.force)
      done(options)
    else if done
      console.log.strong "----------------------------------------------------------------------"
      console.error.strong "Fix listed issue(s) above before continue or use `--force` option"
      console.log.strong "----------------------------------------------------------------------"
  return false

task2 'test:phantomjs', "Unittest CoffeeScript files (phantomjs)", (options, done) ->
  filename = path.join(TEST_HTML_ROOT, TEST_HTML_FILE)
  return if not fork.existsSync(filename)
  console.log.strong "Unittest CoffeeScript files with phantomjs ..."
  # mocha
  fork.phantomjs filename, (code) ->
    if done and (code is 0 or options.force)
      done(options)
    else if done
      console.log.strong "----------------------------------------------------------------------"
      console.error.strong "Fix listed issue(s) above before continue or use `--force` option"
      console.log.strong "----------------------------------------------------------------------"
  return false
