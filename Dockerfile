FROM node:12.16.0-alpine3.11

WORKDIR /certcache/

COPY . /certcachesrc/

ENV NODE_ENV=production

RUN apk update && \
  apk add bash certbot openssl python g++ make git && \
  pip3 install certbot-dns-standalone && \
  rm -rf /var/cache/apk/* && \
  npm install --production -g /certcachesrc/

VOLUME /certcache/cache/
VOLUME /certcache/cahkeys/
VOLUME /certcache/certs/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["serve"]
