var knox = require('knox'),
    config = require('./config'),
    client = knox.createClient({
      key: config.s3.key,
      secret: config.s3.secret,
      bucket: config.s3.bucket
    })

exports.client = client
