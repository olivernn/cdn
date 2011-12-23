var Identity = require('./../lib/identity.js'),
    fs = require('fs');

var identityFactory = function (s) {
  s || (s = '-=>/var/folders/q8/r8v1qxb54l3_mtnj6kd4g0kw0000gn/T/magick-tsJu5Cne JPEG 375x500 375x500+0+0 8-bit DirectClass 23.3KB 0.000u 0:00.000')
  return new Identity (s)
}

exports['parsing mime type from a raw identify output string'] = function (test) {
  var identity = identityFactory()
  test.equal(identity.mimeType(), 'image/jpeg', 'should generate a correct mime type for this identity')
  test.done()
}

exports['parsing size from a raw identify output string'] = function (test) {
  var identity = identityFactory()
  test.equal(identity.size(), 23859, 'should return the image size in bytes')
  test.done()
}

exports['parsing width from a raw identity output string'] = function (test) {
  var identity = identityFactory()
  test.equal(identity.width(), 375, 'should return the width as an integer')
  test.done()
}

exports['parsing height from a raw identity output string'] = function (test) {
  var identity = identityFactory()
  test.equal(identity.height(), 500, 'should return the height as an integer')
  test.done()
}

exports['generating an identity from a read stream'] = function (test) {
  var readStream = fs.createReadStream('./../Bender.jpg')

  Identity.fromImageStream(readStream, function (err, identity) {
    test.equal(identity.height(), 404, 'should get the correct height')
    test.equal(identity.width(), 303, 'should get the correct height')
    test.equal(identity.size(), 21094, 'should get the correct size')
    test.equal(identity.mimeType(), 'image/jpeg', 'should get the correct mime type')
    test.done()
  })
}

exports['throwing an error when there is an error from the command'] = function (test) {
  var readStream = fs.createReadStream('./runner')

  Identity.fromImageStream(readStream, function (err, identity) {
    test.ok(err, 'should return an error if there was a problem with the identity command')
    test.done()
  })
}