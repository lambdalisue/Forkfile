exec = require('child_process').exec
exports.minify = (src, dst, done) ->
  prevStat = fs.statSync(src)
  args = ['-jar', exports.minify.YUI_COMPRESSOR, src, '-o', dst]
  exec 'java ' + args.join(' '), (err, stdout, stderr) ->
    throw err if err
    console.log(stdout) if stdout
    console.warn(stderr) if stderr
    currStat = fs.statSync(dst)
    done(prevStat.size, currStat.size) if done
exports.minify.YUI_COMPRESSOR = '~/.yuicompressor/build/yuicompressor.jar'

exports.coffeelint = (files, config, done) ->
  if config
    args = ['-f', config].concat(files)
  else
    args = files
  coffeelint = exports.execFile(exports.coffeelint.COFFEELINT, args)
  coffeelint.on('exit', (code) -> done(code) if done)
exports.coffeelint.COFFEELINT = './node_modules/coffeelint/bin/coffeelint'

exports.mocha = (files, done) ->
  args = [
    '--reporter', 'spec',
    '--compilers', 'coffee:coffee-script'
  ].concat(files)
  mocha = exports.execFile(exports.mocha.MOCHA, args)
  mocha.on('exit', (code) -> done(code) if done)
exports.mocha.MOCHA = './node_modules/mocha/bin/mocha'

exports.phantomjs = (file, done) ->
  args = ['--reporter', 'spec', file]
  phantomjs = exports.execFile(exports.phantomjs.PHANTOMJS, args)
  phantomjs.on('exit', (code) -> done(code) if done)
exports.phantomjs.PHANTOMJS =
  './node_modules/mocha-phantomjs/bin/mocha-phantomjs'

