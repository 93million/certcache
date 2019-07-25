FROM node:10.16.0-alpine

WORKDIR /certcache/

COPY . /certcache/

RUN apk update
RUN apk add bash certbot openssl python g++ make
RUN npm i

VOLUME /certcache/certs/
VOLUME /certcache/cahKeys/
VOLUME /certcache/letsencrypt/

EXPOSE 80
EXPOSE 4433

CMD ["npm", "start"]
