/* global test expect */

const generateCertName = require('./generateCertName')
const md5 = require('md5')

const commonName = 'example.com'
const altNames = ['www.example.com', 'www1.example.com']
const isTest = true

test(
  'should generate a certificate from an MD5 hash of the certificate values',
  () => {
    expect(generateCertName(commonName, altNames, { isTest }))
      .toBe(md5(JSON.stringify({ commonName, altNames, isTest })))
  }
)

test(
  'should default to genuine (non-test) certificates unless specified',
  () => {
    expect(generateCertName(commonName, altNames))
      .toBe(md5(JSON.stringify({ commonName, altNames, isTest: false })))
  }
)
