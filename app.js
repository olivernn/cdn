var express = require('express'),
    app = express.createServer(),
    fs = require('fs'),
    Image = require('./lib/image'),
    SignedUrl = require('./lib/signed_url')

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

var authorize = function (req, res, next) {
  var signedUrl = new SignedUrl(req.url)
  signedUrl.authorized() ? next() : res.send(401)
}

var extractProcessCommand = function (processString) {
  return JSON.parse(new Buffer(processString, 'base64').toString('ascii'))
}

app.post('/image', authorize, function (req, res) {
  var image = Image.create(req.files.image)

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Location', ['/image', image.id].join())

  res.json({id: image.id}, 201)
})

app.get('/image/:id', function (req, res) {
  var image = Image.find(req.params.id)

  image.openReadStream(function (readStream) {
    readStream.pipe(res)
  })
})

app.get('/image/:id/process/:process', function (req, res) {
  var processCommand = extractProcessCommand(req.params.process),
      image = Image.find(req.params.id)

  image.openConvertStream(processCommand, function (convertStream) {
    convertStream.pipe(res)
  })
})

app.listen(3000)

console.log(new Date, 'CDN starting')