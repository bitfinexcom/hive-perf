'use strict'

const EventEmitter = require('events')
const Redis = require('ioredis')

class Perf extends EventEmitter {
  constructor (matches, amount, opts) {
    super()

    this.counter = {}
    this.amount = amount

    this.queue = opts.queue
    this.qBuf = Buffer.from(opts.queue)
    this.delimiter = opts.delimiter || ':$:'
    this.log = opts.log

    this.matches = this.createMatches(matches)
  }

  start (cb = () => {}) {
    const redis = this.redis = new Redis()
    redis.subscribe(this.queue, (err, _count) => {
      if (err) return cb(err)

      cb(null)
    })

    redis.on('messageBuffer', (ch, msg) => {
      if (!ch.equals(this.qBuf)) {
        return
      }

      this.count(msg)
    })
  }

  count (msg) {
    const m = this.matches
    const amount = this.amount
    const counter = this.counter

    for (let i = 0; i < m.length; i++) {
      if (!msg.includes(m[i][0])) {
        continue
      }

      if (m[i][1] === null) {
        counter[i][1] = counter[i][1] + 1

        if (!counter[i][2]) {
          counter[i][2] = Date.now()
        }

        if (counter[i][1] === amount) {
          const now = Date.now()
          const diff = now - counter[i][2]
          counter[i][1] = 0
          counter[i][2] = now

          this.log(counter[i][0], amount, counter[i][2], diff)
        }

        break
      }

      if (!msg.includes(m[i][1])) {
        continue
      }

      counter[i][1] = counter[i][1] + 1
      if (!counter[i][2]) {
        counter[i][2] = Date.now()
      }

      if (counter[i][1] === amount) {
        const now = Date.now()
        const diff = now - counter[i][2]
        counter[i][1] = 0
        counter[i][2] = now

        this.log(counter[i][0], amount, counter[i][2], diff)
      }
    }
  }

  stop () {
    this.redis.unsubscribe(this.queue)
    this.redis.disconnect()
  }

  createMatches (matches) {
    const res = matches.map((el) => {
      const scnd = el[1] ? Buffer.from(el[1]) : null

      return [ Buffer.from(el[0]), scnd ]
    })

    matches.forEach((el, i) => {
      el = el[1] ? el.join(this.delimiter) : el[0]
      this.counter[i] = [ el, 0, null ]
    })

    return res
  }
}

module.exports = Perf
