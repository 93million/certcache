#!/usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')
const getBackends = require('../lib/getBackends')

const handleExec = async () => {
  const backends = await getBackends()

  // eslint-disable-next-line
  Object
    .keys(commands)
    .reduce(
      (acc, key) => {
        const { cmd, desc, handler } = commands[key]
        let builder = commands[key].builder

        Object.values(backends).forEach(({ commandArgs = {} }) => {
          if (commandArgs[key] !== undefined) {
            builder = { ...builder, ...commandArgs[key] }
          }
        })

        const args = [
          cmd,
          desc,
          ...[builder, handler].filter((arg) => (arg !== undefined))
        ]

        acc.command(...args)

        return acc
      },
      yargs
    )
    .demandCommand()
    .strict()
    .argv
}

handleExec()
