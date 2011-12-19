var express = require('express'),
    app = express.createServer(),
    fs = require('fs'),
    Image = require('./lib/image'),
    Signiture = require('./lib/signiture')

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger({
    'format': ':date :method :url :status - :response-time ms'
  }))
});

var authorizeFromUrl = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')

  var signiture = Signiture.fromUrl(req.url)
  signiture.authorized() ? next() : res.send(401)
}

var authorizeFromObj = function (req, res, next) {
  var signiture = Signiture.fromObj(extractProcessCommand(req.params.process))
  signiture.authorized() ? next() : res.send(401)
}

var extractProcessCommand = function (processString) {
  return JSON.parse(new Buffer(processString, 'base64').toString('ascii'))
}

app.options('/image', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  res.send()
})

app.post('/image', authorizeFromUrl, function (req, res) {
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

app.get('/image/:id/process/:process', authorizeFromObj, function (req, res) {
  var processCommand = extractProcessCommand(req.params.process),
      image = Image.find(req.params.id)

  image.openConvertStream(processCommand, function (convertStream) {
    convertStream.pipe(res)
  })
})

app.listen(3000)

console.log(new Date, 'CDN starting')