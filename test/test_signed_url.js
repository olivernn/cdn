var SignedUrl = require('./../lib/signed_url.js'),
    url = require('url'),
    queryString = require('querystring'),
    crypto = require('crypto')

var signedUrlFactory = function (path, params) {
  return new SignedUrl ([path, queryString.stringify(params)].join('?'))
}

exports["extracts the timestamp from the url"] = function (test) {
  var signedUrl = new SignedUrl ('/foo?timestamp=1')
  test.equal(signedUrl.timestamp, 1, 'should extract the timestamp from the url')
  test.done()
}

exports["extracts the key from the url"] = function (test) {
  var signedUrl = new SignedUrl ('/foo?key=public_key')
  test.equal(signedUrl.key, 'public_key', 'should extract the public key from the url')
  test.done()
}

exports["extracts the signiture from the url"] = function (test) {
  var signedUrl = new SignedUrl ('/foo?signiture=123abc')
  test.equal(signedUrl.signiture, '123abc', 'should extract the signiture from the url')
  test.done()
}

exports["gets the url to sign"] = function (test) {
  var signedUrl = new SignedUrl ('/foo?signiture=123abc&timestamp=123&key=123')
  test.equal(signedUrl.urlWithoutSigniture, '/foo?timestamp=123&key=123')
  test.done()
}

exports["urls older than 10 minutes are invalid"] = function (test) {
  var signedUrl = signedUrlFactory('/foo', {timestamp: 1, key: 'public', signiture: 'abc'})
  test.ok(!signedUrl.authorized(), 'should be unauthorized when stale (more than 10 minutes old)')
  test.done()
}

exports["urls without a signiture are invalid"] = function (test) {
  var signedUrl = signedUrlFactory('/foo', {timestamp: Date.now(), key: 'public'})
  test.ok(!signedUrl.authorized(), 'should be unauthorixed when no signiture is present')
  test.done()
}

exports["urls without a key are invalid"] = function (test) {
  var signedUrl = signedUrlFactory('/foo', {timestamp: Date.now(), signiture: 'abc'})
  test.ok(!signedUrl.authorized(), 'should be unauthorixed when no key is present')
  test.done()
}

exports["urls where the signiture doesn't match are invalid"] = function (test) {
  var signedUrl = signedUrlFactory('/foo', {timestamp: Date.now(), signiture: 'abc', key: 'test'})
  test.ok(!signedUrl.authorized(), 'should be unauthorised when the signiture is incorrect')
  test.done()
}

exports["urls with a matching signiture are valid"] = function (test) {
  var timestamp = Date.now(),
      path = '/foo?timestamp=' + timestamp + '&key=123',
      hmac = crypto.createHmac("sha1", 'secret'),
      hash = hmac.update(path),
      signiture = hmac.digest('hex'),
      signedUrl = signedUrlFactory('/foo', {timestamp: timestamp, signiture: signiture, key: 123})

  test.ok(signedUrl.authorized(), 'should be authorized')
  test.done()
}
