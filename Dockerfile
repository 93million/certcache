FROM node:12.16.0-alpine3.11

WORKDIR /certcache/

RUN apk update && \
  apk add bash certbot openssl python g++ make git && \
  npm install -g "git+https://deploy:zkBrVfQk7KicL7yx7mUy@gitlab.mcelderry.com/app/certcache.git#backend-thirdparty"

VOLUME /certcache/cahkeys/
VOLUME /certcache/backends/
VOLUME /certcache/certs/

EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["certcache"]

CMD ["serve"]
