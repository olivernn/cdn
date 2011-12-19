var url = require('url'),
    queryString = require('querystring'),
    crypto = require('crypto')

var getPrivateKey = function (publicKey) {
  return 'secret'
}

var cloneObj = function (obj) {
  return Object.keys(obj).reduce(function (clone, key) {
    clone[key] = obj[key]
    return clone
  }, {})
}

var Signiture = function (settings) {
  this.timestamp = parseInt(settings.timestamp, 10)
  this.key = settings.key
  this.token = settings.token
  this.content = settings.content
}

Signiture.fromUrl = function (uri) {
    var uri = url.parse(uri),
        params = queryString.parse(uri.query),
        timestamp = params.timestamp || 0
        key = params.key,
        token = params.token

    delete params.token
    var content = [uri.pathname, queryString.stringify(params)].join('?')

    return new Signiture ({
      timestamp: timestamp,
      key: key,
      token: token,
      content: content
    })
}

Signiture.fromObj = function (obj) {
  var clonedObj = cloneObj(obj)
  delete clonedObj.token
  obj.content = queryString.stringify(clonedObj)
  obj.timestamp = Date.now()
  return new Signiture (obj)
}

Signiture.prototype = {
  authorized: function () {
    if ((Date.now() - this.timestamp) > 600000) return false
    if (!this.token) return false
    if (!this.key) return false

    var hmac = crypto.createHmac("sha1", getPrivateKey(this.key)),
        hash = hmac.update(this.content),
        digest = hmac.digest('hex')

    return digest === this.token
  }
}

module.exports = Signiture
