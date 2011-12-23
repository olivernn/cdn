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

var cacheable = function (req, res, next) {
  res.header('Cache-Control', 'public, max-age=31536000')
  next()
}

var extractProcessCommand = function (processString) {
  return JSON.parse(new Buffer(processString, 'base64').toString('ascii'))
}

app.post('/apps/:app_id/images', authorizeFromUrl, function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')

  Image.create(req.params.app_id, req.files.image, function (err, image) {
    if (err) throw(err)
    res.header('Location', ['/image', image.id].join())
    res.json({id: image.id}, 201)
  })
})

app.get('/apps/:app_id/images/:id', cacheable, function (req, res) {
  Image.find(req.params.app_id, req.params.id, function (err, image) {
    if (err) throw(err)

    image.openReadStream(function (readStream) {
      readStream.pipe(res)
    })
  })
})

app.get('/apps/:app_id/images/:id/process/:process', authorizeFromObj, cacheable, function (req, res) {
  var processCommand = extractProcessCommand(req.params.process)

  Image.find(req.params.app_id, req.params.id, function (err, image) {
    image.openConvertStream(processCommand, function (err, convertStream) {
      if (err) throw(err)
      convertStream.pipe(res)
    })
  })
})

app.listen(3000)

console.log(new Date, 'CDN starting')