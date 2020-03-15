module.exports = ({ argv, env, local }) => {
  return { isTest: argv.test === true }
}
