const findCertificate = require('./findCertificate')

const cert1 = {
  subject: {commonName: 'example.com'},
  altNames: ['www.example.com', 'www1.example.com', 'foo.example.com'],
  issuer: {commonName: 'SuperCA'}
}
const cert2 = {
  subject: {commonName: 'bar.com'},
  altNames: ['www.bar.com', 'www1.bar.com', 'foo.bar.com'],
  issuer: {commonName: 'SuperCA'}
}
const cert3 = {
  subject: {commonName: 'dibber.dob'},
  altNames: ['www.dibber.dob', 'www1.dibber.dob', 'foo.dibber.dob'],
  issuer: {commonName: 'Fake LE Root X1'}
}
const certList = [cert1, cert2, cert3]

test(
  'should return certificate when present in a list',
  () => {
    const cert = findCertificate(
      certList,
      cert1.subject.commonName,
      cert1.altNames,
      false
    )

    expect(cert).toEqual(cert1)
  }
)

test(
  'should return undefined when no certificate present',
  () => {
    const cert = findCertificate(
      certList,
      cert1.subject.commonName,
      cert2.altNames,
      false
    )

    expect(cert).toEqual(undefined)
  }
)

test(
  'should differentiate between real and test certificates',
  () => {
    const genuineSearch = findCertificate(
      certList,
      cert3.subject.commonName,
      cert3.altNames,
      false
    )
    const testSearch = findCertificate(
      certList,
      cert3.subject.commonName,
      cert3.altNames,
      true
    )

    expect(genuineSearch).toEqual(undefined)
    expect(testSearch).toEqual(cert3)
  }
)
