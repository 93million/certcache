FROM node:12.16.0-alpine3.11 as deps

RUN apk update && \
  apk add --no-cache openssl python3 && \
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

COPY . /certcachesrc/

ENV NODE_ENV=production

RUN npm install --production -g /certcachesrc/

FROM deps as dist

WORKDIR /certcache/

COPY --from=certcache-build /certcachesrc /usr/local/lib/node_modules/certcache
COPY --from=certbot-build /certbot/venv /certbot/venv

RUN ln -s /usr/local/lib/node_modules/certcache/src/cli/cli.js \
    /usr/local/bin/certcache && \
  chmod +x /usr/local/lib/node_modules/certcache/docker/entrypoint.sh && \
  ln -s /usr/local/lib/node_modules/certcache/docker/entrypoint.sh \
    /entrypoint.sh

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
