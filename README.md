<div align="right"><img src="docs/images/93million_logo.svg" alt="93 Million Ltd. logo" height="36" /></div>
<div align="center"><img src="docs/images/certcache_logo.svg" alt="CertCache logo" height="160" /></div>

# CertCache

## What is CertCache?

CertCache is a secure TLS/SSL certificate distribution service. It can do the following things:

* Securely share TLS certificates between a number of clients
* Generate certificates dynamically using Let's Encrypt
* Avoid Let's Encrypt usage limits by serving certificates from a cache
* Share manually downloaded TLS certificates from third parties such as Verisign
* Declaratively define ceritificates within config - either in a JSON config file or in `docker-compose.yml` if using Docker

## Overview

CertCache is run in a server and client configuration. Clients request certificates from the server. If a matching certificate is found in the cache it is served. If no certificate is found it can be generated dynamically using Let's Encrypt.

Certificates are served securely to the client using [client-authenticated-https](https://www.npmjs.com/package/client-authenticated-https). This provides secure encryption and authorisation so that only allowed clients can obtain certificates.

## Usage

This guide will provide a quick overview of how set up CertCache server and client on a system running Docker and Docker Compose. See documentation in [docs/](docs/) for more detailed info.

### Instantiate a server to host CertCache

CertCache runs nicely in Docker. It can also be installed through NPM to run directly on Linux and MacOS. Unfortunately Windows is not supported at this time.

> ⚠️ Warning: CertCache will contain TLS/SSL keys for your domain. It should not be used on shared servers and environments that other people have access to.

Instantiate a server and install Docker and Docker Compose.

### Configure DNS for CertCache server

Create DNS entries:
  * `A` record `certcache.<your-domain>` (refered to as `<certcache-domain>` from now on) which points to your server instance hosting certcache
  * `NS` record `acme.<certcache-domain>` (ie. `acme.certcache.<your-domain>`) which points to `<certcache-domain>`

> 💡It's a good idea to use low TTLs when creating these records. A value of `300` seconds means you will have to wait no more than 5 minutes for any changes to take affect.

See [docs/Configure DNS.md](docs/Configure DNS.md) for more info

### Configure challenges

Configure domains for either HTTP-01 or DNS-01 acme validation (you don't need to configure both). DNS-01 is easier in most cases and allows for wildcard domains.

#### DNS-01

For each domain you want to validate/generate a cert for, create DNS entries:

  * `CNAME` record `_acme-challenge.<domain-to-validate>` that points to `<domain-to-validate>.acme.<certcache-domain>`

Eg. if `<domain-to-validate>` is `93m.co` and `<certcache-domain>` is `certcache.93million.org` then add a CNAME record for the host `_acme-challenge.93m.co` that points to `93m.co.acme.certcache.93million.org`

> 💡It's a good idea to use low TTLs when creating these records. A value of `300` seconds means you will have to wait no more than 5 minutes for any changes to take affect.

#### HTTP-01

For each domain you want to validate/generate a cert for:

  * set up HTTP redirection from `http://<domain-to-validate>/.well-known/acme-challenge` to `http://<certcache-domain>/.well-known/acme-challenge`

See [docs/Configure challenges.md](docs/Configure challenges.md) for more info

## Installing CertCache server

  * Create a new directory with a file named `docker-compose.yml` with these contents:

```yaml
version: '3.7'
services:
  certcacheserver:
    container_name: certcacheserver
    image: 93million/certcache
    restart: unless-stopped
    ports:
      - '53:53/udp'
      - '53:53/tcp'
      - '80:80/tcp'
      - '4433:4433/tcp'
    volumes:
      - ./cahkeys/:/certcache/cahkeys/:rw
      - ./cache/:/certcache/cache/:rw
    environment:
      CERTCACHE_CERTBOT_EMAIL: <your@certbot-email.address>
    command: ['serve']
```

  * Change `CERTCACHE_CERTBOT_EMAIL` to the email address you provide to `certbot` 'for important account notifications'
  * Run `docker-compose run --rm certcacheserver create-keys -n <certcache-domain>`
  * Run `docker-compose up -d`

See [docs/Installing certcache server.md](docs/Installing certcache server.md) for more info

## Installing CertCache client

  * Create a new directory with a file named `docker-compose.yml` with these contents:

```yaml
version: '3.7'
services:
  certcache:
    container_name: certcache
    image: 93million/certcache
    restart: "unless-stopped"
    volumes:
      - ./certcache/cahkeys/:/certcache/cahkeys/:rw
      - ./certcache/certs/:/certcache/certs/:rw
    environment:
      CERTCACHE_UPSTREAM: <certcache-domain>
      CERTCACHE_CERTS: |
        - certName: <cert-name>
          domains:
            - <your-domain-1>
            - '*.<your-domain-1>'
            - <your-domain-2>
          testCert: true
```

  * Change env var `CERTCACHE_UPSTREAM` to contain the address of your CertCache server
  * Change env var `CERTCACHE_CERTS` to list the certificates you want to synchronise with the server
  * Make a directory at `./certcache/cahkeys/` and copy the file `client.cahkey` from the `cahkeys` directory on the server to the client
  * Run `docker-compose up -d`

> ⚠️ the `testCert: true` specified in `CERTCACHE_CERTS` causes CertBot to generate testing certificates. This is useful when testing a setup. Remove `testCert` or set to `false` when you are ready to use valid certs.

See [docs/Installing certcache client.md](docs/Installing certcache client.md) for more info

## Using certificates from other containers

Certificates are installed into `/certcache/certs/` in the CertCache client container. Map a volume to this path and share with containers to let them access the certificates.

See [docs/Using certificates.md](docs/Using certificates.md) for more info

## Configuring CertCache

As has been shown in the examples, CertCache is configured through environment variables. It can also be configured through a JSON config file (also through command arguments if you are using the command line interface).

For a list of environment variables and config directives, please see [docs/Config directives.md](docs/Config directives.md).

<Debugging problems>

## Alternatives

[cert-manager](https://cert-manager.io/) is a full featured solution for Kubernetes.

## Tests

> ⚠️ Integration tests requires `openssl` (which most platforms already have) and [ngrok](https://ngrok.com/) to be installed.

Run unit tests:

```
npm run test:unit
```

Run integration tests:

```
CERTCACHE_CERTBOT_EMAIL=<your@certbot-email.address> npm run test:sit
```

Run all tests:

```
CERTCACHE_CERTBOT_EMAIL=<your@certbot-email.address> npm test
```

> ℹ️ `CERTCACHE_CERTBOT_EMAIL` is passed to certbot when getting certificates

## License and copyright

All logos, images and artwork are copyright 93 Million Ltd. and used by permission for this project only.

Code is released under the [MIT](LICENSE) license


*Copyright 93 Million Ltd. All rights reserved*

<div align="center"><img src="docs/images/93million_logo.svg" alt="93 Million Ltd. logo" height="60" /></div>

