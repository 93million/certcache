#! /usr/bin/env sh

set -e

IMAGE="ghcr.io/93million/certcache"

cleanup()
{
  remove_build_image
}

get_version_patch()
{
  jq -r .version package.json
}

get_version_minor()
{
  get_version_patch | sed 's/^\([0-9]\.[0-9]\)\.[0-9]$/\1/'
}

get_version_major()
{
  get_version_patch | sed 's/^\([0-9]\)\.[0-9]\.[0-9]$/\1/'
}

parse_args()
{
  local OPTIND OPTARG flag

  while getopts "t:" flag; do
    case "$flag" in
      t) IMAGE_TAG=$OPTARG;;
    esac
  done
}

remove_build_image()
{
  docker image rm "$IMAGE":build > /dev/null
  docker image rm "$IMAGE":test > /dev/null
}

main()
{
  parse_args "$@"

  if [ ! -z "$IMAGE_TAG" ]; then
    PROD_TAGS=($IMAGE_TAG)
  else
    PROD_TAGS=("latest" "$(get_version_patch)" "$(get_version_minor)" "$(get_version_major)")
  fi

  docker build . \
    --build-arg "NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}" \
    --build-arg="CERTCACHE_CERTBOT_EMAIL=${CERTCACHE_CERTBOT_EMAIL}" \
    -t "${IMAGE}:test" \
    --platform linux/arm64 \
    --progress=plain \
    --target=dist-test

  docker build . \
    --build-arg "NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}" \
    --build-arg="CERTCACHE_CERTBOT_EMAIL=${CERTCACHE_CERTBOT_EMAIL}" \
    -t "${IMAGE}:test" \
    --platform linux/amd64 \
    --progress=plain \
    --target=dist-test

  docker build . \
    -t "${IMAGE}:build" \
    --platform linux/arm64,linux/amd64 \
     --progress=plain

  for TAG in ${PROD_TAGS[@]}; do
    docker tag "$IMAGE":build "$IMAGE:$TAG"
  done
}

trap "cleanup" EXIT
main "$@"
