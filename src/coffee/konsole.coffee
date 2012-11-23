###
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
###
class Konsole
  @reset: '\x1b[0m'
  @bold: '\x1b[1m'
  @red: '\x1b[31m'
  @green: '\x1b[32m'
  @check: '\u2713'
  @cross: '\u2A2F'

  constructor: ->
    @noColor = false
    @log.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.push Konsole.reset unless @noColor
      @log.apply(@, args)
    @info.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.unshift Konsole.green unless @noColor
      args.push Konsole.reset unless @noColor
      @log.apply(@, args)
    @error.strong = (args...) =>
      args.unshift Konsole.bold unless @noColor
      args.unshift Konsole.red unless @noColor
      args.push Konsole.reset unless @noColor
      @warn.apply(@, args)

  log: console.log

  warn: console.warn

  info: (args...) ->
    args.unshift Konsole.green unless @noColor
    args.push Konsole.reset unless @noColor
    @log.apply(@, args)

  error: (args...) ->
    args.unshift Konsole.red unless @noColor
    args.push Konsole.reset unless @noColor
    @warn.apply(@, args)

  success: (args...) ->
    args.unshift Konsole.check
    @info.apply(@, args)

  fail: (args...) ->
    args.unshift Konsole.cross
    @error.apply(@, args)

exports.konsole = konsole = new Konsole
