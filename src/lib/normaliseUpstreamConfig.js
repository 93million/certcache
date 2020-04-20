const defaults = { port: 4433 }

module.exports = (host) => {
  if (typeof host === 'string') {
    const [hostName, port] = host.split(':')

    host = { host: hostName }

    if (port !== undefined) {
      host.port = Number(port)
    }
  }

  return { ...defaults, ...host }
}
