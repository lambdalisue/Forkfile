var exec;

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
