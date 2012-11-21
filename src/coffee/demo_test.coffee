TEMPLATE_FILENAME = "test.html.template"
TEMPLATE_DEFAULT = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unittest via Mocha</title>
    <link rel="stylesheet" href="vender/mocha.css">
    <link rel="stylesheet" href="vender/reporter.css">
    <% _.each(stylesheets, function(filename) { %>
    <link rel="stylesheet" href="<%= filename %>">
    <% }); %>
</head>
<body>
    <div id="mocha"></div>
    <div id="coverage"></div>
    <div id="menu"></div>
    <script src="vender/jquery.min.js"></script>
    <script src="vender/underscore-min.js"></script>
    <script src="vender/backbone-min.js"></script>
    <script src="vender/mocha.js"></script>
    <script src="vender/expect.js"></script>
    <script src="vender/reporter.js"></script>
    <script src="vender/JSCovReporter.js"></script>
    <script>
        mocha.setup({
            ui: 'bdd',
            ignoreLeaks: true
        });
    </script>
    <% _.each(javascripts, function(filename) { %>
    <script src="<%= filename %>"></script>
    <% }); %>
    <script>
        $(function() {
            mocha.run(function () {
                if (typeof window.__$coverObject !== 'undefined') {
                    var reporter = new JSCovReporter({ coverObject: window.__$coverObject });
                }
            });
        });
    </script>
</body>
</html>
"""

exports.loadTemplate = (root, javascripts, stylesheets, encoding='utf-8') ->
  underscore = require 'underscore'
  templateFile = path.join(root, TEMPLATE_FILENAME)
  if not exports.existsSync(templateFile)
    # create default template file
    fs.writeFileSync(templateFile, TEMPLATE_DEFAULT, encoding)
  template = fs.readFileSync(templateFile, encoding)
  template = underscore.template(template)
  return template({'stylesheets': stylesheets, 'javascripts': javascripts})

exports.download = (url, filename, done) ->
  request = require 'request'
  request url, (error, response, body) ->
    if not error and response.statusCode == 200
      fs.writeFile filename, body, 'binary', (err) ->
        throw err if err
        done() if done

exports.downloadVenders = (root, extras) ->
  underscore = require 'underscore'
  venders = {
    'jquery.min.js': 'http://code.jquery.com/jquery.min.js'
    'underscore-min.js': 'http://underscorejs.org/underscore-min.js'
    'backbone-min.js': 'http://backbonejs.org/backbone-min.js'
    'mocha.js': 'https://raw.github.com/visionmedia/mocha/master/mocha.js'
    'expect.js': 'https://raw.github.com/LearnBoost/expect.js/master/expect.js'
    'reporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.js'
    'JSCovReporter.js': 'https://raw.github.com/TwoApart/JSCovReporter/master/JSCovReporter.js'
    'mocha.css': 'https://raw.github.com/visionmedia/mocha/master/mocha.css'
    'reporter.css': 'https://raw.github.com/TwoApart/JSCovReporter/master/reporter.css'
  }
  venders = underscore.extend(venders, extras) if extras
  # Download files
  for filename, url of venders then do (filename, url) ->
    filename = path.join(root, filename)
    exports.download url, filename, ->
      exports.konsole.success 'Download', url
