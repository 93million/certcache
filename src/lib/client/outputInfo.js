const getConfig = require('../getConfig')
const getBackends = require('../getBackends')
const packageJson = require('../../../package.json')
const request = require('../request')

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
  const backends = await getBackends()
  let fields = []
  const sections = []

  sections.push(['Certcache client', fields])
  fields.push(['Version', packageJson.version])
  fields.push([
    'Backends',
    Object.values(backends).map(({ id }) => id).join(', ')
  ])
  fields = []
  sections.push(['Certcache server', fields])
  fields.push(['Server host', config.client.host])
  fields.push(['Server port', config.client.port])

  try {
    const { cahKeysDir, client: { host, port } } = config
    const response = await request({ cahKeysDir, host, port }, 'getInfo')
    const { error, data } = response

    if (response.success !== true) {
      fields.push(['Error', error || 'received unsucessful response'])
    } else {
      fields.push(['Version', data.version])
      fields.push(['Backends', data.backends.join(', ')])
    }
  } catch (e) {
    fields.push(['Error connecting', e.message])
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
