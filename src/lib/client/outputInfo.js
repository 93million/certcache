const getConfig = require('../getConfig')
const getExtensions = require('../getExtensions')
const packageJson = require('../../../package.json')
const request = require('../request')
const canonicaliseUpstreamConfig = require('../canonicaliseUpstreamConfig')

const getField = ([title, val], maxTitleLength) => {
  return (val === undefined)
    ? `  ${title}`
    : [
      `  ${title}:`.padEnd(maxTitleLength, ' '),
      val
    ].join('')
}

const getSection = ([title, fields], maxTitleLength) => {
  return [title, ...fields.map(
    (field) => getField(field, maxTitleLength)
  )]
}

const getInfo = async () => {
  const config = await getConfig()
  const extensions = await getExtensions()
  let fields = []
  const sections = []

  sections.push(['General', fields])
  fields.push(['Version', packageJson.version])
  fields.push([
    'Extensions',
    Object.values(extensions).map(({ id }) => id).join(', ')
  ])

  const { upstream } = config
  const { host, port } = canonicaliseUpstreamConfig(upstream)

  fields = []
  sections.push(['Upstream', fields])

  if (host === '--internal') {
    fields.push(['Server host', 'standalone'])
  } else {
    fields.push(['Server host', host])
    fields.push(['Server port', port])
    try {
      const { catKeysDir } = config

      const data = await request({ catKeysDir, host, port }, 'getInfo')

      fields.push(['Version', data.version])
      fields.push(['Extensions', data.extensions.join(', ')])
    } catch (e) {
      fields.push(['Error connecting', e.message])
    }
  }

  const maxTitleLength = Math.max(
    ...sections.map(([title, fields]) => Math.max(
      ...fields.map(([{ length }]) => length + 12)
    ))
  )

  const lines = sections.reduce(
    (acc, section) => [...acc, ...getSection(section, maxTitleLength)],
    []
  )

  return lines.join('\n')
}

module.exports = async () => {
  console.log(await getInfo())
}
