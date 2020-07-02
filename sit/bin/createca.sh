#! /usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

while getopts ":n:d:" o; do
  case "${o}" in
    d)
      OUTPUT_DIR="${OPTARG}"
      ;;
  esac
done
shift $((OPTIND-1))

mkdir -p "$OUTPUT_DIR"

openssl req \
  -new \
  -x509 \
  -days 9999 \
  -config "$DIR/cnf/ca.cnf" \
  -keyout "$OUTPUT_DIR/ca-key.pem" \
  -out "$OUTPUT_DIR/ca-crt.pem" \
  -nodes \
  2> /dev/null
