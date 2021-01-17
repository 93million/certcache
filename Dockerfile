FROM node:12.16.0-alpine3.11 as deps

RUN apk update && \
  apk add --no-cache openssl python3 bash && \
  rm -rf /var/cache/apk/*

FROM deps as certbot-build

COPY ./docker/requirements.txt /certbot/requirements.txt

RUN apk update && \
  apk add gcc python3-dev libffi-dev openssl-dev musl-dev && \
  pip3 install virtualenv

WORKDIR /certbot/

RUN virtualenv venv

RUN sh -c "source /certbot/venv/bin/activate && pip install -r /certbot/requirements.txt"

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

RUN apk add unzip && \
  npm install && \
  unzip /certcachesrc/sit/deps/ngrok-stable-linux-amd64.zip -d /usr/local/bin && \
  source /certbot/venv/bin/activate && \
  CERTCACHE_CERTBOT_EMAIL=tm_certcache-sit@93m.org npm test

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
VOLUME /certcache/cahkeys/
VOLUME /certcache/certs/
VOLUME /certcache/conf/
VOLUME /certcache/credentials/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["/entrypoint.sh"]

CMD ["client"]
