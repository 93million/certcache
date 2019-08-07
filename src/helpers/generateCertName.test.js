const generateCertName = require('./generateCertName')
const md5 = require('md5')

test(
  'should generate a certificate from an MD5 hash of the certificate values',
  () => {
    const commonName = 'example.com'
    const altNames = ['www.example.com', 'www1.example.com']
    const isTest = true
    const extras = {isTest}

    expect(generateCertName(commonName, altNames, extras))
      .toBe(md5(JSON.stringify({commonName, altNames, extras})))
  }
)
