#!/usr/bin/env node

'use strict'

const delimiter = ':$:'

const argv = require('yargs')
  .usage('Usage: $0 <match[:$:specifier]> [options]')
  .option('match', {
    describe: 'matching messages',
    demand: true
  })
  .option('amount', {
    describe: 'amount of messages to receive before logging',
    demand: true
  })
  .option('queue', {
    describe: 'pubsub message queue name',
    default: 'bfx120:BFX2MWPUBc00'
  })
  .option('csv', {
    describe: 'print csv output'
  })
  .argv

const Perf = require('../')

function logCsv (...args) {
  console.log(args.join(';'))
}

const tmp = argv.match.split('|')
const matches = tmp.map((el) => {
  const res = el.split(delimiter)
  if (!res[1]) res[1] = null
  return res
})

const opts = {
  log: argv.csv ? logCsv : console.log,
  delimiter,
  queue: argv.queue
}

const perf = new Perf(
  matches,
  argv.amount,
  opts
)

perf.start()
