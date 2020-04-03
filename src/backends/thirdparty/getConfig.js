const defaults = {
  server: {
    certDir: 'backends/thirdparty'
  }
}

module.exports = ({ argv, env, file }) => {
  return {
    server: {
      certDir: env.CERTCACHE_THIRDPARTY_DIR ||
        file.server.certDir ||
        defaults.server.certDir
    }
  }
}
