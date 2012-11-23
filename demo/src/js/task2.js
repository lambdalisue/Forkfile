/*
Task2

An improvement script of Cake `task` and `invoke` to enable callback function
Ref: http://coffeescript.org/documentation/docs/cake.html

Usage:

  # `cake task2` command will call task1 and task2 in order so
  # the output will be like
  #
  #   $ cake task2
  #   `hello.txt` was created
  #   HELLO
  #
  task2 'task1', 'task1 description', (options, done) ->
    fs.writeFile 'hello.txt', 'HELLO', (err) ->
      throw err if err
      console.log "`hello.txt` was created"
      done(options) if done
    # returning `false` mean you will call `done` with your responsibility
    return false

  task2 'task2', 'task2 description', (options, done) ->
    invoke2 'task1', options, ->
      fs.readFile 'hello.txt', (err, data) ->
        throw err if err
        console.log data
        done(options) if done
    # returning `false` mean you will call `done` with your responsibility
    return false

  task2 'task3', 'task3 description', (options, done) ->
    console.log "Hello3"

Author:   lambdalisue
License:  MIT License

Copyright(c) lambdalisue, hashnote.net all right reserved.
*/

var decorateCallback, fatalError, invoke2, missingTask, task2;

fatalError = function(message) {
  console.error(message + '\n');
  console.log('To see a list of all tasks/options, run "cake"');
  return process.exit(1);
};

missingTask = function(task) {
  return fatalError("No such task: " + task);
};

decorateCallback = function(fn) {
  return function(options, done) {
    var result;
    result = fn(options, done);
    if (done && result !== false) {
      done(options);
    }
    return result;
  };
};

task2 = function(name, description, action) {
  var daction;
  task(name, description, action);
  daction = decorateCallback(action);
  return task2.tasks[name] = {
    name: name,
    description: description,
    'action': daction
  };
};

task2.tasks = {};

invoke2 = function(name, options, callback) {
  if (!task2.tasks[name]) {
    missingTask(name);
  }
  task2.tasks[name].action(options, callback);
  return false;
};

exports.task2 = global.task2 = task2;

exports.invoke2 = global.invoke2 = invoke2;
