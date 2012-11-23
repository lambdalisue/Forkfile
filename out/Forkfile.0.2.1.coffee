###
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
###
class Konsole
  @reset: '\x1b[0m'
  @bold: '\x1b[1m'
  @red: '\x1b[31m'
  @green: '\x1b[32m'
  @check: '\u2713'
  @cross: '\u2A2F'

  constructor: ->
    @noColor = false
    @log.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.push Konsole.reset unless @noColor
      @log.apply(@, args)
    @info.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.unshift Konsole.green unless @noColor
      args.push Konsole.reset unless @noColor
      @log.apply(@, args)
    @error.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.unshift Konsole.red unless @noColor
      args.push Konsole.reset unless @noColor
      @warn.apply(@, args)

  log: console.log

  warn: console.warn

  info: (args...) ->
    args.unshift Konsole.green unless @noColor
    args.push Konsole.reset unless @noColor
    @log.apply(@, args)

  error: (args...) ->
    args.unshift Konsole.red unless @noColor
    args.push Konsole.reset unless @noColor
    @warn.apply(@, args)

  success: (args...) ->
    args.unshift Konsole.check
    @info.apply(@, args)

  fail: (args...) ->
    args.unshift Konsole.cross
    @error.apply(@, args)

exports.konsole = konsole = new Konsole

fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn

exports.installRequiredModules = (extraModules) ->
  ###
  Install required node modules
  ###
  installModule = (moduleName) ->
    exports.execFile('npm', ['install', moduleName])
  console.log.strong "Install required node modeles..."
  requiredModules = exports.installRequiredModules.REQUIRED_NODE_MODULES
  requiredModules = requiredModules.concat(extraModules) if extraModules
  for moduleName in requiredModules
    installModule(moduleName)
exports.installRequiredModules.REQUIRED_NODE_MODULES = [
  'underscore',
  'coffee-script',
  'less',
  'glob',
  'mkdirp',
  'coffeelint',
  'coverjs',
  'mocha',
  'expect.js',
  'mocha-phantomjs',
]

exports.exists = fs.exists or path.exists
exports.existsSync = fs.existsSync or path.existsSync

exports.execFile = (file, args, done) ->
  ###
  Execute file and lead stream into stdout/stderr

  Args:
    file - A target executable file
    args - Arguments passed to the file
    done - A callback function called after the execution has done

  Return
    Child process instance
  ###
  proc = spawn(file, args)
  proc.stdout.on 'data', (data) -> process.stdout.write(data)
  proc.stderr.on 'data', (data) -> process.stderr.write(data)
  proc.on('exit', (code) -> done(code)) if done
  return proc

exports.readAllFiles = (files, encoding, done) ->
  ###
  Read all file contents

  Args:
    files - A list of files
    done - A callback function called after all file has read
    encoding - encoding of the file (Default: utf-8)
  ###
  if not done
    done = encoding
    encoding = 'utf-8'
  fileContents = new Array
  remaining = files.length
  for file, index in files then do (file, index) ->
    fs.readFile file, encoding, (err, data) ->
      throw err if err
      fileContents[index] = data
      done(fileContents.join('\n')) if --remaining is 0

exports.compose = (files, dst, encoding, done) ->
  ###
  Compose all files to a single file

  Args:
    files - A list of files
    dst - A target destination file
    done - A callback function called after all file has read
    encoding - encoding of the file (Default: utf-8)
  ###
  exports.readAllFiles files, encoding, (data) ->
    fs.writeFile dst, data, encoding, (err) ->
      throw err if err
      done() if done

exports.makedirs = (dirpath) ->
  ###
  Create non existing directories

  Args:
    dirpath - A directory path

  Require:
    - mkdirp
  ###
  mkdirp = require 'mkdirp'
  if not exports.existsSync(dirpath)
    mkdirp.sync(dirpath)

exports.copyFile = (src, dst, callback) ->
  rstream = fs.createReadStream(src)
  wstream = fs.createWriteStream(dst)
  rstream.pipe(wstream)
  rstream.on 'end', ->
    callback() if callback

exports.globset = (patterns, root, ext) ->
  ###
  Create filename list with glob patterns

  Args:
    patterns - A list of glob pattern
    root - A root directory path

  Return
    filename list

  Patterns:
    If pattern starts with '-' that mean *exclude*

  Require:
    - glob
  ###
  glob = require 'glob'
  underscore = require 'underscore'
  options =
    cwd: root
  filenames = new Array
  for pattern in patterns
    if pattern.lastIndexOf('-', 0) is 0
      # exclude filenames patch with the pattern
      pattern = pattern[1..]
      pattern = pattern + ext if ext
      _filenames = glob.sync(pattern, options)
      filenames = underscore.difference(filenames, _filenames)
    else
      pattern = pattern + ext if ext
      _filenames = glob.sync(pattern, options)
      filenames = filenames.concat(_filenames)
  filenames = underscore.uniq(filenames)
  return underscore.map(filenames, (f) -> path.join(root, f))

compiler = {}
compiler.coffee = (src, dst, options, done) ->
  coffee = require 'coffee-script'
  # if destination directory does not exist, create it
  exports.makedirs(path.dirname(dst))
  # compile CoffeeScript to JavaScript
  fs.readFile src, options.encoding, (err, cs) ->
    if err
      konsole.fail('Failed to read', src)
      konsole.error('  Error:', err.message)
      done(err) if done
      return
    try
      js = coffee.compile(cs, {'bare': options.bare})
    catch err
      konsole.fail('Failed to compile', src)
      konsole.error('  Error:', err.message)
      done(err) if done
      return
    fs.writeFile dst, js, options.encoding, (err) ->
      if err
        konsole.fail('Failed to write', dst)
        konsole.error('  Error:', err.message)
        done(err) if done
        return
      konsole.success('Compile', path.join(src), 'to', dst)
      done() if done

compiler.less = (src, dst, options, done) ->
  less = require 'less'
  # if destination directory does not exist, create it
  exports.makedirs(path.dirname(dst))
  # create LESS parser
  parser = new(less.Parser)
    'paths': [path.dirname(src)]
    'filename': dst
  # compile CoffeeScript to JavaScript
  fs.readFile src, options.encoding, (err, less) ->
    if err
      konsole.fail('Failed to read', src)
      konsole.error('  Error:', err.message)
      done(err) if done
      return
    parser.parse less, (err, tree) ->
      if err
        konsole.fail('Failed to parse', src)
        konsole.error('  Error:', err.message)
        done(err) if done
        return
      cs = tree.toCSS()
      fs.writeFile dst, cs, options.encoding, (err) ->
        if err
          konsole.fail('Failed to write', dst)
          konsole.error('  Error:', err.message)
          done(err) if done
          return
        konsole.success('Compile', path.join(src), 'to', dst)
        done() if done

exports.compiler = compiler

_url = require 'url'
http = require 'http'
https = require 'https'

network = {}
network.createStaticServer = (root) ->
  loadStaticFile = (request, response) ->
    findContentType = (uri) ->
      ext = path.extname(uri)
      for type, contentType of network.createStaticServer.CONTENT_TYPES
        return contentType if type is ext
      return 'text/plain'
    uri = _url.parse(request.url).pathname
    uri = if uri is '/' then 'index.html' else uri
    filename = path.join(root, uri)
    exports.exists filename, (exists) ->
      if not exists
        if uri is '/favicon.ico'
          console.warn('404', 'Not found', uri)
        response.writeHead(404, {'Content-Type': 'text/plain'})
        response.write("404 Not found\n#{filename}\n")
        response.end()
        return
      fs.readFile filename, 'binary', (err, contents) ->
        if err
          console.error('500', 'Server error', uri)
          response.writeHead(500, {'Content-Type': 'text/plain'})
          response.write("#{err}\n#{filename}\n")
          response.end()
          return
        console.info('200', 'OK', uri)
        response.writeHead(200, {'Content-Type': findContentType(uri)})
        response.write(contents, 'binary')
        response.end()
  return http.createServer(loadStaticFile)
network.createStaticServer.CONTENT_TYPES =
  '.html': 'text/html'
  '.js': 'text/javascript'
  '.css': 'text/css'
  '.jpg': 'image/jpeg'
  '.jpeg': 'image/jpeg'
  '.png': 'image/png'
  '.gif': 'image/gif'


network.download = (url, filename, done) ->
  url = _url.parse(url)
  if url.href.lastIndexOf('https', 0) is 0
    protocol = https
  else
    protocol = http
  protocol.get url, (response) ->
    if response.statusCode is 200
      buffer = []
      response.setEncoding 'binary'
      response.on 'data', (chunk) ->
        buffer.push chunk
      response.on 'end', ->
        fs.writeFile filename, buffer.join(''), 'binary', (err) ->
          throw err if err
          done() if done


exports.network = network

###
Task2

An improvement script of Cake `task` and `invoke` to enable callback function
Ref: http://coffeescript.org/documentation/docs/cake.html

Usage:

  # `cake task2` command will call task1 and task2 in order so
  # the output will be like
  #
  #   $ cake task2
  #   `hello.txt` was created
  #   HELLO
  #
  task2 'task1', 'task1 description', (options, done) ->
    fs.writeFile 'hello.txt', 'HELLO', (err) ->
      throw err if err
      console.log "`hello.txt` was created"
      done(options) if done
    # returning `false` mean you will call `done` with your responsibility
    return false

  task2 'task2', 'task2 description', (options, done) ->
    invoke2 'task1', options, ->
      fs.readFile 'hello.txt', (err, data) ->
        throw err if err
        console.log data
        done(options) if done
    # returning `false` mean you will call `done` with your responsibility
    return false

  task2 'task3', 'task3 description', (options, done) ->
    console.log "Hello3"

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
###
fatalError = (message) ->
  console.error(message + '\n')
  console.log('To see a list of all tasks/options, run "cake"')
  process.exit(1)

missingTask = (task) -> fatalError "No such task: #{task}"

decorateCallback = (fn) ->
  return (options, done) ->
    result = fn(options, done)
    done(options) if done and result isnt false
    return result

task2 = (name, description, action) ->
  # register in Cake task as well
  task name, description, action
  # decorate action
  daction = decorateCallback(action)
  # register in Task2
  task2.tasks[name] = {name, description, 'action': daction}
task2.tasks = {}

invoke2 = (name, options, callback) ->
  missingTask(name) unless task2.tasks[name]
  task2.tasks[name].action options, callback
  # calling invoke2 trigger to have responsibility to call `done(options)`
  return false

exports.task2 = global.task2 = task2
exports.invoke2 = global.invoke2 = invoke2

test = {}
test.TEMPLATE_FILENAME = "test.html.template"

test.loadTemplate = (root, javascripts, stylesheets, encoding='utf-8', done) ->
  underscore = require 'underscore'
  compileTemplate = (templateFile) ->
    fs.readFile templateFile, encoding, (err, data) ->
      template = underscore.template(data)
      done template({javascripts, stylesheets})
  templateFile = path.join(root, test.TEMPLATE_FILENAME)
  if not exports.existsSync(templateFile)
    # create default template file
    test.downloadTemplate root, ->
      compileTemplate(templateFile)
  else
    compileTemplate(templateFile)

test.downloadTemplate = (root, done) ->
  templateFile = path.join(root, test.TEMPLATE_FILENAME)
  exports.network.download(
    test.downloadTemplate.TEMPLATE_URL, templateFile, done
  )
test.downloadTemplate.TEMPLATE_URL =
  "https://raw.github.com/gist/4128967/test.html.template"

test.downloadVenders = (root, extras, done) ->
  underscore = require 'underscore'
  venders = test.downloadVenders.VENDERS
  venders = underscore.extend(venders, extras) if extras
  # Download files
  remaining = venders.length
  for filename, url of venders then do (filename, url) ->
    filename = path.join(root, filename)
    exports.network.download url, filename, ->
      konsole.success 'Download', url
      done() if done and --remaining is 0
test.downloadVenders.VENDERS =
  'jquery.min.js': 'http://code.jquery.com/jquery.min.js'
  'mocha.js': 'https://raw.github.com/visionmedia/mocha/master/mocha.js'
  'mocha.css': 'https://raw.github.com/visionmedia/mocha/master/mocha.css'
  'expect.js': 'https://raw.github.com/LearnBoost/expect.js/master/expect.js'
  'underscore-min.js': 'http://underscorejs.org/underscore-min.js'
  'backbone-min.js': 'http://backbonejs.org/backbone-min.js'
  'reporter.js':
    'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.js'
  'reporter.css':
    'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.css'
  'JSCovReporter.js':
    'https://raw.github.com/TwoApart/JSCovReporter/master/JSCovReporter.js'

exports.test = test

exec = require('child_process').exec
exports.minify = (src, dst, done) ->
  prevStat = fs.statSync(src)
  args = ['-jar', exports.minify.YUI_COMPRESSOR, src, '-o', dst]
  exec 'java ' + args.join(' '), (err, stdout, stderr) ->
    throw err if err
    console.log(stdout) if stdout
    console.warn(stderr) if stderr
    currStat = fs.statSync(dst)
    done(prevStat.size, currStat.size) if done
exports.minify.YUI_COMPRESSOR = '~/.yuicompressor/build/yuicompressor.jar'

exports.coffeelint = (files, config, done) ->
  if config
    args = ['-f', config].concat(files)
  else
    args = files
  coffeelint = exports.execFile(exports.coffeelint.COFFEELINT, args)
  coffeelint.on('exit', (code) -> done(code) if done)
exports.coffeelint.COFFEELINT = './node_modules/coffeelint/bin/coffeelint'

exports.mocha = (files, reporter, done) ->
  args = [
    '--reporter', reporter or 'spec',
    '--compilers', 'coffee:coffee-script'
  ].concat(files)
  mocha = exports.execFile(exports.mocha.MOCHA, args)
  mocha.on('exit', (code) -> done(code) if done)
exports.mocha.MOCHA = './node_modules/mocha/bin/mocha'

exports.phantomjs = (file, reporter, done) ->
  args = ['--reporter', reporter or 'spec', file]
  phantomjs = exports.execFile(exports.phantomjs.PHANTOMJS, args)
  phantomjs.on('exit', (code) -> done(code) if done)
exports.phantomjs.PHANTOMJS =
  './node_modules/mocha-phantomjs/bin/mocha-phantomjs'

exports.coverjs = (files, dst, done) ->
  args = ['--recursive'].concat(files).concat(['--output', dst])
  coverjs = exports.execFile(exports.coverjs.COVERJS, args)
  coverjs.on('exit', (code) -> done(code) if done)
exports.coverjs.COVERJS =
  './node_modules/coverjs/bin/cover.js'
