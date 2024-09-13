FROM node:24.9.0-alpine3.21 AS deps

RUN apk update && \
  apk add --no-cache openssl python3 py3-pip && \
  rm -rf /var/cache/apk/*

FROM deps AS certbot-build

COPY ./docker/requirements.txt /certbot/requirements.txt

WORKDIR /certbot/

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.50.0

RUN set -eux; \
    apkArch="$(apk --print-arch)"; \
    case "$apkArch" in \
        x86_64) rustArch='x86_64-unknown-linux-musl'; rustupSha256='05c5c05ec76671d73645aac3afbccf2187352fce7e46fc85be859f52a42797f6' ;; \
        aarch64) rustArch='aarch64-unknown-linux-musl'; rustupSha256='6a8a480d8d9e7f8c6979d7f8b12bc59da13db67970f7b13161ff409f0a771213' ;; \
        *) echo >&2 "unsupported architecture: $apkArch"; exit 1 ;; \
    esac; \
    url="https://static.rust-lang.org/rustup/archive/1.23.1/${rustArch}/rustup-init"; \
    wget "$url"; \
    echo "${rustupSha256} *rustup-init" | sha256sum -c -; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --profile minimal --default-toolchain $RUST_VERSION --default-host ${rustArch}; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME; \
    rustup --version; \
    cargo --version; \
    rustc --version; \
    apk add bash gcc python3-dev libffi-dev openssl-dev musl-dev ca-certificates; \
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
