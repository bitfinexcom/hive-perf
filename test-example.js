'use strict'

const queue = 'bfx120:BFX2MWPUBc00'
const Redis = require('ioredis')
const redis = new Redis()

redis.connect(() => {
  redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')
  // redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')
  // redis.publish(queue, '"a":"te_update_order_mem",EXECUTED@10.00')

  redis.publish(queue, '"a":"te_update_order_mem"')
  redis.publish(queue, '"a":"te_update_order_mem"')
  redis.publish(queue, '"a":"te_update_order_mem"')
})
