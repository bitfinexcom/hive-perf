/* eslint-env mocha */

'use strict'

const Redis = require('ioredis')
const assert = require('assert')
const Perf = require('../')

const queue = 'bfxtest'

const log = console.log

function start (perf, cb) {
  const redis = new Redis()

  redis.connect(() => {})
  perf.start(cb)

  return {
    redis,
    stop: function stop () {
      redis.disconnect()
      perf.stop()
    }
  }
}

const msg = JSON.stringify({
  't': 1557767768.6732,
  'seq': 1249389.504654,
  'a': 'te_update_order_mem',
  'o': {
    'id': 7932567514,
    'user_id': 1,
    'pair': 'BTCUSD',
    'v_pair': 'BTCUSD',
    'mseq': 2,
    'active': 0,
    'status': 'EXECUTED @ 10.0(-15.0009)',
    'amount': '0',
    'amount_orig': '-15.0009',
    'hidden': 0,
    'type': 'EXCHANGE LIMIT',
    'type_prev': null,
    'routing': '',
    'price': '10.0',
    'price_avg': '10.0',
    'swap_rate_max': '0.0075',
    'gid': null,
    'cid': 42618293841,
    'cid_date': '2018-01-09',
    'flags': 0,
    'lcy_post_only': 0,
    'placed_id': null,
    'vir': 1,
    'created_at': '2018-01-09T11:50:18.330Z',
    'tif': null,
    'liq_stage': null
  }
})

describe('basic integration', () => {
  it('counts by actions', (done) => {
    const d1 = Date.now()

    const matches = [['te_update_order_mem', null], ['te_custom_event', null]]
    const perf = new Perf(matches, 3, { queue, log })

    const { redis, stop } = start(perf, (err) => {
      if (err) throw err
      redis.publish(queue, 'Hello again!')

      redis.publish(queue, msg)
      redis.publish(queue, msg)

      redis.publish(queue, '"a":"te_custom_event"')
      redis.publish(queue, '"a":"te_custom_event"')
      redis.publish(queue, '"a":"te_custom_event"')
      redis.publish(queue, '"a":"te_custom_event"')
    })

    setTimeout(() => {
      assert.strictEqual(perf.counter[0][1], 2)
      assert.strictEqual(perf.counter[1][1], 1)

      assert.ok(perf.counter[0][2] > d1)
      assert.ok(perf.counter[1][2] > d1)

      stop()

      done()
    }, 30)
  })

  it('supports deep matches', (done) => {
    const d1 = Date.now()

    const matches = [['te_update_order_mem', 'EXECUTED']]
    const perf = new Perf(matches, 5, { queue, log })

    const { redis, stop } = start(perf, (err) => {
      if (err) throw err
      redis.publish(queue, 'Hello again!')

      redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')
      redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')
      redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')

      redis.publish(queue, '"a":"te_update_order_mem",EXECU@10.00')
    })

    setTimeout(() => {
      assert.strictEqual(perf.counter[0][1], 3)
      assert.ok(perf.counter[0][2] > d1)

      stop()
      done()
    }, 30)
  })
})
