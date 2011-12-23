var fs = require('fs'),
    readStream = fs.createReadStream('Bender.jpg'),
    writeStream1 = fs.createWriteStream('output1.jpg'),
    writeStream2 = fs.createWriteStream('output2.jpg')

readStream.pipe(writeStream1)
readStream.pipe(writeStream2)