const fs = require('fs')

const readFirstLine = (path) => {
  return new Promise(function (resolve, reject) {
    const readStream = fs.createReadStream(path, { encoding: 'utf8' })
    const chunks = []
    let pos = 0
    let index

    readStream
      .on('data', function (chunk) {
        index = chunk.indexOf('\n')
        chunks.push(chunk)

        if (index !== -1) {
          readStream.close()
        } else {
          pos += chunk.length
        }
      })
      .on('close', function () {
        resolve(chunks.join('').slice(0, pos + index))
      })
      .on('error', function (err) {
        reject(err)
      })
  })
}

module.exports = readFirstLine
