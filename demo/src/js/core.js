var fs, path, spawn;

fs = require('fs');

path = require('path');

spawn = require('child_process').spawn;

exports.installRequiredModules = function(extraModules) {
  /*
    Install required node modules
  */

  var installModule, moduleName, requiredModules, _i, _len, _results;
  installModule = function(moduleName) {
    return exports.execFile('npm', ['install', moduleName]);
  };
  console.log.strong("Install required node modeles...");
  requiredModules = exports.installRequiredModules.REQUIRED_NODE_MODULES;
  if (extraModules) {
    requiredModules = requiredModules.concat(extraModules);
  }
  _results = [];
  for (_i = 0, _len = requiredModules.length; _i < _len; _i++) {
    moduleName = requiredModules[_i];
    _results.push(installModule(moduleName));
  }
  return _results;
};

exports.installRequiredModules.REQUIRED_NODE_MODULES = ['underscore', 'coffee-script', 'less', 'glob', 'mkdirp', 'coffeelint', 'coverjs', 'mocha', 'expect.js', 'mocha-phantomjs'];

exports.exists = fs.exists || path.exists;

exports.existsSync = fs.existsSync || path.existsSync;

exports.execFile = function(file, args, done) {
  /*
    Execute file and lead stream into stdout/stderr
  
    Args:
      file - A target executable file
      args - Arguments passed to the file
      done - A callback function called after the execution has done
  
    Return
      Child process instance
  */

  var proc;
  proc = spawn(file, args);
  proc.stdout.on('data', function(data) {
    return process.stdout.write(data);
  });
  proc.stderr.on('data', function(data) {
    return process.stderr.write(data);
  });
  if (done) {
    proc.on('exit', function(code) {
      return done(code);
    });
  }
  return proc;
};

exports.readAllFiles = function(files, encoding, done) {
  /*
    Read all file contents
  
    Args:
      files - A list of files
      done - A callback function called after all file has read
      encoding - encoding of the file (Default: utf-8)
  */

  var file, fileContents, index, remaining, _i, _len, _results;
  if (!done) {
    done = encoding;
    encoding = 'utf-8';
  }
  fileContents = new Array;
  remaining = files.length;
  _results = [];
  for (index = _i = 0, _len = files.length; _i < _len; index = ++_i) {
    file = files[index];
    _results.push((function(file, index) {
      return fs.readFile(file, encoding, function(err, data) {
        if (err) {
          throw err;
        }
        fileContents[index] = data;
        if (--remaining === 0) {
          return done(fileContents.join('\n'));
        }
      });
    })(file, index));
  }
  return _results;
};

exports.compose = function(files, dst, encoding, done) {
  /*
    Compose all files to a single file
  
    Args:
      files - A list of files
      dst - A target destination file
      done - A callback function called after all file has read
      encoding - encoding of the file (Default: utf-8)
  */
  return exports.readAllFiles(files, encoding, function(data) {
    return fs.writeFile(dst, data, encoding, function(err) {
      if (err) {
        throw err;
      }
      if (done) {
        return done();
      }
    });
  });
};

exports.makedirs = function(dirpath) {
  /*
    Create non existing directories
  
    Args:
      dirpath - A directory path
  
    Require:
      - mkdirp
  */

  var mkdirp;
  mkdirp = require('mkdirp');
  if (!exports.existsSync(dirpath)) {
    return mkdirp.sync(dirpath);
  }
};

exports.copyFile = function(src, dst, callback) {
  var rstream, wstream;
  rstream = fs.createReadStream(src);
  wstream = fs.createWriteStream(dst);
  rstream.pipe(wstream);
  return rstream.on('end', function() {
    if (callback) {
      return callback();
    }
  });
};

exports.globset = function(patterns, root, ext) {
  /*
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
  */

  var filenames, glob, options, pattern, underscore, _filenames, _i, _len;
  glob = require('glob');
  underscore = require('underscore');
  options = {
    cwd: root
  };
  filenames = new Array;
  for (_i = 0, _len = patterns.length; _i < _len; _i++) {
    pattern = patterns[_i];
    if (pattern.lastIndexOf('-', 0) === 0) {
      pattern = pattern.slice(1);
      if (ext) {
        pattern = pattern + ext;
      }
      _filenames = glob.sync(pattern, options);
      filenames = underscore.difference(filenames, _filenames);
    } else {
      if (ext) {
        pattern = pattern + ext;
      }
      _filenames = glob.sync(pattern, options);
      filenames = filenames.concat(_filenames);
    }
  }
  filenames = underscore.uniq(filenames);
  return underscore.map(filenames, function(f) {
    return path.join(root, f);
  });
};
