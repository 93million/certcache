FROM node:10.16.0-alpine

WORKDIR /certcache/

RUN apk update && \
  apk add bash certbot openssl python g++ make git && \
  npm install "git+https://deploy:zkBrVfQk7KicL7yx7mUy@gitlab.mcelderry.com/app/certcache.git#1.2.0"

VOLUME /certcache/cahkeys/
VOLUME /certcache/certbot/
VOLUME /certcache/certs/

ENV CAH_KEYS_DIR=/certcache/cahkeys/
ENV CERTCACHE_CERTBOT_CONFIG_DIR=/certcache/certbot/
ENV CERTCACHE_CERTS_DIR=/certcache/certs/
ENV PATH="/certcache/node_modules/.bin:${PATH}"

EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["serve"]
