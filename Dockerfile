FROM node:12.16.0-alpine3.11 as deps

RUN apk update && \
  apk add --no-cache openssl python3 && \
  rm -rf /var/cache/apk/*

FROM deps as certbot-build

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
    pip3 install virtualenv; \
    virtualenv venv; \
    bash -c ". /certbot/venv/bin/activate && pip install -r /certbot/requirements.txt"

FROM node:12.16.0-alpine3.11 as certcache-build-deps

RUN apk update && apk add g++ make git

FROM certcache-build-deps as certcache-build

COPY src /certcachesrc/src
COPY package.json /certcachesrc/package.json

ENV NODE_ENV=production

RUN npm install --production -g /certcachesrc/

FROM deps as dist-test

WORKDIR /certcachesrc/

COPY --from=certcache-build /certcachesrc /certcachesrc
COPY --from=certbot-build /certbot/venv /certbot/venv
COPY sit /certcachesrc/sit
COPY jest.config.all.js /certcachesrc/jest.config.all.js
COPY jest.config.js /certcachesrc/jest.config.js
COPY jest.config.sit.js /certcachesrc/jest.config.sit.js

RUN apk add bash unzip && \
  npm install && \
  unzip /certcachesrc/sit/deps/ngrok-stable-linux-amd64.zip -d /usr/local/bin && \
  bash -c ". /certbot/venv/bin/activate &&  CERTCACHE_CERTBOT_EMAIL=tm_certcache-sit@93m.org npm test"

FROM deps as dist

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
