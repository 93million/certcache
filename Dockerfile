FROM node:12.16.0-alpine3.11

WORKDIR /certcache/

COPY . /certcachesrc/

RUN apk update && \
  apk add bash certbot openssl python g++ make git && \
  pip3 install certbot-dns-standalone && \
  npm install -g /certcachesrc/

VOLUME /certcache/cahkeys/
VOLUME /certcache/backends/
VOLUME /certcache/certs/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["serve"]
