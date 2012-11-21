url = require 'url'

CONTENT_TYPES =
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif'

exports.createStaticServer = (root) ->
  loadStaticFile = (request, response) ->
    findContentType = (uri) ->
      ext = path.extname(uri)
      for type, contentType of CONTENT_TYPES
        return contentType if type is ext
      return 'text/plain'
    uri = url.parse(request.url).pathname
    uri = if uri is '/' then 'index.html' else uri
    filename = path.join(root, uri)
    path.exists filename, (exists) ->
      if not exists
        if uri is '/favicon.ico'
          exports.konsole('404', 'Not found')
        response.writeHead(404, {'Content-Type', 'text/plain'})
        response.write("404 Not found\n#{filename}\n")
        response.end()
        return
      fs.readFile filename, 'binary', (err, contents) ->
        if err
          exports.konsole('500', 'Server error', uri)
          response.writeHead(500, {'Content-Type', 'text/plain'})
          response.write("#{err}\n#{filename}\n")
          response.end()
          return
        exports.konsole('200', 'OK', uri)
        response.writeHead(200, {'Content-Type', 'text/html'})
        response.write(content, 'binary')
        response.end()
  return http.createServer(loadStaticFile)
