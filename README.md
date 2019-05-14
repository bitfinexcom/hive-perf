# hive-perf

Tiny performance tool for integrated testing.

```
npm i -g https://github.com/bitfinexcom/hive-perf
```

Prints stats for every X messages, format:

```
msg-name amount time diff

EXECUTED 1000 1557830829647 376
```

## CLI usage

Basic message match, matches all messages with `te_update_order_mem`:

```
hive-perf --match "te_update_order_mem" --amount 2
```

Match multiple messages (`te_update_order_mem` or `te_trade_mem`)

```
hive-perf --match "te_update_order_mem|te_trade_mem" --amount 2
```

Advanced usage, filtering. Matches all messages that contain `te_update_order_mem`
**and** `EXECUTED`, **or** `foo_bar`:

```
hive-perf --match "te_update_order_mem:$:EXECUTED@|foo_bar" --amount=2
```

Pipe into CSV:

```
hive-perf --match "EXECUTED" --amount=2 --csv > results.csv
```
