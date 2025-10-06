FROM node:24.9.0-alpine3.21 AS deps

RUN apk update && \
  apk add --no-cache openssl python3 py3-pip && \
  rm -rf /var/cache/apk/*

FROM deps AS certbot-build

COPY ./docker/requirements.txt /certbot/requirements.txt

WORKDIR /certbot/

RUN apk add bash python3 openssl ca-certificates && \
    bash -c "python3 -m venv /certbot/venv && . /certbot/venv/bin/activate && pip install -r /certbot/requirements.txt"

FROM node:24.9.0-alpine3.21 AS certcache-build-deps

RUN apk update && apk add g++ make git

FROM certcache-build-deps AS certcache-build

WORKDIR /certcachesrc/

COPY src /certcachesrc/src
COPY package.json /certcachesrc/package.json
COPY package-lock.json /certcachesrc/package-lock.json

ENV NODE_ENV=production

RUN npm install -g /certcachesrc/ && npm ci --omit=dev

FROM deps AS dist-test-deps

COPY sit/deps /certcachesrc/sit/deps

RUN apk add bash unzip && \
  unameArch="$(uname -m)" && \
  case "$unameArch" in \
    x86_64) ARCH='amd64' ;; \
    aarch64) ARCH='arm64' ;; \
    *) echo >&2 "Ngrok unsupported architecture: $unameArch"; exit 1 ;; \
  esac && \
  tar -zxf /certcachesrc/sit/deps/ngrok-v3-stable-linux-${ARCH}.tgz -C /usr/local/bin

FROM dist-test-deps AS dist-test-npm-deps

ARG NGROK_AUTHTOKEN CERTCACHE_CERTBOT_EMAIL

WORKDIR /certcachesrc/

COPY --from=certcache-build /certcachesrc/package.json /certcachesrc/package.json
COPY --from=certcache-build /certcachesrc/package-lock.json /certcachesrc/package-lock.json

RUN npm ci


FROM dist-test-deps AS dist-test

ARG NGROK_AUTHTOKEN CERTCACHE_CERTBOT_EMAIL

WORKDIR /certcachesrc/

COPY --from=certcache-build /certcachesrc /certcachesrc
COPY --from=dist-test-npm-deps /certcachesrc/node_modules /certcachesrc/node_modules
COPY --from=certbot-build /certbot/venv /certbot/venv
COPY sit /certcachesrc/sit
COPY jest.config.all.js /certcachesrc/jest.config.all.js
COPY jest.config.js /certcachesrc/jest.config.js
COPY jest.config.sit.js /certcachesrc/jest.config.sit.js

RUN bash -c ". /certbot/venv/bin/activate && npm test"

FROM deps AS dist

WORKDIR /certcache/

COPY --from=certcache-build /certcachesrc /usr/local/lib/node_modules/certcache
COPY --from=certbot-build /certbot/venv /certbot/venv
COPY docker/entrypoint.sh /entrypoint.sh

RUN ln -s /usr/local/lib/node_modules/certcache/src/cli/cli.js \
    /usr/local/bin/certcache && \
  chmod +x /entrypoint.sh

VOLUME /certcache/bin/
VOLUME /certcache/cache/
VOLUME /certcache/catkeys/
VOLUME /certcache/certs/
VOLUME /certcache/conf/
VOLUME /certcache/credentials/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["/entrypoint.sh"]

CMD ["client"]
