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
