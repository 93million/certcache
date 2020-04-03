module.exports = (domainsConfig) => {
  return domainsConfig.map((item) => {
    if (typeof item === 'string') {
      item = item.split(',')
    }

    if (Array.isArray(item)) {
      item = { certName: item[0], domains: item }
    } else {
      if (typeof item.domains === 'string') {
        item.domains = item.domains.split(',')
      }

      if (item.certName === undefined) {
        item.certName = item.domains[0]
      }
    }

    item.domains = item.domains.map((domain) => domain.trim())

    return item
  })
}
