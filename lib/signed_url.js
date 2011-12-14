var url = require('url'),
    queryString = require('querystring'),
    crypto = require('crypto')

var getPrivateKey = function (publicKey) {
  return 'secret'
}

var SignedUrl = function (uri) {
  var uri = url.parse(uri),
      params = queryString.parse(uri.query)

  this.timestamp = params.timestamp || 0
  this.key = params.key
  this.signiture = params.signiture

  delete params.signiture
  this.urlWithoutSigniture = [uri.pathname, queryString.stringify(params)].join('?')
}

SignedUrl.prototype = {
  authorized: function () {
    if ((Date.now() - this.timestamp) > 600000) return false
    if (!this.signiture) return false
    if (!this.key) return false

    var hmac = crypto.createHmac("sha1", getPrivateKey(this.key)),
        hash = hmac.update(this.urlWithoutSigniture),
        digest = hmac.digest('hex')

    return digest === this.signiture
  }
}

module.exports = SignedUrl