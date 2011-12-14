var Store = require('./file_store'),
    spawn = require('child_process').spawn,
    uuid = require('node-uuid'),
    fs = require('fs'),
    commandName = 'convert'

var commandOpts = function (obj) {
  return ['-', obj.command, obj.params, '-'].filter(function (el) { return !!el })
}

var Image = function (id) {
  this.id = id || uuid.v1()
  this.store = new Store (['/Users/olivernightingale/code/cdn/tmp', this.id].join('/'))
}

Image.create = function (file) {
  var readStream = fs.createReadStream(file.path),
      image = new Image ()

  image.openWriteStream(function (writeStream) {
    readStream.pipe(writeStream)
  })

  return image
}

Image.find = function (id) {
  var image = new Image (id)
  return image
}

Image.prototype = {
  openWriteStream: function (fn) {
    fn(this.store.createWriteStream())
  },

  openReadStream: function (fn) {
    fn(this.store.createReadStream())
  },

  openConvertStream: function (processCommand, fn) {
    this.process = spawn(commandName, commandOpts(processCommand))
    this.store.createReadStream().pipe(this.process.stdin)
    fn(this.process.stdout)
  }
}

module.exports = Image
