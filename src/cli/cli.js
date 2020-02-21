#!/usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')

// eslint-disable-next-line
Object.values(commands).reduce(
  (acc, { cmd, desc, builder, handler }) => {
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
