const fs = require('fs')
const util = require('util')

const chmod = util.promisify(fs.chmod)
const chown = util.promisify(fs.chown)
const stat = util.promisify(fs.stat)

const setAndDemandDirPerms = async (
  dir,
  { gid = 0, uid = 0, perms = 0o700 } = {}
) => {
  const permsMask = 0o777
  const ownerIsValid = (stat) => (stat.uid === uid && stat.gid === gid)
  const permsAreValid = (stat) => ((stat.mode & permsMask ^ perms) === 0)

  let parentDirStat = await stat(dir)

  if (!ownerIsValid(parentDirStat) || !permsAreValid(parentDirStat)) {
    if (!ownerIsValid(parentDirStat)) {
      await chown(dir, uid, gid)
    }

    if (!permsAreValid(parentDirStat)) {
      await chmod(dir, perms)
    }

    parentDirStat = await stat(dir)

    if (!ownerIsValid(parentDirStat)) {
      throw new Error([
        'Directory',
        dir,
        'has incorrect user id/group id. Should be uid =',
        uid,
        'gid =',
        gid,
        'but is uid =',
        parentDirStat.uid,
        'gid =',
        parentDirStat.gid
      ].join(' '))
    }

    if (!permsAreValid(parentDirStat)) {
      throw new Error([
        'Directory',
        dir,
        'has incorrect permissions. Should be',
        (parentDirStat.mode & permsMask).toString(8),
        'but is',
        perms.toString(8)
      ].join(' '))
    }
  }
}

module.exports = setAndDemandDirPerms
