var http = require('http'),
    client = require('./s3').client

var Store = function (path) {
  this.path = path
}

Store.prototype = {
  createWriteStream: function () {
    
  },

  createReadStream: function (fn) {

  }
}

module.exports = Store
