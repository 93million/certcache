const defaults = { port: 4433 }

module.exports = (upstream) => {
  if (typeof upstream === 'string') {
    const [host, port] = upstream.split(':')

    upstream = { host }

    if (port !== undefined) {
      upstream.port = Number(port)
    }
  }

  return { ...defaults, ...upstream }
}
