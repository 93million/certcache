FROM node:12.16.0-alpine3.11 as deps

COPY ./docker/requirements.txt /certcache/docker/requirements.txt

RUN apk update && \
  apk add --no-cache certbot openssl python && \
  pip3 install -r /certcache/docker/requirements.txt && \
  rm -rf /var/cache/apk/* && \
  ln -s /usr/local/lib/node_modules/certcache/src/cli/cli.js \
  /usr/local/bin/certcache

FROM node:12.16.0-alpine3.11 as build-deps

RUN apk update && apk add g++ make git

FROM build-deps as build

COPY . /certcachesrc/

ENV NODE_ENV=production

RUN npm install --production -g /certcachesrc/

FROM deps as dist

WORKDIR /certcache/

COPY --from=build /certcachesrc /usr/local/lib/node_modules/certcache

VOLUME /certcache/bin/
VOLUME /certcache/cache/
VOLUME /certcache/cahkeys/
VOLUME /certcache/certs/
VOLUME /certcache/conf/
VOLUME /certcache/credentials/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["client"]
