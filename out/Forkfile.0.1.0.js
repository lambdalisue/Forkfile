/**
 * Forkfile 0.1.0
 *
 * Author:  lambdalisue
 * URL:     http://hashnote.net/
 * License: MIT License
 * 
 * Copyright (C) 2012 lambdalisue, hashnote.net allright reserved.
 */

/*
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
*/


(function() {
  var COFFEELINT, COFFEELINT_CONFIG, CONTENT_TYPES, COVERJS, Konsole, MOCHA, REQUIRED_NODE_MODULES, TEMPLATE_DEFAULT, TEMPLATE_FILENAME, YUI_COMPRESSOR, fs, http, path, spawn, url,
    __slice = [].slice;

  Konsole = (function() {

    function Konsole() {}

    Konsole.reset = '\x1b[0m';

    Konsole.bold = '\x1b[0;1m';

    Konsole.red = '\x1b[0;31m';

    Konsole.green = '\x1b[0;32m';

    Konsole.check = '\u2713';

    Konsole.cross = '\u2A2F';

    Konsole.prototype.log = function() {
      return console.log.apply(this, arguments);
    };

    Konsole.prototype.warn = function() {
      return console.warn.apply(this, arguments);
    };

    Konsole.prototype.info = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.green);
      args.push(Konsole.reset);
      return this.log.apply(this, args);
    };

    Konsole.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.red);
      args.push(Konsole.reset);
      return this.warn.apply(this, args);
    };

    Konsole.prototype.title = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.bold);
      args.push(Konsole.reset);
      return this.log.apply(this, args);
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

  exports.konsole = new Konsole;

  fs = require('fs');

  path = require('path');

  spawn = require('child_process').spawn;

  exports.exists = function() {
    if (fs.exists != null) {
      return fs.exists.apply(fs, arguments);
    } else {
      return path.exists.apply(path, arguments);
    }
  };

  exports.existsSync = function() {
    if (fs.existsSync != null) {
      return fs.existsSync.apply(fs, arguments);
    } else {
      return path.existsSync.apply(path, arguments);
    }
  };

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

  exports.globset = function(patterns, root) {
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
      cwd: root,
      root: root
    };
    filenames = new Array;
    for (_i = 0, _len = patterns.length; _i < _len; _i++) {
      pattern = patterns[_i];
      if (pattern.lastIndexOf('-', 0) === 0) {
        _filenames = glob.sync(pattern.slice(1), options);
        filenames = underscore.difference(filenames, _filenames);
      } else {
        _filenames = glob.sync(pattern, options);
        filenames = filenames.concat(_filenames);
      }
    }
    return filenames;
  };

  YUI_COMPRESSOR = "~/.yuicompressor/build/yuicompressor-2.4.7.jar";

  COFFEELINT = "./node_modules/coffeelint/bin/coffeelint";

  COFFEELINT_CONFIG = "./config/coffeelint.json";

  COVERJS = "./node_modules/coverjs/bin/cover.js";

  MOCHA = "./node_modules/mocha/bin/mocha";

  exports.coffee = function(src, dst, opts, done) {
    /*
      Compile CoffeeScript file(s) to a single JavaScript file
    
      Args:
        src - A source CoffeeScript file path or a list of that
        dst - A destination JavaScript file path
        opts - Compile options
        done - A callback called after compile has done
    
      Options
        bare - bare or not
        encoding - An encoding of the file
        dry - Dry run
    
      Require:
        - coffee-script
    */

    var coffee, compile, _ref, _ref1, _ref2;
    coffee = require('coffee-script');
    compile = function(data) {
      var js;
      if (!data) {
        return;
      }
      js = coffee.compile(data, {
        'bare': opts.bare
      });
      if (!opts.dry) {
        return fs.writeFile(dst, js, opts.encoding, function(err) {
          if (err) {
            throw err;
          }
          if (done) {
            return done();
          }
        });
      } else {
        if (done) {
          return done();
        }
      }
    };
    opts.encoding = (_ref = opts.encoding) != null ? _ref : 'utf-8';
    exports.makedirs(path.dirname(dst));
    if (typeof src === 'string') {
      opts.bare = (_ref1 = opts.bare) != null ? _ref1 : true;
      return fs.readFile(src, opts.encoding, function(err, data) {
        if (err) {
          throw err;
        }
        return compile(data);
      });
    } else {
      opts.bare = (_ref2 = opts.bare) != null ? _ref2 : false;
      return exports.readAllFiles(src, opts.encoding, compile);
    }
  };

  exports.less = function(src, dst, opts, done) {
    /*
      Compile LESS file(s) to a single CSS file
    
      Args:
        src - A source LESS file path or a list of that
        dst - A destination CSS file path
        opts - Compile options
        done - A callback called after compile has done
    
      Options
        encoding - An encoding of the file
        dry - Dry run
    
      Require:
        - less
    */

    var compile, less, parser, paths, s, _ref;
    less = require('less');
    compile = function(parser, data) {
      if (!data) {
        return;
      }
      return parser.parse(data, function(err, tree) {
        var cs;
        if (err) {
          throw err;
        }
        cs = tree.toCSS();
        if (!opts.dry) {
          return fs.writeFile(dst, cs, opts.encoding, function(err) {
            if (err) {
              throw err;
            }
            if (done) {
              return done();
            }
          });
        } else {
          if (done) {
            return done();
          }
        }
      });
    };
    opts.encoding = (_ref = opts.encoding) != null ? _ref : 'utf-8';
    exports.makedirs(path.dirname(dst));
    if (typeof src === 'string') {
      parser = new less.Parser({
        'paths': [path.dirname(src)],
        'filename': dst
      });
      return fs.readFile(src, opts.encoding, function(err, data) {
        if (err) {
          throw err;
        }
        return compile(parser, data);
      });
    } else {
      paths = [
        (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = src.length; _i < _len; _i++) {
            s = src[_i];
            _results.push(path.dirname(s));
          }
          return _results;
        })()
      ];
      parser = new less.Parser({
        'paths': paths,
        'filename': dst
      });
      return exports.readAllFiles(src, opts.encoding, function(data) {
        return compile(parser, data);
      });
    }
  };

  exports.minify = function(src, dst, done) {
    /*
      Minify JavaScript/CSS file via YUI Compressor
    
      Require
        - YUI_COMPRESSOR
    */

    var args, compressor, exec;
    exec = require('child_process').exec;
    compressor = process.env.YUI_COMPRESSOR || YUI_COMPRESSOR;
    args = ['-jar', compressor, src, '-o', dst];
    return exec('java ' + args.join(' '), function(err, stdout, stderr) {
      if (err) {
        throw err;
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.warn(stderr);
      }
      if (done) {
        return done();
      }
    });
  };

  exports.coffeelint = function(files, config, done) {
    /*
      Lint CoffeeScript files via CoffeeLint
    */

    var args, lint;
    lint = process.env.COFFEELINT || COFFEELINT;
    if (config) {
      args = ['-f', config].concat(files);
    } else {
      args = files;
    }
    return exports.execFile(lint, args, done);
  };

  exports.coverjs = function(files, dst, done) {
    /*
      Instrument CoffeeScript files via CoverJS
    */

    var args, coverjs;
    coverjs = process.env.COVERJS || COVERJS;
    args = ['--recursive'].concat(files).concat(['--output', dst]);
    return exports.execFile(coverjs, args, done);
  };

  exports.mocha = function(files, done) {
    /*
      Run unittest via mocha
    */

    var args, exec, mocha;
    exec = require('child_process').exec;
    mocha = process.env.MOCHA || MOCHA;
    args = ['--compilers', 'coffee:coffee-script'].concat(files);
    return exec(mocha + ' ' + args.join(' '), function(err, stdout, stderr) {
      if (err) {
        throw err;
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.warn(stderr);
      }
      if (done) {
        return done();
      }
    });
  };

  TEMPLATE_FILENAME = "test.html.template";

  TEMPLATE_DEFAULT = "<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"utf-8\">\n    <title>Unittest via Mocha</title>\n    <link rel=\"stylesheet\" href=\"vender/mocha.css\">\n    <link rel=\"stylesheet\" href=\"vender/reporter.css\">\n    <% _.each(stylesheets, function(filename) { %>\n    <link rel=\"stylesheet\" href=\"<%= filename %>\">\n    <% }); %>\n</head>\n<body>\n    <div id=\"mocha\"></div>\n    <div id=\"coverage\"></div>\n    <div id=\"menu\"></div>\n    <script src=\"vender/jquery.min.js\"></script>\n    <script src=\"vender/underscore-min.js\"></script>\n    <script src=\"vender/backbone-min.js\"></script>\n    <script src=\"vender/mocha.js\"></script>\n    <script src=\"vender/expect.js\"></script>\n    <script src=\"vender/reporter.js\"></script>\n    <script src=\"vender/JSCovReporter.js\"></script>\n    <script>\n        mocha.setup({\n            ui: 'bdd',\n            ignoreLeaks: true\n        });\n    </script>\n    <% _.each(javascripts, function(filename) { %>\n    <script src=\"<%= filename %>\"></script>\n    <% }); %>\n    <script>\n        $(function() {\n            mocha.run(function () {\n                if (typeof window.__$coverObject !== 'undefined') {\n                    var reporter = new JSCovReporter({ coverObject: window.__$coverObject });\n                }\n            });\n        });\n    </script>\n</body>\n</html>";

  exports.loadTemplate = function(root, javascripts, stylesheets, encoding) {
    var template, templateFile, underscore;
    if (encoding == null) {
      encoding = 'utf-8';
    }
    underscore = require('underscore');
    templateFile = path.join(root, TEMPLATE_FILENAME);
    if (!exports.existsSync(templateFile)) {
      fs.writeFileSync(templateFile, TEMPLATE_DEFAULT, encoding);
    }
    template = fs.readFileSync(templateFile, encoding);
    template = underscore.template(template);
    return template({
      'stylesheets': stylesheets,
      'javascripts': javascripts
    });
  };

  exports.download = function(url, filename, done) {
    var request;
    request = require('request');
    return request(url, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        return fs.writeFile(filename, body, 'binary', function(err) {
          if (err) {
            throw err;
          }
          if (done) {
            return done();
          }
        });
      }
    });
  };

  exports.downloadVenders = function(root, extras) {
    var filename, underscore, url, venders, _results;
    underscore = require('underscore');
    venders = {
      'jquery.min.js': 'http://code.jquery.com/jquery.min.js',
      'underscore-min.js': 'http://underscorejs.org/underscore-min.js',
      'backbone-min.js': 'http://backbonejs.org/backbone-min.js',
      'mocha.js': 'https://raw.github.com/visionmedia/mocha/master/mocha.js',
      'expect.js': 'https://raw.github.com/LearnBoost/expect.js/master/expect.js',
      'reporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.js',
      'JSCovReporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/JSCovReporter.js',
      'mocha.css': 'https://raw.github.com/visionmedia/mocha/master/mocha.css',
      'reporter.css': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.css'
    };
    if (extras) {
      venders = underscore.extend(venders, extras);
    }
    _results = [];
    for (filename in venders) {
      url = venders[filename];
      _results.push((function(filename, url) {
        filename = path.join(root, filename);
        return exports.download(url, filename, function() {
          return exports.konsole.success('Download', url);
        });
      })(filename, url));
    }
    return _results;
  };

  REQUIRED_NODE_MODULES = ['underscore', 'coffee-script', 'less', 'glob', 'mkdirp', 'coffeelint', 'coverjs', 'mocha', 'expect.js'];

  exports.installRequiredModules = function(extraModules) {
    /*
      Install required node modules
    */

    var installModule, moduleName, requiredModules, _i, _len, _results;
    installModule = function(moduleName) {
      return exports.execFile('npm', ['install', moduleName]);
    };
    exports.konsole.title("Install required node modeles...");
    requiredModules = REQUIRED_NODE_MODULES;
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

  /*
  Konsole - Color enabled Console
  
  Author:   lambdalisue
  License:  MIT License
  
  Copyright(c) lambdalisue, hashnote.net all right reserved.
  */


  Konsole = (function() {

    function Konsole() {}

    Konsole.reset = '\x1b[0m';

    Konsole.bold = '\x1b[0;1m';

    Konsole.red = '\x1b[0;31m';

    Konsole.green = '\x1b[0;32m';

    Konsole.check = '\u2713';

    Konsole.cross = '\u2A2F';

    Konsole.prototype.log = function() {
      return console.log.apply(this, arguments);
    };

    Konsole.prototype.warn = function() {
      return console.warn.apply(this, arguments);
    };

    Konsole.prototype.info = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.green);
      args.push(Konsole.reset);
      return this.log.apply(this, args);
    };

    Konsole.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.red);
      args.push(Konsole.reset);
      return this.warn.apply(this, args);
    };

    Konsole.prototype.title = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(Konsole.bold);
      args.push(Konsole.reset);
      return this.log.apply(this, args);
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

  exports.konsole = new Konsole;

  url = require('url');

  http = require('http');

  CONTENT_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };

  exports.createStaticServer = function(root) {
    var loadStaticFile;
    loadStaticFile = function(request, response) {
      var filename, findContentType, uri;
      findContentType = function(uri) {
        var contentType, ext, type;
        ext = path.extname(uri);
        for (type in CONTENT_TYPES) {
          contentType = CONTENT_TYPES[type];
          if (type === ext) {
            return contentType;
          }
        }
        return 'text/plain';
      };
      uri = url.parse(request.url).pathname;
      uri = uri === '/' ? 'index.html' : uri;
      filename = path.join(root, uri);
      return exports.exists(filename, function(exists) {
        if (!exists) {
          if (uri === '/favicon.ico') {
            exports.konsole.warn('404', 'Not found', uri);
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
            exports.konsole.error('500', 'Server error', uri);
            response.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            response.write("" + err + "\n" + filename + "\n");
            response.end();
            return;
          }
          exports.konsole.info('200', 'OK', uri);
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

  fs = require('fs');

  path = require('path');

  spawn = require('child_process').spawn;

  exports.exists = function() {
    if (fs.exists != null) {
      return fs.exists.apply(fs, arguments);
    } else {
      return path.exists.apply(path, arguments);
    }
  };

  exports.existsSync = function() {
    if (fs.existsSync != null) {
      return fs.existsSync.apply(fs, arguments);
    } else {
      return path.existsSync.apply(path, arguments);
    }
  };

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

  exports.globset = function(patterns, root) {
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
      cwd: root,
      root: root
    };
    filenames = new Array;
    for (_i = 0, _len = patterns.length; _i < _len; _i++) {
      pattern = patterns[_i];
      if (pattern.lastIndexOf('-', 0) === 0) {
        _filenames = glob.sync(pattern.slice(1), options);
        filenames = underscore.difference(filenames, _filenames);
      } else {
        _filenames = glob.sync(pattern, options);
        filenames = filenames.concat(_filenames);
      }
    }
    return filenames;
  };

}).call(this);
