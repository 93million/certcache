# Configuring challenges

## DNS challenges

DNS challenges are in some ways more flexable than HTTP challenges in that they do not require an HTTP server to redirect challenges to CertCache server.

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/dns-01_diagram-dark.svg" width="70%" />
    <img alt="DNS-01 challenge diagram" src="images/dns-01_diagram.svg" width="70%" />
  </picture>
</div>

### Standalone DNS-01 challenge

By default, CertCache generates certificates using Cerbot using a plugin that provides a standalone DNS server ([certbot-dns-standalone](https://github.com/siilike/certbot-dns-standalone)) which doesn't require DNS API credentials. Configuration simply involves creating a CNAME entry for each domain you want to create certificates for

The benefits for the standalone DNS plugin:

  * simple - just create a CNAME record to vaildate a domain. No API or Certbot plugins required
  * unified method of validation that works with every DNS provider
  * domain owners can delegate ability to CertCache users to generate certificates without giving away DNS API credentials

The drawbacks:

  * you have to create a CNAME entry for each domain you want to create certificates for. This is something that can be done automatically by a Certbot DNS plugin.

The drawback may not be such a hassle - you could generate a wildcards certificate (eg. `*.example.com`) which can be used with unlimited subdomains.

#### Configuring DNS for the standalone DNS-01 challenge

From your DNS management control panel, perfrom the following steps:
  * Edit DNS for the domain you want to validate
  * For each domain you want to validate, add a `CNAME` record for the host `_acme-challenge.<cert-domain>` that points to `<cert-domain>.acme.<certcache-server>`

To give an example validating the domains `93m.co` and `test.93m.co`, running CertCache server at `certcache.93million.org`
  * Edit DNS for `93m.co`
  * Add a CNAME record for the host `_acme-challenge.93m.co` that points to `93m.co.acme.certcache.93million.org`
  * Add a CNAME record for the host `_acme-challenge.test.93m.co` that points to `test.93m.co.acme.certcache.93million.org`

This will allow you to generate certificate for the domains `93m.co` and `test.93m.co`, including wildcard certificates (eg. `*.93m.co` and `*.test.93m.co`)

> ⚠️ Warning: it's important to recognise that by adding CNAME records for `_acme-challenge` hosts, we are giving `certcache.93million.org` the ability to generate TLS/SSL certificates for these domains. Be very cautious when creating `_acme-challenge` records.

#### ❓How to test

You can test using `dig` on the command line. Running `dig _acme-challenge.<cert-domain> CNAME +short` should output `<cert-domain>.acme.<certcache-server>.`. Eg:

```
$ dig _acme-challenge.test.93m.co CNAME +short
test.93m.co.acme.certcache.93million.org.
```

### Other Certbot DNS plugins

CertCache supports the following Certbot DNS plugins:

  * certbot-dns-cloudflare
  * certbot-dns-cloudxns
  * certbot-dns-digitalocean
  * certbot-dns-dnsimple
  * certbot-dns-dnsmadeeasy
  * certbot-dns-google
  * certbot-dns-linode
  * certbot-dns-luadns
  * certbot-dns-nsone
  * certbot-dns-ovh
  * certbot-dns-rfc2136
  * certbot-dns-route53

To use them you will need to add `CERTCACHE_CERTBOT_CHALLENGES` to the env vars in your CertCache server `docker-compose.yml` and list the args and environment variables that should be passed to `certbot` command. Eg:

```yaml
services:
  certcacheserver:
    container_name: certcacheserver
    volumes:
      - ./catkeys/:/certcache/catkeys/:rw
      - ./cache/:/certcache/cache/:rw
      - ./credentials/:/certcache/credentials/:ro
    environment:
      CERTCACHE_CERTBOT_CHALLENGES: |
        dns_route53:
          args:
            - '--dns-route53-propagation-seconds'
            - '1000'
          environment:
            AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE'
            AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      CERTCACHE_CERTBOT_DEFAULT_CHALLENGE: dns_route53
```

See https://certbot.eff.org/docs/using.html#dns-plugins for instructions about which args and environment variales to use.

If the DNS plugin required that you provide credentials for your DNS provider, you can mount them at `/certcache/credentials/` and reference them from the challenge args list.

We set `CERTCACHE_CERTBOT_DEFAULT_CHALLENGE` to `dns_route53`. This means that all domains will be generated using this challenge unless they specify another challenge.

If you want to define that domains use specific challenges, you need to list them in the `CERTCACHE_CERTBOT_DOMAINS` env var in the CertCache server container. Eg:

```yaml
      CERTCACHE_CERTBOT_DOMAINS: |
        - domain: 'example.com'
          challenges: ['dns_route53', 'dns-01', 'http-01']
        - domain: '93million.org'
          challenges: ['http-01']
        - domain: '93m.org'
          challenges: ['dns_route53', 'dns-01']
```

When generating a certificate which contains multiple domains, any common challenges will used.

### Using certificate authorities other than Let's Encrypt

Certbot can be configured to use other CAs that support the ACME protocol. You can define an ACME server to use with Certbot by setting the env var `CERTCACHE_CERTBOT_SERVER`. If you need to pass an eab kid and eab hmac key you can use env vars `CERTCACHE_CERTBOT_EAB_KID` and `CERTCACHE_CERTBOT_EAB_HMAC_KEY`. For eaxample, to use with [ZeroSSL's free ACME certificates](https://zerossl.com/documentation/acme/):

```yaml
services:
  certcacheserver:
    container_name: certcacheserver
    volumes:
      - ./catkeys/:/certcache/catkeys/:rw
      - ./cache/:/certcache/cache/:rw
    environment:
      CERTCACHE_CERTBOT_SERVER: 'https://acme.zerossl.com/v2/DV90'
      CERTCACHE_CERTBOT_EAB_KID: 'YOUR_EAB_KID'
      CERTCACHE_CERTBOT_EAB_HMAC_KEY: 'YOUR_EAB_HMAC_KEY'
```

Alternatively, if you want to use an alternative CA for certificates generated for only some specific domains, this can be achieved by adding the `--server`, `--eab-kid` and `--eab-hmac-key` arguments to the challenge args. Eg: to use ZeroSSL with the standalone DNS plugin:

```yaml
services:
  certcacheserver:
    container_name: certcacheserver
    volumes:
      - ./catkeys/:/certcache/catkeys/:rw
      - ./cache/:/certcache/cache/:rw
    environment:
      CERTCACHE_CERTBOT_CHALLENGES: |
        dns_zero_ssl:
          args:
            - '--authenticator'
            - 'dns-standalone'
            - '--server'
            - 'https://acme.zerossl.com/v2/DV90'
            - '--eab-kid'
            - 'YOUR_EAB_KID'
            - '--eab-hmac-key'
            - 'YOUR_EAB_HMAC_KEY'
      CERTCACHE_CERTBOT_DEFAULT_CHALLENGE: dns_zero_ssl
```

### HTTP challenges

For HTTP validation you will need to be running an HTTP server on the domains you want to validate. A redirection rule needs to be set up for each domain to perform HTTP validation.

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/http-01_diagram-dark.svg" width="70%" />
    <img alt="HTTP-01 challenge diagram" src="images/http-01_diagram.svg" width="70%" />
  </picture>
</div>

The following example shows how to configure Nginx to validate the domains `93m.co` and `secure.93m.co`, running certcache on `certcache.93million.org`

Edit your Nginx config and add a redirection rule for the location `/.well-known/acme-challenge`:

```
server {
  listen 80;
  listen [::]:80;

  server_name 93m.co secure.93m.co;

  location /.well-known/acme-challenge {
    return 301 http://certcache.93million.org$request_uri;
  }
}
```

This will redirect requests from `http://93m.co/.well-known/acme-challenge/<path>` to `http://certcache.93million.org/.well-known/acme-challenge/<path>`.

Note you can use wildcards and regular expressions in Nginx's `server_name` to reduce configuration duplication, however HTTP validation is not capable of creating certificates with wildcard domains.

If you are using Apache, you can redirect requests using `mod_rewrite`'s `Redirect` directive.

#### ❓How to test

You can test using `curl` on the command line. Running `curl -v http://<cert-domain>/.well-known/acme-challenge/foo` should output a `Location:` header showing redirection. Eg:

```
$ curl -v http://93m.co/.well-known/acme-challenge/foo
* Connected to 93m.co (139.162.213.98) port 80 (#0)
> GET /.well-known/acme-challenge/foo HTTP/1.1
…
< Location: http://certcache.93million.org/.well-known/acme-challenge/foo
…
```

### Not running an HTTP server?

If you want to use HTTP-01 validation but not have HTTP servers running on your domains, you can use the inbuilt HTTP server in CertCache to handle validation. See section [Running an HTTP redirect server](./Installing%20certcache%20client.md#running-an-http-redirect-server).
