var Signiture = require('./../lib/signiture.js'),
    url = require('url'),
    queryString = require('querystring'),
    crypto = require('crypto')

var SignitureFactory = function (path, params) {
  return Signiture.fromUrl([path, queryString.stringify(params)].join('?'))
}

exports["extracts the timestamp from the url"] = function (test) {
  var signiture = Signiture.fromUrl('/foo?timestamp=1')
  test.equal(signiture.timestamp, 1, 'should extract the timestamp from the url')
  test.done()
}

exports["extracts the key from the url"] = function (test) {
  var signiture = Signiture.fromUrl('/foo?key=public_key')
  test.equal(signiture.key, 'public_key', 'should extract the public key from the url')
  test.done()
}

exports["extracts the signiture from the url"] = function (test) {
  var signiture = Signiture.fromUrl('/foo?token=123abc')
  test.equal(signiture.token, '123abc', 'should extract the signiture from the url')
  test.done()
}

exports["gets the url to sign"] = function (test) {
  var signiture = Signiture.fromUrl('/foo?token=123abc&timestamp=123&key=123')
  test.equal(signiture.content, '/foo?timestamp=123&key=123')
  test.done()
}

exports["urls older than 10 minutes are invalid"] = function (test) {
  var signiture = SignitureFactory('/foo', {timestamp: 1, key: 'public', signiture: 'abc'})
  test.ok(!signiture.authorized(), 'should be unauthorized when stale (more than 10 minutes old)')
  test.done()
}

exports["urls without a signiture are invalid"] = function (test) {
  var signiture = SignitureFactory('/foo', {timestamp: Date.now(), key: 'public'})
  test.ok(!signiture.authorized(), 'should be unauthorixed when no token is present')
  test.done()
}

exports["urls without a key are invalid"] = function (test) {
  var signiture = SignitureFactory('/foo', {timestamp: Date.now(), token: 'abc'})
  test.ok(!signiture.authorized(), 'should be unauthorixed when no key is present')
  test.done()
}

exports["urls where the signiture doesn't match are invalid"] = function (test) {
  var signiture = SignitureFactory('/foo', {timestamp: Date.now(), token: 'abc', key: 'test'})
  test.ok(!signiture.authorized(), 'should be unauthorised when the token is incorrect')
  test.done()
}

exports["urls with a matching signiture are valid"] = function (test) {
  var timestamp = Date.now(),
      path = '/foo?timestamp=' + timestamp + '&key=123',
      hmac = crypto.createHmac("sha1", 'secret'),
      hash = hmac.update(path),
      token = hmac.digest('hex'),
      signiture = SignitureFactory('/foo', {timestamp: timestamp, token: token, key: 123})

  test.ok(signiture.authorized(), 'should be authorized')
  test.done()
}

exports["using objects instead of urls to build the signiture"] = function (test) {
  var obj = {
    command: 'resize',
    params: '50x50',
    timestamp: Date.now(),
    key: '123'
  }

  var query = queryString.stringify(obj),
      hmac = crypto.createHmac("sha1", 'secret'),
      hash = hmac.update(query)
      token = hmac.digest('hex')

  obj.token = token
  var signiture = Signiture.fromObj(obj)
  test.ok(signiture.authorized(), 'should be authorized')
  test.done()
}
