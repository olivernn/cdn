var Store = require('./file_store'),
    Identity = require('./identity'),
    db = require('./db').client,
    spawn = require('child_process').spawn,
    uuid = require('node-uuid'),
    fs = require('fs'),
    commandName = 'convert'

var commandOpts = function (obj) {
  return ['-', obj.command, obj.params, '-'].filter(function (el) { return !!el })
}

var identifyProcess = function () {
  return spawn('identify', ['-'])
}

var Image = function (id, appId) {
  this.id = id || uuid.v1()
  this.appId = appId
  this.store = new Store (['/Users/olivernightingale/code/cdn/tmp', this.id].join('/'))
}

Image.create = function (appId, image, fn) {
  var imagePath = image.path,
      stream1 = fs.createReadStream(imagePath),
      image = new Image (null, appId)

  image.saveOriginal(stream1, function (err, identity) {
    if (err) return fn(err)
    image.identity = identity

    image.openWriteStream(function (writeStream) {
      var stream2 = fs.createReadStream(imagePath)
      stream2.pipe(writeStream)
      fn(false, image)
    })
  })
}

Image.find = function (appId, id, fn) {
  db.query('SELECT 1 FROM images WHERE images.id = ? AND images.app_id = ?', [id, appId], function (err, results) {
    if (err) return fn(err)
    if (!results.length) return fn('no image found')

    fn(false, new Image(id, appId))
  })
}

Image.prototype = {
  openWriteStream: function (fn) {
    fn(this.store.createWriteStream())
  },

  openReadStream: function (fn) {
    fn(this.store.createReadStream())
  },

  open: function (processCommand, fn) {
    var process = spawn(commandName, commandOpts(processCommand))

    process.stderr.on('data', function (data) {
      var identity = new Identity (data.toString('ascii'))
      console.log(identity)
      fn(false, process.stdout)
    })

    this.openReadStream(function (readStream) {
      readStream.pipe(process.stdin)
    })
  },

  openConvertStream: function (processCommand, fn) {
    var self = this,
        buffer = '/tmp/' + uuid.v1()

    var process = spawn(commandName, commandOpts(processCommand))

    this.openReadStream(function (readStream) {
      readStream.pipe(process.stdin)

      fn(false, process.stdout)

      self.saveConversion(process.stdout, function (err) {
        if (err) fn(err)
      })
    })
  },

  saveOriginal: function (original, fn) {
    var self = this

    Identity.fromImageStream(original, function (err, identity) {
      if (err) return fn(err)
      
      db.query('INSERT INTO images (id, app_id, mime_type, size, width, height) VALUES (?,?,?,?,?)', [self.id, self.appId, identity.mimeType(), identity.size(), identity.width(), identity.width()], function (err, results) {
        fn(err, identity)
      })
    })
  },

  saveConversion: function (conversion, fn) {
    var self = this

    Identity.fromImageStream(conversion, function (err, identity) {
      if (err) return fn(err)
      
      db.query('INSERT INTO images (id, mime_type, size, width, height, parent_id) VALUES (?,?,?,?,?,?)', [uuid.v1(), identity.mimeType(), identity.size(), identity.width(), identity.width(), self.id], function (err, results) {
        fn(err, identity)
      })
    })
  }
}

module.exports = Image
