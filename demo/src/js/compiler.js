var compiler;

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
