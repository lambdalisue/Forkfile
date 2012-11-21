#path = require 'path'
YUI_COMPRESSOR = "~/.yuicompressor/build/yuicompressor-2.4.7.jar"
COFFEELINT = "./node_modules/coffeelint/bin/coffeelint"
COFFEELINT_CONFIG  = "./config/coffeelint.json"
COVERJS = "./node_modules/coverjs/bin/cover.js"
MOCHA = "./node_modules/mocha/bin/mocha"


exports.coffee = (src, dst, opts, done) ->
  ###
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
  ###
  coffee = require 'coffee-script'
  compile = (data) ->
    return if not data
    js = coffee.compile(data, {'bare': opts.bare})
    if not opts.dry
      fs.writeFile dst, js, opts.encoding, (err) ->
        throw err if err
        done() if done
    else
      done() if done
  opts.encoding = opts.encoding ? 'utf-8'
  # create required directory path
  exports.makedirs(path.dirname(dst))
  # compile src(s)
  if typeof src is 'string'
    # compile single CoffeeScript to JavaScript
    opts.bare = opts.bare ? true
    fs.readFile src, opts.encoding, (err, data) ->
      throw err if err
      compile(data)
  else
    # join CoffeeScript files and compile to a single JavaScript
    opts.bare = opts.bare ? false
    exports.readAllFiles src, opts.encoding, compile


exports.less = (src, dst, opts, done) ->
  ###
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
  ###
  less = require 'less'
  compile = (parser, data) ->
    return if not data
    parser.parse data, (err, tree) ->
      throw err if err
      cs = tree.toCSS()
      if not opts.dry
        fs.writeFile dst, cs, opts.encoding, (err) ->
          throw err if err
          done() if done
      else
        done() if done
  opts.encoding = opts.encoding ? 'utf-8'
  # create required directory path
  exports.makedirs(path.dirname(dst))
  # compile src(s)
  if typeof src is 'string'
    # compile single LESS to CSS
    parser = new(less.Parser)({
        'paths': [path.dirname(src)],
        'filename': dst
    });
    fs.readFile src, opts.encoding, (err, data) ->
      throw err if err
      compile(parser, data)
  else
    # join LESS files and compile to a single CSS
    paths = [path.dirname(s) for s in src]
    parser = new(less.Parser)({
        'paths': paths,
        'filename': dst
    });
    exports.readAllFiles src, opts.encoding, (data) ->
      compile(parser, data)


exports.minify = (src, dst, done) ->
  ###
  Minify JavaScript/CSS file via YUI Compressor

  Require
    - YUI_COMPRESSOR
  ###
  # exec is required because to handle `~/` in the path
  exec = require('child_process').exec
  compressor = process.env.YUI_COMPRESSOR or YUI_COMPRESSOR
  args = ['-jar', compressor, src, '-o', dst]
  exec 'java ' + args.join(' '), (err, stdout, stderr) ->
    throw err if err
    console.log(stdout) if stdout
    console.warn(stderr) if stderr
    done() if done


exports.coffeelint = (files, config, done) ->
  ###
  Lint CoffeeScript files via CoffeeLint
  ###
  lint = process.env.COFFEELINT or COFFEELINT
  if config
    args = ['-f', config].concat(files)
  else
    args = files
  exports.execFile(lint, args, done)


exports.coverjs = (files, dst, done) ->
  ###
  Instrument CoffeeScript files via CoverJS
  ###
  coverjs = process.env.COVERJS or COVERJS
  args = ['--recursive'].concat(files).concat(['--output', dst])
  exports.execFile(coverjs, args, done)


exports.mocha = (files, done) ->
  ###
  Run unittest via mocha
  ###
  mocha = process.env.MOCHA or MOCHA
  args = ['--compilers', 'coffee:coffee-script'].concat(files)
  exports.execFile(mocha, args, done)
