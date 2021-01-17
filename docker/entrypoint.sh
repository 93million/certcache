#! /usr/bin/env sh

stop() {
  kill -s TERM $NODE_PID
}

trap stop TERM

. /certbot/venv/bin/activate
certcache $@ &
NODE_PID=$!
wait $NODE_PID
