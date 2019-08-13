FROM node:10.16.0-alpine

WORKDIR /certcache/


RUN apk update && apk add bash certbot openssl python g++ make
COPY . /certcache/
RUN npm i

VOLUME /certcache/cahkeys/
VOLUME /certcache/certbot/
VOLUME /certcache/certs/

EXPOSE 80
EXPOSE 4433

CMD ["npm", "start"]
