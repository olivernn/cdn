var spawn = require('child_process').spawn,
    fs = require('fs')

var Identity = function (identifyOutputString) {
  this.parts = identifyOutputString.split(' ')
}

Identity.fromImageStream = function (imageStream, callback) {
  var process = spawn('identify', ['-'])

  process.stdout.on('data', function (data) {
    var identity = new Identity (data.toString('ascii'))
    callback(false, identity)
  })
  
  process.stderr.on('data', function (data) {
    callback(data.toString('ascii'))
  })
  
  imageStream.pipe(process.stdin)
}

Identity.prototype = {
  mimeType: function () {
    return ['image', this.parts[1].toLowerCase()].join('/')
  },

  size: function () {
    return Math.floor(parseFloat(this.parts[6]) * 1024)
  },

  dimensions: function () {
    return this.parts[2].split('x')
  },

  width: function () {
    return parseInt(this.dimensions()[0])
  },

  height: function () {
    return parseInt(this.dimensions()[1])
  }
}

module.exports = Identity