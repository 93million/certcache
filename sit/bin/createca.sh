#! /usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
OUTPUT_DIR="$DIR/../skel/server/backends/thirdparty"

openssl req \
  -new \
  -x509 \
  -days 9999 \
  -config "$DIR/cnf/ca.cnf" \
  -keyout "$OUTPUT_DIR/ca-key.pem" \
  -out "$OUTPUT_DIR/ca-crt.pem" \
  -nodes \
  2> /dev/null
