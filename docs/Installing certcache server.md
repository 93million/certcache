# Installing CertCache server

Instantiate a server to host CertCache server and install Docker and Docker Compose.

See https://docs.docker.com/get-docker/ to install Docker

See https://docs.docker.com/compose/install/ to install Docker Compose

## Configure DNS for CertCache server

Set up a DNS record to host CertCache server. Typically this would be a hostname like `certcache.93million.org` (we will refer to this as `<certcache-server>` below).

From your DNS management control panel, perfrom the following steps:
  * Edit the DNS zone for the domain you want to host CertCache on
  * Add an `A` record for the host `<certcache-server>` that points to the public IP of the machine you are using to host CertCache
  * Add and `NS` record for the host `acme.<certcache-server>` that points to `<certcache-server>`

To give an example running certcache on `certcache.93million.org`:
  * Edit the DNS zone for `93million.org`
  * Add an `A` record for the host `certcache.93million.org` that points to the public IP of the machine you are using to host CertCache
  * Add and `NS` record for the host `acme.certcache.93million.org` that points to `certcache.93million.org`

### ❓How to test

You can test using `dig` on the command line.

To test the `A` record, run `dig <certcache-server> A +short` which should output the IP address of your certcache server. Eg:

```
$ dig certcache.93million.org A +short
10.20.30.40
```

To test the `NS` record, find the name servers of `<certcache-server>` by running `dig <domain> NS +short` (eg. `dig 93million.org NS +short`). This will probably return several name servers. Choose any of them and run `dig acme.<certcache-server> NS @<name-server>`. You should see your certcache server listed in `AUTHORITY SECTION`

```
$ dig 93million.org NS +short
maceio.porkbun.com.
salvador.porkbun.com.
fortaleza.porkbun.com.
curitiba.porkbun.com.
$ dig acme.certcache.93million.org NS @fortaleza.porkbun.com
…
;; AUTHORITY SECTION:
acme.certcache.93million.org. 300 IN	NS	certcache.93million.org.
…
```

## Install Docker Compose config on the server

On your server, create a new dircetory to hold your Docker Compose config

Create a file named `docker-compose.yml` that contains the following:

```yaml
version: '3.7'
services:
  certcacheserver:
    container_name: certcacheserver
    image: ghcr.io/93million/certcache
    restart: unless-stopped
    ports:
      - '53:53/udp'
      - '53:53/tcp'
      - '80:80/tcp'
      - '4433:4433/tcp'
    volumes:
      - ./catkeys/:/certcache/catkeys/:rw
      - ./cache/:/certcache/cache/:rw
    environment:
      CERTCACHE_CERTBOT_EMAIL: <your@certbot-email.address>
    command: ['serve']
```

  * Change `CERTCACHE_CERTBOT_EMAIL` to the email address you provide to `certbot` 'for important account notifications'

## Generate the server and client keys

Run the following command from the directory that contans your `docker-compose.yml` file

```
docker-compose run --rm certcacheserver create-keys
```

This will create server and client keys in your `./catkeys` directory. The client key will be provided to the client to allow it to connect. Protect these keys with your life.

## Certbot DNS and HTTP challenges

### Changing the default challenge

Domains can be validated using the inbuilt `http-01` and `dns-01` challenges. The default challenge is `dns-01`. The default challenge can be changed by setting the env var `CERTCACHE_CERTBOT_DEFAULT_CHALLENGE` to `http-01`.

If you need to set up Certbot plugin challenges, please see the section on how to use [other Certbot DNS plugins](Configure%20Challenges.md#other-certbot-dns-plugins)

### Changing challenges per domain

Optionally, you can define a list of challenges each domain can handle in `CERTCACHE_CERTBOT_DOMAINS` in `docker-compose.yml` in CertCache server.

```yaml
services:
  certcacheserver:
    …
    environment:
      …
      CERTCACHE_CERTBOT_DOMAINS: |
        - domain: 'example.com'
          challenges: ['dns-01', 'http-01']
        - domain: '93million.org'
          challenges: ['http-01']
        - domain: '93m.org'
          challenges: ['dns-01']
```

Given the above example:

  * A single certificate containing the domains `example.com` and `93million.org` would be validated using `http-01` challenges.
  * A certificate for `example.com` and `93m.org` would be validated using `dns-01` challenges.
  * Attempts to generate a certificate for `93million.org` and `93m.org` would fail with an error stating CertCache server is `unable to find a common certbot challenge to generate the requested combination of domains`.

The value of `domain` in `CERTCACHE_CERTBOT_DOMAINS` can be provided as a regular expression by prefixing the value with a tilde (`~`). For example, `~^([^.]+\.)?example.com$` would match `example.com` and subdomains like `secure.example.com`.

If `CERTCACHE_CERTBOT_DOMAINS` is defined, Certbot will only be used to generate certs for the domains listed. By default Certbot is used to generate every domain. If you want to change a challenge for 1 domain only without having to list all other domains explicitly, use a regular expression to match the other domains like this:

```yaml
      CERTCACHE_CERTBOT_DOMAINS: |
        - domain: 'http-01-challenge.example.com'
          challenges: ['http-01']
        - domain: '~.*'
          challenges: ['dns-01']
```

For information about setting up challenges see [Configure challenges.md](Configure%20challenges.md).

## Start the server

Run the following command from the directory that contans your `docker-compose.yml` file on the server

```
docker-compose up -d
```
