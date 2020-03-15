#! /usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
OUTPUT_DIR="$DIR/../test/server/backends/thirdparty"

cleanup () {
  rm -f "$OUTPUT_DIR/$COMMON_NAME/csr.pem"
}

trap cleanup SIGHUP SIGINT EXIT

while getopts ":n:k:" o; do
  case "${o}" in
    n)
      COMMON_NAME="${OPTARG}"
      ;;
  esac
done
shift $((OPTIND-1))

mkdir -p "$OUTPUT_DIR/$COMMON_NAME"
openssl genrsa -out "$OUTPUT_DIR/$COMMON_NAME/privkey.pem" 4096 \
  2> /dev/null
openssl req \
  -new \
  -subj "/C=GB/ST=Tyne and Wear/L=Newcastle upon Tyne/O=clientAuthenticatedHttps/OU=clientAuthenticatedHttps/CN=$COMMON_NAME" \
  -key "$OUTPUT_DIR/$COMMON_NAME/privkey.pem" \
  -out "$OUTPUT_DIR/$COMMON_NAME/csr.pem" \
  2> /dev/null
openssl x509 \
  -req \
  -days 9999 \
  -in "$OUTPUT_DIR/$COMMON_NAME/csr.pem" \
  -CA "$OUTPUT_DIR/ca-crt.pem" \
  -CAkey "$OUTPUT_DIR/ca-key.pem" \
  -CAcreateserial \
  -CAserial "$OUTPUT_DIR/.srl" \
  -out "$OUTPUT_DIR/$COMMON_NAME/cert.pem" \
  2> /dev/null
