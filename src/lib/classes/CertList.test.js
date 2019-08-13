/* global test expect */

const CertList = require('./CertList')

test(
  'should extend Array',
  () => {
    expect(new CertList()).toBeInstanceOf(Array)
  }
)

test(
  'should find certificate in list',
  () => {
    const cert1 = {
      commonName: 'example.com',
      altNames: ['example.com', 'foo.example.com', 'bar.example.com'],
      issuerCommonName: 'Fake LE Intermediate X1'
    }
    const cert2 = {
      commonName: 'foo.bar',
      altNames: ['example.foo.bar', 'test.foo.bar', 'bar.foo.bar'],
      issuerCommonName: 'Fake LE Intermediate X1'
    }
    const list = CertList.from([cert1, cert2])
    expect(list.findCert(cert2.commonName, cert2.altNames, { isTest: true }))
      .toEqual(cert2)
  }
)
