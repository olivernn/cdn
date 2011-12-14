var Store = require('./file_store'),
    spawn = require('child_process').spawn,
    uuid = require('node-uuid'),
    commandName = 'convert'

var commandOpts = function (obj) {
  return ['-', obj.command, obj.params, '-'].filter(function (el) { return !!el })
}

var Image = function (id, processCommand) {
  this.id = id || uuid.v1()
  this.processCommand = processCommand
  this.store = new Store (['/Users/olivernightingale/code/cdn/tmp', this.id].join('/'))
}

Image.prototype = {
  openWriteStream: function (fn) {
    fn(this.store.createWriteStream())
  },

  openReadStream: function (fn) {
    fn(this.store.createReadStream())
  },

  openConvertStream: function (fn) {
    console.log(commandOpts(this.processCommand), this.processCommand)
    this.process = spawn(commandName, commandOpts(this.processCommand))
    this.store.createReadStream().pipe(this.process.stdin)
    fn(this.process.stdout)
  }
}

module.exports = Image
