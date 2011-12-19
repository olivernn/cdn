var fs = require('fs')

var Store = function (path) {
  this.path = path
}

Store.prototype = {
  createWriteStream: function () {
    return fs.createWriteStream(this.path)
  },

  createReadStream: function () {
    return fs.createReadStream(this.path)
  }
}

module.exports = Store