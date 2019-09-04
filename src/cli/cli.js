#!/usr/bin/env node

const childProcess = require('child_process')
const yargs = require('yargs')
const path = require('path')
const util = require('util')
const config = require('../config')
const serve = require('../lib/server/serve')
const syncCerts = require('../lib/client/syncCerts')
const getCert = require('../lib/client/getCert')

const execFile = util.promisify(childProcess.execFile)

// eslint-disable-next-line
yargs
  .command(
    'serve',
    'Start certcache server',
    {
      port: {
        alias: 'p',
        default: config.certcachePort,
        description: 'Port to run Certcache server'
      }
    },
    (argv) => {
      serve(argv)
    }
  )
  .command(
    'client',
    'Start client that continuously syncs certs Certcache server',
    {
      host: { alias: 'h' },
      port: {
        alias: 'p',
        default: config.certcachePort,
        description: 'Port to connect to Certcache server'
      }
    },
    (argv) => {
      const syncPeriodically = () => {
        syncCerts().catch((e) => { console.error(`ERROR! ${e}`) })
        setTimeout(syncPeriodically, 1000 * config.clientSyncInterval)
      }
      syncPeriodically()
    }
  )
  .command(
    'sync',
    'Sync certs once and exit',
    {
      host: { alias: 'h' },
      port: {
        alias: 'p',
        default: config.certcachePort,
        description: 'Port to connect to Certcache server'
      }
    },
    (argv) => {
      syncCerts(argv).catch((e) => {
        console.error(`ERROR! ${e}`)
        process.exit(1)
      })
    }
  )
  .command(
    'get',
    'Get a single cert from Certcache server',
    {
      'cert-name': {
        description: 'Certificate name (used for certificate directory name)'
      },
      domains: {
        alias: 'd',
        description: 'List of comma-separated domain domains',
        required: true
      },
      host: {
        alias: 'h',
        description: 'Hostname of Certcache Server'
      },
      'http-redirect-url': {
        description: 'Address of a Certcache server to redirect HTTP-01 ACME challenges to'
      },
      port: {
        alias: 'p',
        default: config.certcachePort,
        description: 'Port to connect to Certcache server'
      },
      'test-cert': {
        alias: 't',
        boolean: true,
        default: false,
        description: 'Generate a test certificate'
      }
    },
    (argv) => {
      getCert(argv).catch((e) => {
        console.error(`ERROR! ${e}`)
        process.exit(1)
      })
    }
  )
  .command(
    'create-keys',
    'Create access keys to allow certcache clients to access certcache server',
    {
      name: {
        alias: 'n',
        description: 'Certcache server hostname',
        required: true
      },
      keydir: {
        default: process.env.CAH_KEYS_DIR ||
          path.resolve(__dirname, '..', '..', 'cahkeys')
      }
    },
    (argv) => {
      const execScript = 'client-authenticated-https'

      execFile(
        execScript,
        ['create-key', '--server', '--keydir', argv.keydir, '--name', argv.name]
      )
        .then(() => {
          execFile(
            execScript,
            ['create-key', '--keydir', argv.keydir, '--name', 'client']
          )
        })
        .catch((err) => {
          console.error(err)
        })
    }
  )
  .demandCommand()
  .strict()
  .argv
