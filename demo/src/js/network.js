var http, https, network, _url;

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
