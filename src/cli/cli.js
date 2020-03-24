#!/usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')
const getBackends = require('../lib/getBackends')

const addCommandGroup = (command, group) => {
  return Object.keys(command).reduce(
    (acc, cmd) => {
      return {
        ...acc,
        [cmd]: { ...command[cmd], group }
      }
    },
    {}
  )
}

const handleExec = async () => {
  const backends = await getBackends()

  // eslint-disable-next-line
  Object
    .keys(commands)
    .reduce(
      (acc, key) => {
        const { cmd, desc, handler } = commands[key]
        let builder = commands[key].builder

        Object.keys(backends).forEach((backend) => {
          const { commandArgs = {} } = backends[backend]

          if (commandArgs[key] !== undefined) {
            const extendedArgs = addCommandGroup(
              commandArgs[key],
              `Backend: ${backend}`
            )

            builder = { ...extendedArgs, ...builder }
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
