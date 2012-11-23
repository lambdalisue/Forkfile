var test;

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
