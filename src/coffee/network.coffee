_url = require 'url'
http = require 'http'
https = require 'https'

network = {}
network.createStaticServer = (root) ->
  loadStaticFile = (request, response) ->
    findContentType = (uri) ->
      ext = path.extname(uri)
      for type, contentType of network.createStaticServer.CONTENT_TYPES
        return contentType if type is ext
      return 'text/plain'
    uri = _url.parse(request.url).pathname
    uri = if uri is '/' then 'index.html' else uri
    filename = path.join(root, uri)
    exports.exists filename, (exists) ->
      if not exists
        if uri is '/favicon.ico'
          console.warn('404', 'Not found', uri)
        response.writeHead(404, {'Content-Type': 'text/plain'})
        response.write("404 Not found\n#{filename}\n")
        response.end()
        return
      fs.readFile filename, 'binary', (err, contents) ->
        if err
          console.error('500', 'Server error', uri)
          response.writeHead(500, {'Content-Type': 'text/plain'})
          response.write("#{err}\n#{filename}\n")
          response.end()
          return
        console.info('200', 'OK', uri)
        response.writeHead(200, {'Content-Type': findContentType(uri)})
        response.write(contents, 'binary')
        response.end()
  return http.createServer(loadStaticFile)
network.createStaticServer.CONTENT_TYPES =
  '.html': 'text/html'
  '.js': 'text/javascript'
  '.css': 'text/css'
  '.jpg': 'image/jpeg'
  '.jpeg': 'image/jpeg'
  '.png': 'image/png'
  '.gif': 'image/gif'


network.download = (url, filename, done) ->
  url = _url.parse(url)
  if url.href.lastIndexOf('https', 0) is 0
    protocol = https
  else
    protocol = http
  protocol.get url, (response) ->
    if response.statusCode is 200
      buffer = []
      response.setEncoding 'binary'
      response.on 'data', (chunk) ->
        buffer.push chunk
      response.on 'end', ->
        fs.writeFile filename, buffer.join(''), 'binary', (err) ->
          throw err if err
          done() if done


exports.network = network
