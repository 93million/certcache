const md5 = require('md5')
const tar = require('tar')
const getLocalCertificates = require('../../helpers/getLocalCertificates')
const util = require('util')
const fs = require('fs')
const arrayItemsMatch = require('../../helpers/arrayItemsMatch')
const uuid = require('uuid')
const generateCert = require('../../helpers/generateCert')
const fileExists = require('../../helpers/fileExists')
const mkdirRecursive = require('../../helpers/mkdirRecursive')
const config = require('../../config')

const readFile = util.promisify(fs.readFile)
const unlink = util.promisify(fs.unlink)
const readdir = util.promisify(fs.readdir)

const findCert = (cachedCertificates, commonName, altNames, isTest) =>
  cachedCertificates.find(
    ({
      subject: {commonName: certCommonName},
      altNames: certAltNames,
      issuer: {commonName: issuerCommonName}
    }) => {
      const certIsTest = (issuerCommonName.indexOf('Fake') !== -1)

      return (
        certIsTest === isTest &&
        certCommonName === commonName &&
        arrayItemsMatch(certAltNames, altNames)
      )
    }
  )

module.exports = async (payload) => {
  const {isTest, domains} = payload
  const [commonName, ...altNames] = domains
  altNames.push(commonName)
  const certbotConfigDir = config.certbotConfigDir
  const tmpDir = config.certcacheTmpDir

  await Promise.all([certbotConfigDir, tmpDir].map(async (dir) => {
    if (await fileExists(dir) === false) {
      await mkdirRecursive(dir)
    }
  }))

  const cachedCertificates = await getLocalCertificates(`${certbotConfigDir}/live/`)
  const cachedCert = findCert(cachedCertificates, commonName, altNames, isTest)
  const tarPath = `${tmpDir}/${uuid()}`
  const certPath = (cachedCert !== undefined)
    ? cachedCert.certPath
    : (await generateCert(commonName, altNames, isTest))
  const files = (await readdir(certPath))
    .filter((file) => file.indexOf('.pem') !== -1)
  await tar.c(
    {file: tarPath, gzip: true, cwd: certPath, follow: true},
    files
  )
  const buffer = await readFile(tarPath)
  await unlink(tarPath)

  return {bundle: buffer.toString('base64')}
}
