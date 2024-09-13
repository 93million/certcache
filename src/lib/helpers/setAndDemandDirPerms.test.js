/* global jest test expect */

const setAndDemandDirPerms = require('./setAndDemandDirPerms')
const fs = require('fs')

const mockDir = '/test/mock/dir'
const mockUid = 12
const mockGid = 23
const mockPerms = 0o700
const mockStat = { gid: mockGid, mode: 0o40700, uid: mockUid }
const mockOpts = { gid: mockGid, perms: mockPerms, uid: mockUid }

jest.mock('fs')

fs.stat.mockImplementation((path, callback) => { callback(null, mockStat) })

fs.chown.mockImplementation((path, uid, gid, callback) => {
  callback(null)
})

fs.chmod.mockImplementation((path, mode, callback) => {
  callback(null)
})

test(
  'should resolve when file permissions are as expected',
  async () => {
    await expect(setAndDemandDirPerms(mockDir, mockOpts)).resolves.not.toThrow()
  }
)

test(
  'should run with default opts',
  async () => {
    fs.stat.mockImplementationOnce((path, callback) => {
      callback(null, { ...mockStat, uid: 0, gid: 0 })
    })
    await expect(setAndDemandDirPerms(mockDir)).resolves.not.toThrow()
  }
)

test(
  'should change owners for directories with incorrect owners',
  async () => {
    fs.stat.mockImplementationOnce((path, callback) => {
      callback(null, { ...mockStat, mode: 0o40640 })
    })

    await setAndDemandDirPerms(mockDir, mockOpts)

    expect(fs.chmod)
      .toHaveBeenCalledWith(mockDir, mockPerms, expect.any(Function))
  }
)

test(
  'should change permissions for directories with incorrect permissions',
  async () => {
    fs.stat.mockImplementationOnce((path, callback) => {
      callback(null, { ...mockStat, uid: 45, gid: 67 })
    })

    await setAndDemandDirPerms(mockDir, mockOpts)

    expect(fs.chown)
      .toHaveBeenCalledWith(mockDir, mockUid, mockGid, expect.any(Function))
  }
)

test(
  'should throw error if directories have incorrect owners',
  async () => {
    for (let i = 0; i < 2; i++) {
      fs.stat.mockImplementationOnce((path, callback) => {
        callback(null, { ...mockStat, mode: 0o40640 })
      })
    }

    await expect(setAndDemandDirPerms(mockDir, mockOpts))
      .rejects
      .toThrow([
        'Directory /test/mock/dir has incorrect permissions.',
        'Should be 640 but is 700'
      ].join(' '))
  }
)

test(
  'should throw error if directories have incorrect permissions',
  async () => {
    for (let i = 0; i < 2; i++) {
      fs.stat.mockImplementationOnce((path, callback) => {
        callback(null, { ...mockStat, uid: 45, gid: 67 })
      })
    }

    await expect(setAndDemandDirPerms(mockDir, mockOpts))
      .rejects
      .toThrow([
        'Directory /test/mock/dir has incorrect user id/group id.',
        'Should be uid = 12 gid = 23 but is uid = 45 gid = 67'
      ].join(' '))
  }
)
