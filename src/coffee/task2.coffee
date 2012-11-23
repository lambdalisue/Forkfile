###
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
###
fatalError = (message) ->
  console.error(message + '\n')
  console.log('To see a list of all tasks/options, run "cake"')
  process.exit(1)

missingTask = (task) -> fatalError "No such task: #{task}"

decorateCallback = (fn) ->
  return (options, done) ->
    result = fn(options, done)
    done(options) if done and result isnt false
    return result

task2 = (name, description, action) ->
  # register in Cake task as well
  task name, description, action
  # decorate action
  daction = decorateCallback(action)
  # register in Task2
  task2.tasks[name] = {name, description, 'action': daction}
task2.tasks = {}

invoke2 = (name, options, callback) ->
  missingTask(name) unless task2.tasks[name]
  task2.tasks[name].action options, callback
  # calling invoke2 trigger to have responsibility to call `done(options)`
  return false

exports.task2 = global.task2 = task2
exports.invoke2 = global.invoke2 = invoke2
