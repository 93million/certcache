#!/usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')

// eslint-disable-next-line
Object.values(commands).reduce(
  (acc, { cmd, desc, builder, handler }) => {
    acc.command(cmd, desc, builder, handler)

    return acc
  },
  yargs
)
  .demandCommand()
  .strict()
  .argv
