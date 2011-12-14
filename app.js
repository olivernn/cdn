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
  var readStream = fs.createReadStream(req.files.image.path),
      image = new Image

  image.openWriteStream(function (writeStream) {
    readStream.pipe(writeStream)
  })

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Location', ['/image', image.id].join())

  res.json({id: image.id}, 201)
})

app.get('/image/:id', function (req, res) {
  var image = new Image(req.params.id)

  image.openReadStream(function (readStream) {
    readStream.pipe(res)
  })
})

app.get('/image/:id/process/:process', function (req, res) {
  var processCommand = extractProcessCommand(req.params.process),
      image = new Image(req.params.id, processCommand)

  image.openConvertStream(function (convertStream) {
    convertStream.pipe(res)
  })
})

app.listen(3000)

console.log(new Date, 'CDN starting')