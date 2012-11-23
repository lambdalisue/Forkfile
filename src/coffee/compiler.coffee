compiler = {}
compiler.coffee = (src, dst, options, done) ->
  coffee = require 'coffee-script'
  # if destination directory does not exist, create it
  exports.makedirs(path.dirname(dst))
  # compile CoffeeScript to JavaScript
  fs.readFile src, options.encoding, (err, cs) ->
    if err
      konsole.fail('Failed to read', src)
      konsole.error('  Error:', err.message)
      done(err) if done
      return
    js = coffee.compile(cs, {'bare': options.bare})
    fs.writeFile dst, js, options.encoding, (err) ->
      if err
        konsole.fail('Failed to write', dst)
        konsole.error('  Error:', err.message)
        done(err) if done
        return
      konsole.success('Compile', path.join(src), 'to', dst)
      done() if done

compiler.less = (src, dst, options, done) ->
  less = require 'less'
  # if destination directory does not exist, create it
  exports.makedirs(path.dirname(dst))
  # create LESS parser
  parser = new(less.Parser)
    'paths': [path.dirname(src)]
    'filename': dst
  # compile CoffeeScript to JavaScript
  fs.readFile src, options.encoding, (err, less) ->
    if err
      konsole.fail('Failed to read', src)
      konsole.error('  Error:', err.message)
      done(err) if done
      return
    parser.parse less, (err, tree) ->
      if err
        konsole.fail('Failed to parse', src)
        konsole.error('  Error:', err.message)
        done(err) if done
        return
      cs = tree.toCSS()
      fs.writeFile dst, cs, options.encoding, (err) ->
        if err
          konsole.fail('Failed to write', dst)
          konsole.error('  Error:', err.message)
          done(err) if done
          return
        konsole.success('Compile', path.join(src), 'to', dst)
        done() if done

exports.compiler = compiler
