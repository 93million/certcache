#! /usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')
const getExtensions = require('../lib/getExtensions')

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
  const extensions = await getExtensions()

  // eslint-disable-next-line
  Object
    .keys(commands)
    .reduce(
      (acc, key) => {
        const { cmd, desc, handler } = commands[key]
        let builder = commands[key].builder

        Object.keys(extensions).forEach((extension) => {
          const { commandArgs = {} } = extensions[extension]

          if (commandArgs[key] !== undefined) {
            const extendedArgs = addCommandGroup(
              commandArgs[key],
              `Extension: ${extension}`
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
