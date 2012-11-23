/**
 * Forkfile 0.2.1
 *
 * Author:  lambdalisue
 * URL:     http://hashnote.net/
 * License: MIT License
 *
 * Copyright (C) 2012 lambdalisue, hashnote.net all right reserved.
 */

/*
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
*/


(function() {
  var Konsole, compiler, decorateCallback, exec, fatalError, fs, http, https, invoke2, konsole, missingTask, network, path, spawn, task2, test, _url,
    __slice = [].slice;

  Konsole = (function() {

    Konsole.reset = '\x1b[0m';

    Konsole.bold = '\x1b[1m';

    Konsole.red = '\x1b[31m';

    Konsole.green = '\x1b[32m';

    Konsole.check = '\u2713';

    Konsole.cross = '\u2A2F';

    function Konsole() {
      var _this = this;
      this.noColor = false;
      this.log.strong = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!_this.noColor) {
          args.unshift(Konsole.bold);
        }
        if (!_this.noColor) {
          args.push(Konsole.reset);
        }
        return _this.log.apply(_this, args);
      };
      this.info.strong = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!_this.noColor) {
          args.unshift(Konsole.bold);
        }
        if (!_this.noColor) {
          args.unshift(Konsole.green);
        }
        if (!_this.noColor) {
          args.push(Konsole.reset);
        }
        return _this.log.apply(_this, args);
      };
      this.error.strong = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!_this.noColor) {
          args.unshift(Konsole.bold);
        }
        if (!_this.noColor) {
          args.unshift(Konsole.red);
        }
        if (!_this.noColor) {
          args.push(Konsole.reset);
        }
        return _this.warn.apply(_this, args);
      };
    }

    Konsole.prototype.log = console.log;

    Konsole.prototype.warn = console.warn;

    Konsole.prototype.info = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.noColor) {
        args.unshift(Konsole.green);
      }
      if (!this.noColor) {
        args.push(Konsole.reset);
      }
      return this.log.apply(this, args);
    };

    Konsole.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.noColor) {
        args.unshift(Konsole.red);
      }
      if (!this.noColor) {
        args.push(Konsole.reset);
      }
      return this.warn.apply(this, args);
    };

    Konsole.prototype.success = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.check);
      return this.info.apply(this, args);
    };

    Konsole.prototype.fail = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.cross);
      return this.error.apply(this, args);
    };

    return Konsole;

  })();

  exports.konsole = konsole = new Konsole;

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

  compiler = {};

  compiler.coffee = function(src, dst, options, done) {
    var coffee;
    coffee = require('coffee-script');
    exports.makedirs(path.dirname(dst));
    return fs.readFile(src, options.encoding, function(err, cs) {
      var js;
      if (err) {
        konsole.fail('Failed to read', src);
        konsole.error('  Error:', err.message);
        if (done) {
          done(err);
        }
        return;
      }
      try {
        js = coffee.compile(cs, {
          'bare': options.bare
        });
      } catch (err) {
        konsole.fail('Failed to compile', src);
        konsole.error('  Error:', err.message);
        if (done) {
          done(err);
        }
        return;
      }
      return fs.writeFile(dst, js, options.encoding, function(err) {
        if (err) {
          konsole.fail('Failed to write', dst);
          konsole.error('  Error:', err.message);
          if (done) {
            done(err);
          }
          return;
        }
        konsole.success('Compile', path.join(src), 'to', dst);
        if (done) {
          return done();
        }
      });
    });
  };

  compiler.less = function(src, dst, options, done) {
    var less, parser;
    less = require('less');
    exports.makedirs(path.dirname(dst));
    parser = new less.Parser({
      'paths': [path.dirname(src)],
      'filename': dst
    });
    return fs.readFile(src, options.encoding, function(err, less) {
      if (err) {
        konsole.fail('Failed to read', src);
        konsole.error('  Error:', err.message);
        if (done) {
          done(err);
        }
        return;
      }
      return parser.parse(less, function(err, tree) {
        var cs;
        if (err) {
          konsole.fail('Failed to parse', src);
          konsole.error('  Error:', err.message);
          if (done) {
            done(err);
          }
          return;
        }
        cs = tree.toCSS();
        return fs.writeFile(dst, cs, options.encoding, function(err) {
          if (err) {
            konsole.fail('Failed to write', dst);
            konsole.error('  Error:', err.message);
            if (done) {
              done(err);
            }
            return;
          }
          konsole.success('Compile', path.join(src), 'to', dst);
          if (done) {
            return done();
          }
        });
      });
    });
  };

  exports.compiler = compiler;

  _url = require('url');

  http = require('http');

  https = require('https');

  network = {};

  network.createStaticServer = function(root) {
    var loadStaticFile;
    loadStaticFile = function(request, response) {
      var filename, findContentType, uri;
      findContentType = function(uri) {
        var contentType, ext, type, _ref;
        ext = path.extname(uri);
        _ref = network.createStaticServer.CONTENT_TYPES;
        for (type in _ref) {
          contentType = _ref[type];
          if (type === ext) {
            return contentType;
          }
        }
        return 'text/plain';
      };
      uri = _url.parse(request.url).pathname;
      uri = uri === '/' ? 'index.html' : uri;
      filename = path.join(root, uri);
      return exports.exists(filename, function(exists) {
        if (!exists) {
          if (uri === '/favicon.ico') {
            console.warn('404', 'Not found', uri);
          }
          response.writeHead(404, {
            'Content-Type': 'text/plain'
          });
          response.write("404 Not found\n" + filename + "\n");
          response.end();
          return;
        }
        return fs.readFile(filename, 'binary', function(err, contents) {
          if (err) {
            console.error('500', 'Server error', uri);
            response.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            response.write("" + err + "\n" + filename + "\n");
            response.end();
            return;
          }
          console.info('200', 'OK', uri);
          response.writeHead(200, {
            'Content-Type': findContentType(uri)
          });
          response.write(contents, 'binary');
          return response.end();
        });
      });
    };
    return http.createServer(loadStaticFile);
  };

  network.createStaticServer.CONTENT_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };

  network.download = function(url, filename, done) {
    var protocol;
    url = _url.parse(url);
    if (url.href.lastIndexOf('https', 0) === 0) {
      protocol = https;
    } else {
      protocol = http;
    }
    return protocol.get(url, function(response) {
      var buffer;
      if (response.statusCode === 200) {
        buffer = [];
        response.setEncoding('binary');
        response.on('data', function(chunk) {
          return buffer.push(chunk);
        });
        return response.on('end', function() {
          return fs.writeFile(filename, buffer.join(''), 'binary', function(err) {
            if (err) {
              throw err;
            }
            if (done) {
              return done();
            }
          });
        });
      }
    });
  };

  exports.network = network;

  /*
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
  */


  fatalError = function(message) {
    console.error(message + '\n');
    console.log('To see a list of all tasks/options, run "cake"');
    return process.exit(1);
  };

  missingTask = function(task) {
    return fatalError("No such task: " + task);
  };

  decorateCallback = function(fn) {
    return function(options, done) {
      var result;
      result = fn(options, done);
      if (done && result !== false) {
        done(options);
      }
      return result;
    };
  };

  task2 = function(name, description, action) {
    var daction;
    task(name, description, action);
    daction = decorateCallback(action);
    return task2.tasks[name] = {
      name: name,
      description: description,
      'action': daction
    };
  };

  task2.tasks = {};

  invoke2 = function(name, options, callback) {
    if (!task2.tasks[name]) {
      missingTask(name);
    }
    task2.tasks[name].action(options, callback);
    return false;
  };

  exports.task2 = global.task2 = task2;

  exports.invoke2 = global.invoke2 = invoke2;

  test = {};

  test.TEMPLATE_FILENAME = "test.html.template";

  test.loadTemplate = function(root, javascripts, stylesheets, encoding, done) {
    var compileTemplate, templateFile, underscore;
    if (encoding == null) {
      encoding = 'utf-8';
    }
    underscore = require('underscore');
    compileTemplate = function(templateFile) {
      return fs.readFile(templateFile, encoding, function(err, data) {
        var template;
        template = underscore.template(data);
        return done(template({
          javascripts: javascripts,
          stylesheets: stylesheets
        }));
      });
    };
    templateFile = path.join(root, test.TEMPLATE_FILENAME);
    if (!exports.existsSync(templateFile)) {
      return test.downloadTemplate(root, function() {
        return compileTemplate(templateFile);
      });
    } else {
      return compileTemplate(templateFile);
    }
  };

  test.downloadTemplate = function(root, done) {
    var templateFile;
    templateFile = path.join(root, test.TEMPLATE_FILENAME);
    return exports.network.download(test.downloadTemplate.TEMPLATE_URL, templateFile, done);
  };

  test.downloadTemplate.TEMPLATE_URL = "https://raw.github.com/gist/4128967/test.html.template";

  test.downloadVenders = function(root, extras, done) {
    var filename, remaining, underscore, url, venders, _results;
    underscore = require('underscore');
    venders = test.downloadVenders.VENDERS;
    if (extras) {
      venders = underscore.extend(venders, extras);
    }
    remaining = venders.length;
    _results = [];
    for (filename in venders) {
      url = venders[filename];
      _results.push((function(filename, url) {
        filename = path.join(root, filename);
        return exports.network.download(url, filename, function() {
          konsole.success('Download', url);
          if (done && --remaining === 0) {
            return done();
          }
        });
      })(filename, url));
    }
    return _results;
  };

  test.downloadVenders.VENDERS = {
    'jquery.min.js': 'http://code.jquery.com/jquery.min.js',
    'mocha.js': 'https://raw.github.com/visionmedia/mocha/master/mocha.js',
    'mocha.css': 'https://raw.github.com/visionmedia/mocha/master/mocha.css',
    'expect.js': 'https://raw.github.com/LearnBoost/expect.js/master/expect.js',
    'underscore-min.js': 'http://underscorejs.org/underscore-min.js',
    'backbone-min.js': 'http://backbonejs.org/backbone-min.js',
    'reporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.js',
    'reporter.css': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.css',
    'JSCovReporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/JSCovReporter.js'
  };

  exports.test = test;

  exec = require('child_process').exec;

  exports.minify = function(src, dst, done) {
    var args, prevStat;
    prevStat = fs.statSync(src);
    args = ['-jar', exports.minify.YUI_COMPRESSOR, src, '-o', dst];
    return exec('java ' + args.join(' '), function(err, stdout, stderr) {
      var currStat;
      if (err) {
        throw err;
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.warn(stderr);
      }
      currStat = fs.statSync(dst);
      if (done) {
        return done(prevStat.size, currStat.size);
      }
    });
  };

  exports.minify.YUI_COMPRESSOR = '~/.yuicompressor/build/yuicompressor.jar';

  exports.coffeelint = function(files, config, done) {
    var args, coffeelint;
    if (config) {
      args = ['-f', config].concat(files);
    } else {
      args = files;
    }
    coffeelint = exports.execFile(exports.coffeelint.COFFEELINT, args);
    return coffeelint.on('exit', function(code) {
      if (done) {
        return done(code);
      }
    });
  };

  exports.coffeelint.COFFEELINT = './node_modules/coffeelint/bin/coffeelint';

  exports.mocha = function(files, reporter, done) {
    var args, mocha;
    args = ['--reporter', reporter || 'spec', '--compilers', 'coffee:coffee-script'].concat(files);
    mocha = exports.execFile(exports.mocha.MOCHA, args);
    return mocha.on('exit', function(code) {
      if (done) {
        return done(code);
      }
    });
  };

  exports.mocha.MOCHA = './node_modules/mocha/bin/mocha';

  exports.phantomjs = function(file, reporter, done) {
    var args, phantomjs;
    args = ['--reporter', reporter || 'spec', file];
    phantomjs = exports.execFile(exports.phantomjs.PHANTOMJS, args);
    return phantomjs.on('exit', function(code) {
      if (done) {
        return done(code);
      }
    });
  };

  exports.phantomjs.PHANTOMJS = './node_modules/mocha-phantomjs/bin/mocha-phantomjs';

  exports.coverjs = function(files, dst, done) {
    var args, coverjs;
    args = ['--recursive'].concat(files).concat(['--output', dst]);
    coverjs = exports.execFile(exports.coverjs.COVERJS, args);
    return coverjs.on('exit', function(code) {
      if (done) {
        return done(code);
      }
    });
  };

  exports.coverjs.COVERJS = './node_modules/coverjs/bin/cover.js';

}).call(this);
