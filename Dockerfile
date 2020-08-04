FROM node:12.16.0-alpine3.11

WORKDIR /certcache/

COPY . /certcachesrc/

ENV NODE_ENV=production

RUN apk update && \
  apk add --no-cache bash certbot openssl python g++ make git && \
  pip3 install -r /certcachesrc/docker/requirements.txt && \
  rm -rf /var/cache/apk/* && \
  npm install --production -g /certcachesrc/

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
