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

Author:   lambdalisue
License:  MIT License

Copyright (c) lambdalisue, hashnote.net all right reserved.
###
NAME                    = 'Forkfile'
VERSION                 = '0.0.1'
RELEASE_ROOT            = 'build'
# Demo
DEMO_ROOT               = 'demo'
DEMO_SERVER             = '0.0.0.0'
DEMO_PORT               = '8000'
# Source Code
SRC_ROOT                = 'src'
SRC_CS                  = 'coffee'
SRC_JS                  = 'js'
SRC_FILES               = [
  'konsole.coffee',
  'utils.coffee',
  '**/*.coffee'
]
# Libraries
LIB_ROOT                = 'lib'
LIB_FILES               = ['**/*.js']
# Test Code
TEST_ROOT               = 'test'
TEST_CS                 = 'coffee'
TEST_JS                 = 'js'
TEST_FILES              = ['**/*.coffee']
# Style
STYLE_ROOT              = 'style'
STYLE_LESS              = 'less'
STYLE_CSS               = 'css'
STYLE_FILES             = ['**/*.less']
# Coverage
COV_ROOT                = 'cov'
COV_FILES               = ['**/*.js']
COV_OUTPUT              = 'coverage.html'

HEADER_JS = """
/**
 * #{NAME} #{VERSION}
 *
 * Author:  lambdalisue
 * URL:     http://hashnote.net/
 * License: MIT License
 * 
 * Copyright (C) 2012 lambdalisue, hashnote.net allright reserved.
 */
"""
HEADER_CSS = HEADER_JS
COFFEELINT_CONFIG_FILE  = 'config/coffeelint.json'
REQUIRED_MODULES = [
  'growl',
]
###########################################################################
fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn
fork = require './Forkfile'

option '-e', '--encoding', 'Encoding used for read/write a file'
option '-w', '--watch', 'Continuously execute action'
option '-v', '--verbose [VERBOSE]', 'set the logging level'
option '-o', '--optimize', 'remove DEBUG code block before compile'

# Use Konsole as Console
console = fork.konsole

makeFileList = (root, src, patterns) ->
  underscore = require 'underscore'
  src = path.join(root, src)
  filenames = fork.globset(patterns, src)
  return underscore.map(filenames, (filename) -> path.join(src, filename))

makeFilePairList = (root, src, dst, ext, patterns) ->
  underscore = require 'underscore'
  src = path.join(root, src)
  dst = path.join(root, dst)
  filenames = fork.globset(patterns, src)
  return underscore.map(filenames, (filename) ->
    dirname = path.dirname(filename)
    basename = path.basename(filename, path.extname(filename))
    srcFile = path.join(src, filename)
    dstFile = path.join(dst, dirname, basename + ext)
    return [srcFile, dstFile]
  )

notify = ->
  # Notify with Growl
  try
    growl = require 'growl'
    growl.apply(arguments)
  catch e
    # Fail silently
    return

task 'install', 'Install required node modules', ->
  fork.installRequiredModules(REQUIRED_MODULES)

task 'clean', 'Clean up generated files', ->
  fork.execFile('rm', ['-rf', path.join(SRC_ROOT, SRC_JS)])
  fork.execFile('rm', ['-rf', path.join(TEST_ROOT, TEST_JS)])
  fork.execFile('rm', ['-rf', path.join(STYLE_ROOT, STYLE_CSS)])
  fork.execFile('rm', ['-rf', COV_ROOT])
  fork.execFile('rm', ['-rf', COV_OUTPUT])

task 'demo', "Start Demo server at #{DEMO_SERVER}:#{DEMO_PORT}", ->
  console.title "Start demo server at #{DEMO_SERVER}:#{DEMO_PORT}..."
  server = fork.createStaticServer(DEMO_ROOT_PATH)
  server.listen(DEMO_PORT, DEMO_SERVER)

task 'develop', 'Start developping mode (Watch file changes and compile)', (options) ->
  options.watch = true
  invoke 'lint'
  invoke 'compile:coffee'
  invoke 'compile:coffee:test'
  invoke 'compile:less'
  invoke 'coverjs'
  invoke 'mocha'

task 'release', 'Release the product (Compile as release mode and minify)', (options) ->
  options.watch = false
  invoke 'lint'
  invoke 'compile:coffee'
  invoke 'compile:coffee:test'
  invoke 'coverjs'
  invoke 'mocha'
  invoke 'compile:coffee:release'
  invoke 'compile:less:release'
  invoke 'minify:javascript'
  invoke 'minify:css'

task 'compile:coffee', "Compile CoffeeScript files to JavaScript files", (options) ->
  console.title "Compile CoffeeScript files to JavaScript files ..."
  compile = (src, dst) ->
    try
      fork.coffee(src, dst, options)
      console.success "Compile", path.basename(src), "->", dst
    catch e
      console.fail "Compile", path.basename(src), "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  options.bare = true
  filePairList = makeFilePairList(SRC_ROOT, SRC_CS, SRC_JS, '.js', SRC_FILES)
  for filePair in filePairList then do (filePair) ->
    [src, dst] = filePair
    compile(src, dst)
    if options.watch
      fs.watchFile(src, -> compile(src, dst))

task 'compile:coffee:test', "Compile CoffeeScript files to JavaScript files for Unittest", (options) ->
  console.title "Compile CoffeeScript files to JavaScript files for Unittest ..."
  compile = (src, dst) ->
    try
      fork.coffee src, dst, options, ->
        console.success "Compile", path.basename(src), "->", dst
    catch e
      console.fail "Compile", path.basename(src), "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  options.bare = true
  filePairList = makeFilePairList(TEST_ROOT, TEST_CS, TEST_JS, '.js', TEST_FILES)
  for filePair in filePairList then do (filePair) ->
    [src, dst] = filePair
    compile(src, dst)
    if options.watch
      fs.watchFile(src, -> compile(src, dst))

task 'compile:coffee:release', "Compile CoffeeScript files to a single JavaScript file", (options) ->
  console.title "Compile CoffeeScript files to a single JavaScript file..."
  compose = (src) ->
    fileList = makeFileList(LIB_ROOT, '', LIB_FILES)
    fileList.push src
    libContents = fork.readAllFiles fileList, (libContents) ->
      # write all with header
      contents = [HEADER_JS]
      contents = contents.concat(libContents)
      fs.writeFile src, contents.join("\n"), (err) ->
        throw err if err
        console.success "Compose with Libraries"
  compile = (srcs, dst) ->
    try
      fork.coffee srcs, dst, options, ->
        console.success "Compile to", dst
        compose(dst)
    catch e
      console.fail "Compile", "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{dst}`\n\n#{e.message}", {'title': "Cakefile"});
  options.bare = false
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.js"
  fileList = makeFileList(SRC_ROOT, SRC_CS, SRC_FILES)
  compile(fileList, dst)

task 'compile:less', "Compile LESS files to CSS files", (options) ->
  console.title "Compile LESS files to CSS files ..."
  compile = (src, dst) ->
    try
      fork.less src, dst, options, ->
        console.success "Compile", path.basename(src), "->", dst
    catch e
      console.fail "Compile", path.basename(src), "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  filePairList = makeFilePairList(STYLE_ROOT, STYLE_LESS, STYLE_CSS, '.css', STYLE_FILES)
  for filePair in filePairList then do (filePair) ->
    [src, dst] = filePair
    compile(src, dst)
    if options.watch
      fs.watchFile(src, -> compile(src, dst))

task 'compile:less:release', "Compile LESS files to a single CSS file", (options) ->
  console.title "Compile LESS files to a single CSS file ..."
  compile = (src, dst) ->
    try
      fork.less src, dst, options, ->
        console.success "Compile", "->", dst
    catch e
      console.fail "Compile", "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.css"
  fileList = makeFileList(STYLE_ROOT, STYLE_LESS, STYLE_FILES)
  compile(fileList, dst)

task 'lint', 'Analyse CoffeeScript files via coffeelint', ->
  console.title "Analyse CoffeeScript files via coffeelint ..."
  compile = (src, dst) ->
  # Source Codes
  fileList = makeFileList(SRC_ROOT, SRC_CS, SRC_FILES)
  # Test Codes
  fileList = fileList.concat(makeFileList(TEST_ROOT, TEST_CS, TEST_FILES))
  # call lint
  fork.coffeelint(fileList, COFFEELINT_CONFIG_FILE)

task 'mocha', 'Test CoffeeScript files via mocha', ->
  # Compile files before
  invoke 'compile:coffee'
  invoke 'compile:coffee:test'

  console.title "Test CoffeeScript files via mocha ..."
  # Find test files
  fileList = makeFileList(TEST_ROOT, TEST_CS, TEST_FILES)
  if not fileList or fileList.length is 0
    console.error 'No test files exists'
  fork.mocha(fileList)

task 'coverjs', 'Make instrument files of each JavaScript files via coverjs', ->
  # Compile files before
  invoke 'compile:coffee'

  console.title "Make instrument files of each JavaScript files via coverjs"
  # Create coverage files
  fileList = makeFileList(SRC_ROOT, SRC_JS, COV_FILES)
  fork.coverjs(fileList, COV_ROOT)

task 'minify:javascript', "Minify #{NAME}.#{VERSION}.js to #{NAME}.#{VERSION}.min.js", ->
  basename = "#{NAME}.#{VERSION}"
  src = "#{RELEASE_ROOT}/#{basename}.js"
  dst = "#{RELEASE_ROOT}/#{basename}.min.js"

  console.title "Minify #{NAME}.#{VERSION}.js to #{NAME}.#{VERSION}.min.js ..."
  fork.minify(src, dst)

task 'minify:css', "Minify #{NAME}.#{VERSION}.css to #{NAME}.#{VERSION}.min.css", ->
  basename = "#{NAME}.#{VERSION}"
  src = "#{RELEASE_ROOT}/#{basename}.css"
  dst = "#{RELEASE_ROOT}/#{basename}.min.css"

  console.title "Minify #{NAME}.#{VERSION}.css to #{NAME}.#{VERSION}.min.css ..."
  fork.minify(src, dst)
