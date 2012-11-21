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
VERSION                 = '0.1.1'
RELEASE_ROOT            = 'build'
# Demo
DEMO_ROOT               = 'demo'
DEMO_SERVER             = '0.0.0.0'
DEMO_PORT               = '8000'
DEMO_TEST_FILENAME      = 'test.html'
DEMO_TEST_VENDER_ROOT   = 'vender'
DEMO_TEST_EXTRA_VENDERS = null
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
LIB_JS                  = 'js'
LIB_CSS                 = 'css'
LIB_JS_FILES            = ['**/*.js']
LIB_CSS_FILES           = ['**/*.css']
# Test Code
TEST_ROOT               = 'test'
TEST_CS                 = 'coffee'
TEST_JS                 = 'js'
TEST_FILES              = ['**/*.spec.coffee']
# Style
STYLE_ROOT              = 'style'
STYLE_LESS              = 'less'
STYLE_CSS               = 'css'
STYLE_FILES             = ['**/*.less']
# Coverage
COV_ROOT                = null
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
COFFEELINT_CONFIG_FILE  = null
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
option '-f', '--force', 'Force to execute action'

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
  server = fork.createStaticServer(DEMO_ROOT)
  server.listen(DEMO_PORT, DEMO_SERVER)


task 'develop', 'Start developping mode (Watch file changes and compile)', (options) ->
  options.watch = true
  invoke 'lint' if SRC_ROOT or TEST_ROOT
  invoke 'build:develop'
  invoke 'coverjs' if COV_ROOT
  invoke 'mocha' if TEST_ROOT


task 'build:develop', 'Compile CoffeeScript/LESS files into JavaScript/CSS files', (options) ->
  invoke 'compile:coffee' if SRC_ROOT
  invoke 'compile:coffee:test' if TEST_ROOT
  invoke 'compile:less' if STYLE_ROOT


task 'build:release', 'Compile CoffeeScript/LESS files into a single JavaScript/CSS file', (options) ->
  invoke 'compile:coffee:release' if SRC_ROOT
  invoke 'compile:less:release' if STYLE_ROOT
  invoke 'minify:javascript'
  invoke 'minify:css'


task 'release', 'Release the product (Compile as release mode and minify)', (options) ->
  options.watch = false
  invoke 'lint'
  invoke 'build:release'


task 'compile:coffee', "Compile CoffeeScript files to JavaScript files", (options) ->
  console.title "Compile CoffeeScript files to JavaScript files ..."
  compile = (src, dst) ->
    try
      fork.coffee src, dst, options, ->
        console.success "Compile", path.basename(src), "->", dst
    catch e
      console.fail "Compile", path.basename(src), "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  options.bare = true
  filePairList = makeFilePairList(SRC_ROOT, SRC_CS, SRC_JS, '.js', SRC_FILES)
  if filePairList.length > 0
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
  options.bare = false
  filePairList = makeFilePairList(TEST_ROOT, TEST_CS, TEST_JS, '.js', TEST_FILES)
  if filePairList.length > 0
    for filePair in filePairList then do (filePair) ->
      [src, dst] = filePair
      compile(src, dst)
      if options.watch
        fs.watchFile(src, -> compile(src, dst))


task 'compile:coffee:release', "Compile CoffeeScript files to a single JavaScript file", (options) ->
  console.title "Compile CoffeeScript files to a single JavaScript file..."
  compose = (src) ->
    fileList = makeFileList(LIB_ROOT, LIB_JS, LIB_JS_FILES)
    fileList.push src
    libContents = fork.readAllFiles fileList, (libContents) ->
      # write all with header
      contents = [HEADER_JS]
      contents = contents.concat(libContents)
      fs.writeFile src, contents.join("\n"), (err) ->
        throw err if err
        console.success "The file has composed with header and extras"
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
  compile(fileList, dst) if fileList.length > 0


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
  if filePairList.length > 0
    for filePair in filePairList then do (filePair) ->
      [src, dst] = filePair
      compile(src, dst)
      if options.watch
        fs.watchFile(src, -> compile(src, dst))


task 'compile:less:release', "Compile LESS files to a single CSS file", (options) ->
  console.title "Compile LESS files to a single CSS file ..."
  compose = (src) ->
    fileList = makeFileList(LIB_ROOT, LIB_CSS, LIB_CSS_FILES)
    fileList.push src
    libContents = fork.readAllFiles fileList, (libContents) ->
      # write all with header
      contents = [HEADER_CSS]
      contents = contents.concat(libContents)
      fs.writeFile src, contents.join("\n"), (err) ->
        throw err if err
        console.success "The file has compose with header and extras"
  compile = (src, dst) ->
    try
      fork.less src, dst, options, ->
        console.success "Compile", "->", dst
        compose(dst)
    catch e
      console.fail "Compile", "->", dst
      console.error("  Error:", e.message)
      notify("Failed to compile `#{src}`\n\n#{e.message}", {'title': "Cakefile"});
  dst = "#{RELEASE_ROOT}/#{NAME}.#{VERSION}.css"
  fileList = makeFileList(STYLE_ROOT, STYLE_LESS, STYLE_FILES)
  compile(fileList, dst) if fileList.length > 0


task 'lint', 'Analyse CoffeeScript files via coffeelint', ->
  console.title "Analyse CoffeeScript files via coffeelint ..."
  compile = (src, dst) ->
  # Source Codes
  fileList = makeFileList(SRC_ROOT, SRC_CS, SRC_FILES)
  # Test Codes
  fileList = fileList.concat(makeFileList(TEST_ROOT, TEST_CS, TEST_FILES))
  # call lint
  fork.coffeelint(fileList, COFFEELINT_CONFIG_FILE) if fileList.length > 0


task 'test:mocha', 'Run tests of CoffeeScript files via mocha', ->
  # Compile files before
  invoke 'compile:coffee'
  invoke 'compile:coffee:test'

  console.title "Test CoffeeScript files via mocha ..."
  # Find test files
  fileList = makeFileList(TEST_ROOT, TEST_CS, TEST_FILES)
  fork.mocha(fileList) if fileList.length > 0


task 'test:html', 'Create HTML in Demo directory for running unittest in browser', (options) ->
  underscore = require 'underscore'
  # compile CoffeeScript/LESS
  invoke 'compile:coffee'
  invoke 'compile:coffee:test'
  invoke 'compile:less'
  # create instrumented js
  invoke 'coverjs'
  console.title "Create unittest page in demo directory..."
  fork.makedirs(DEMO_ROOT)
  # create javascript list
  SRC_JS_FILES = underscore.map(SRC_FILES, (pattern) -> pattern.replace('.coffee', '.js'))
  TEST_JS_FILES = underscore.map(TEST_FILES, (pattern) -> pattern.replace('.coffee', '.js'))
  javascripts = []
  javascripts = javascripts.concat(makeFileList(LIB_ROOT, LIB_JS, LIB_JS_FILES))
  javascripts = javascripts.concat(makeFileList(SRC_ROOT, SRC_JS, SRC_JS_FILES))
  javascripts = javascripts.concat(makeFileList(COV_ROOT, '', COV_FILES))
  javascripts = javascripts.concat(makeFileList(TEST_ROOT, TEST_JS, TEST_JS_FILES))
  # create stylesheet list
  STYLE_CSS_FILES = underscore.map(STYLE_FILES, (pattern) -> pattern.replace('.less', '.css'))
  stylesheets = []
  stylesheets = stylesheets.concat(makeFileList(LIB_ROOT, LIB_CSS, LIB_CSS_FILES))
  stylesheets = stylesheets.concat(makeFileList(STYLE_ROOT, STYLE_CSS, STYLE_CSS_FILES))
  # load template
  template = fork.loadTemplate(DEMO_ROOT, javascripts, stylesheets, options.encoding)
  # create `test.html`
  fs.writeFileSync(path.join(DEMO_ROOT, DEMO_TEST_FILENAME), template, options.encoding)
  # download venders if required
  venderPath = path.join(DEMO_ROOT, DEMO_TEST_VENDER_ROOT)
  if options.force or not fork.existsSync(venderPath)
    fork.makedirs(venderPath)
    fork.downloadVenders(venderPath, DEMO_TEST_EXTRA_VENDERS)
  # copy compiled files into DEMO_ROOT
  fork.makedirs(path.join(DEMO_ROOT, SRC_ROOT))
  fork.makedirs(path.join(DEMO_ROOT, TEST_ROOT))
  fork.execFile("cp", ['-rf', path.join(SRC_ROOT, SRC_JS), path.join(DEMO_ROOT, SRC_ROOT, SRC_JS)])
  fork.execFile("cp", ['-rf', path.join(TEST_ROOT, TEST_JS), path.join(DEMO_ROOT, TEST_ROOT, TEST_JS)])
  fork.execFile("cp", ['-rf', path.join(COV_ROOT, ''), path.join(DEMO_ROOT, COV_ROOT)])


task 'coverjs', 'Make instrument files of each JavaScript files via coverjs', ->
  # Compile files before
  invoke 'compile:coffee'

  console.title "Make instrument files of each JavaScript files via coverjs"
  # Create coverage files
  fileList = makeFileList(SRC_ROOT, SRC_JS, COV_FILES)
  fork.coverjs(fileList, COV_ROOT) if fileList.length > 0


task 'minify:javascript', "Minify #{NAME}.#{VERSION}.js to #{NAME}.#{VERSION}.min.js", (options) ->
  basename = "#{NAME}.#{VERSION}"
  src = "#{RELEASE_ROOT}/#{basename}.js"
  dst = "#{RELEASE_ROOT}/#{basename}.min.js"
  path.exists src, (exists) ->
    if exists
      console.title "Minify #{NAME}.#{VERSION}.js to #{NAME}.#{VERSION}.min.js ..."
      fork.minify src, dst, ->
        console.success "The file has minified"
        # Add Header
        fs.readFile dst, options.encoding, (err, data) ->
          throw err if err
          contents = [HEADER_JS, data]
          fs.writeFile dst, contents.join("\n"), (err) ->
            throw err if err
            console.success "The file has compose with Header"


task 'minify:css', "Minify #{NAME}.#{VERSION}.css to #{NAME}.#{VERSION}.min.css", ->
  basename = "#{NAME}.#{VERSION}"
  src = "#{RELEASE_ROOT}/#{basename}.css"
  dst = "#{RELEASE_ROOT}/#{basename}.min.css"
  path.exists src, (exists) ->
    if exists
      console.title "Minify #{NAME}.#{VERSION}.css to #{NAME}.#{VERSION}.min.css ..."
      fork.minify src, dst, ->
        console.success "The file has minified"
        # Add Header
        fs.readFile dst, options.encoding, (err, data) ->
          throw err if err
          contents = [HEADER_JS, data]
          fs.writeFile dst, contents.join("\n"), (err) ->
            throw err if err
            console.success "The file has compose with Header"
