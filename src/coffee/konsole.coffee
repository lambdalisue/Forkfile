###
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
###
class Konsole
  @reset: '\x1b[0m'
  @bold: '\x1b[0;1m'
  @red: '\x1b[0;31m'
  @green: '\x1b[0;32m'
  @check: '\u2713'
  @cross: '\u2A2F'

  log: -> console.log.apply(@, arguments)

  warn: -> console.warn.apply(@, arguments)

  info: (args...) ->
    args.unshift Konsole.green
    args.push Konsole.reset
    @log.apply(@, args)

  error: (args...) ->
    args.unshift Konsole.red
    args.push Konsole.reset
    @warn.apply(@, args)

  title: (args...) ->
    args.unshift Konsole.bold
    args.push Konsole.reset
    @log.apply(@, args)

  success: (args...) ->
    args.unshift Konsole.check
    @info.apply(@, args)

  fail: (args...) ->
    args.unshift Konsole.cross
    @error.apply(@, args)

exports.konsole = new Konsole
