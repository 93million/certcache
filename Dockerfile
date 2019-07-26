FROM node:10.16.0-alpine

WORKDIR /certcache/

COPY . /certcache/

RUN apk update
RUN apk add bash certbot openssl python g++ make
RUN npm i

VOLUME /certcache/cahKeys/
VOLUME /certcache/certbot/
VOLUME /certcache/certs/

EXPOSE 80
EXPOSE 4433

CMD ["npm", "start"]
