#! /usr/bin/env bash

# TODO remove this

# set -e

# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# SERVER_NAME="$1"

# usage () {
#   echo "$0" "<certcache servername>"
# }

# if [ -z "$SERVER_NAME" ]; then
#   usage
#   exit 1
# fi

# "$DIR/../lib/clientAuthenticatedHttps/bin/create-server-key.sh" -k "$DIR/../../catkeys" -n "$SERVER_NAME"
# "$DIR/../lib/clientAuthenticatedHttps/bin/create-client-key.sh" -k "$DIR/../../catkeys" -n "client"
