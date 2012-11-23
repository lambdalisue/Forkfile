test = {}
test.TEMPLATE_FILENAME = "test.html.template"

test.loadTemplate = (root, javascripts, stylesheets, encoding='utf-8', done) ->
  underscore = require 'underscore'
  compileTemplate = (templateFile) ->
    template = fs.readFileSync(templateFile, encoding)
    template = underscore.template(template)
    done template({'stylesheets': stylesheets, 'javascripts': javascripts})
  templateFile = path.join(root, test.TEMPLATE_FILENAME)
  if not exports.existsSync(templateFile)
    # create default template file
    test.downloadTemplate root, ->
      compileTemplate(templateFile)
  else
    compileTemplate(templateFile)

test.downloadTemplate = (root, done) ->
  templateFile = path.join(root, test.TEMPLATE_FILENAME)
  exports.network.download test.downloadTemplate.TEMPLATE_URL, templateFile, done
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
