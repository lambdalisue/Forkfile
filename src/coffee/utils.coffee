fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn

exports.exists = ->
  # `exists` may moved from `path` to `fs` from node.js ver 0.8.4
  if fs.exists?
    return fs.exists.apply(fs, arguments)
  else
    return path.exists.apply(path, arguments)

exports.existsSync = ->
  # `existsSync` may moved from `path` to `fs` from node.js ver 0.8.4
  if fs.existsSync?
    return fs.existsSync.apply(fs, arguments)
  else
    return path.existsSync.apply(path, arguments)

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


exports.globset = (patterns, root) ->
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
    root: root
  filenames = new Array
  for pattern in patterns
    if pattern.lastIndexOf('-', 0) is 0
      # exclude filenames patch with the pattern
      _filenames = glob.sync(pattern[1..], options)
      filenames = underscore.difference(filenames, _filenames)
    else
      _filenames = glob.sync(pattern, options)
      filenames = filenames.concat(_filenames)
  return filenames
