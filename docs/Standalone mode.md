# Standalone mode

CertCache doesn't need to be run in a server/client configuration. It can be run in standalone mode which doesn't require a server.

This brings the benefits of being able to use the bundled standalone DNS server ([certbot-dns-standalone](https://github.com/siilike/certbot-dns-standalone)) for DNS-01 validation and the ability to declaratively define certificates in `docker-compose.yml`, but loses the benefits of caching functionality. CertCache without the cache.

In this guide, we will run through setting up a simple site protected with a wildcard certificate.

## Setting up a simple site using standalone mode

### 1: Instantiate a server

  * Instantiate a server using Google Cloud/AWS/Linode/whatever and create a DNS `A` record that points your domain to this instance.
  * Install Docker and Docker Compose (see https://docs.docker.com/get-docker/ and https://docs.docker.com/compose/install/)

### 2: Set up DNS

CertCache includes a standalone DNS server ([certbot-dns-standalone](https://github.com/siilike/certbot-dns-standalone)) which means you do not need to configure and supply DNS API credentials. DNS-01 validation can be performed simply by configuring your domain's DNS records as follows:

  * Create an `A` record for `certcache.<your-domain>` that points to your server instance
  * Create an `NS` record for `acme.certcache.<your-domain>` that points to `certcache.<your-domain>`
  * Create a `CNAME` record for `_acme-challenge.<your-domain>` that points to `<your-domain>.acme.certcache.<your-domain>`

Eg. if `<your-domain>` is `example.com` then add a CNAME record for the host `_acme-challenge.example.com` that points to `example.com.acme.certcache.example.com`

### 3: Create a docker-compose file

  * Create a `docker-compose.yml` file and place in a directory on your server instance:

```yaml
version: '3.7'
services:
  nginx:
    container_name: nginx
    restart: unless-stopped
    image: nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./certcache/certs:/etc/certcache/certs:ro
      - ./nginx/config:/etc/nginx/conf.d:ro
      - ./www:/var/www:ro
    command: "/bin/sh -c 'while :; do sleep 36000 & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
  certcache:
    container_name: certcache
    restart: unless-stopped
    image: ghcr.io/93million/certcache
    ports:
      - '53:53/udp'
      - '53:53/tcp'
    volumes:
      - ./certcache/cache:/certcache/cache:rw
      - ./certcache/catkeys:/certcache/catkeys:ro
      - ./certcache/certs:/certcache/certs:rw
    environment:
      CERTCACHE_CERTBOT_EMAIL: <your@certbot-email.address>
      CERTCACHE_CERTS: |
        - certName: web
          domains:
            - '<your-domain>'
            - '*.<your-domain>'
```

  * Change `CERTCACHE_CERTBOT_EMAIL` to the email address you provide to `certbot` 'for important account notifications'
  * Replace the placeholders `<your-domain>` in the `CERTCACHE_CERTS` environment variable with your domain. The domain `*.<your-domain>` creates a wildcard certificate - it is useful if you want to host your website on the main domain and also multiple subdomains (eg. `example.com`, `www.example.com`, `anything.example.com`)

### 4: Create an Nginx site

  * Create an Nginx config file at `./nginx/config/000-default.conf` (relative to `docker-compose.yml`)

```
server {
  listen 443 ssl http2 default_server;
  listen [::]:443 ssl http2 default_server;
  ssl_certificate /etc/certcache/certs/web/fullchain.pem;
  ssl_certificate_key /etc/certcache/certs/web/privkey.pem;

  server_name _;

  root /var/www/;
}

server {
  listen 80 default_server;
  listen [::]:80;

  server_name _;

  location / {
    return 301 https://$host$request_uri;
  }
}
```

### 5: Create a web site

In this guide we will serve static files. A more practicle application would be to traffic requests to another container.

  * Create an HTML file to serve and place it at `./www/index.html` (relative to `docker-compose.yml`):

```html
<!DOCTYPE html>
<html>
    <head>
        <title>CertCache</title>
    </head>
    <body>
        <h1>CertCache HTTPS test</h1>
    </body>
</html>
```

### 6: Start the container

  * Run `docker-compose up -d`

The first time you run this, CertCache will use Certbot to generate the SSL certificates. After they are present they will be kept up-to-date. Nginx will start once the certificates are on disk.

## Testing

You should now be able to access your site by visiting `https://<your-domain>` as well as `https://www.<your-domain>` and also `https://whatever.<your-domain>`. Visiting the insecure version of these sites should forward you to the secure version.

## Example

This is a preconfigured example available in [docker-compose/standalone](../docker-compose/standalone/) for reference. Remember to change the references to `<your-domain>` in `docker-compose.yml`.

## Migrating to CertCache server

In the future, if you decide to take advantage of the cache functionality provided by CertCache server (eg. to avoid Let's Encrypt usage limits), you can migrate to CertCache server with relatively little effort:

  * [Install CertCache Server](Installing%20certcache%20server.md)
  * Copy the `client.catkey` from the server and place in `./catkeys`
  * Change the DNS `A` record that points to `certcache.<your-domain>` to point to your CertCache server installation
  * Set the env variable `CERTCACHE_UPSTREAM` in your CertCache container to `certcache.<your-domain>`
