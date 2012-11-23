/*
Konsole - Color enabled Console

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
*/

var Konsole, konsole,
  __slice = [].slice;

Konsole = (function() {

  Konsole.reset = '\x1b[0m';

  Konsole.bold = '\x1b[1m';

  Konsole.red = '\x1b[31m';

  Konsole.green = '\x1b[32m';

  Konsole.check = '\u2713';

  Konsole.cross = '\u2A2F';

  function Konsole() {
    var _this = this;
    this.noColor = false;
    this.log.strong = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!_this.noColor) {
        args.unshift(Konsole.bold);
      }
      if (!_this.noColor) {
        args.push(Konsole.reset);
      }
      return _this.log.apply(_this, args);
    };
    this.info.strong = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!_this.noColor) {
        args.unshift(Konsole.bold);
      }
      if (!_this.noColor) {
        args.unshift(Konsole.green);
      }
      if (!_this.noColor) {
        args.push(Konsole.reset);
      }
      return _this.log.apply(_this, args);
    };
    this.error.strong = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!_this.noColor) {
        args.unshift(Konsole.bold);
      }
      if (!_this.noColor) {
        args.unshift(Konsole.red);
      }
      if (!_this.noColor) {
        args.push(Konsole.reset);
      }
      return _this.warn.apply(_this, args);
    };
  }

  Konsole.prototype.log = console.log;

  Konsole.prototype.warn = console.warn;

  Konsole.prototype.info = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!this.noColor) {
      args.unshift(Konsole.green);
    }
    if (!this.noColor) {
      args.push(Konsole.reset);
    }
    return this.log.apply(this, args);
  };

  Konsole.prototype.error = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!this.noColor) {
      args.unshift(Konsole.red);
    }
    if (!this.noColor) {
      args.push(Konsole.reset);
    }
    return this.warn.apply(this, args);
  };

  Konsole.prototype.success = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args.unshift(Konsole.check);
    return this.info.apply(this, args);
  };

  Konsole.prototype.fail = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args.unshift(Konsole.cross);
    return this.error.apply(this, args);
  };

  return Konsole;

})();

exports.konsole = konsole = new Konsole;
