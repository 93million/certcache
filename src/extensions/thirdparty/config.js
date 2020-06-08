const defaults = {
  certDir: 'cache/thirdparty'
}

module.exports = ({ argv, env, file }) => {
  return {
    certDir: env.CERTCACHE_THIRDPARTY_DIR ||
      file.certDir ||
      defaults.certDir
  }
}
