REQUIRED_NODE_MODULES = [
  'underscore',
  'coffee-script',
  'less',
  'glob',
  'mkdirp',
  'coffeelint',
  'coverjs',
  'mocha',
  'expect.js',
]
exports.installRequiredModules = (extraModules) ->
  ###
  Install required node modules
  ###
  installModule = (moduleName) ->
    exports.execFile('npm', ['install', moduleName])
  exports.konsole.title "Install required node modeles..."
  requiredModules = REQUIRED_NODE_MODULES
  requiredModules = requiredModules.concat(extraModules) if extraModules
  for moduleName in requiredModules
    installModule(moduleName)

