FROM node:10.16.0-alpine

WORKDIR /certcache/

RUN apk update && \
  apk add bash certbot openssl python g++ make git && \
  npm install "git+https://deploy:zkBrVfQk7KicL7yx7mUy@gitlab.mcelderry.com/app/certcache.git#1.3.0"

VOLUME /certcache/cahkeys/
VOLUME /certcache/backends/
VOLUME /certcache/certs/

ENV CAH_KEYS_DIR=/certcache/cahkeys/
ENV CERTCACHE_CERTBOT_CONFIG_DIR=/certcache/certbot/config/
ENV CERTCACHE_CERTS_DIR=/certcache/certs/
ENV PATH="${PATH}:/certcache/node_modules/.bin"

EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["serve"]
