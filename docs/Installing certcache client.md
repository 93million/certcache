# Installing CertCache client

On your client, create a new directory to hold your Docker Compose config

Inside this directory, create a directory `cahkeys`. Copy the file `cahkeys/client.cahkey` from the server's Docker Compose directory into the client's `cahkeys` directory - this will allow the client to connect to the server.

> ⚠️ `cahkey` files allow CertCache clients to connect to the server - so be careful who you give them to!

Create a file named `docker-compose.yml` that contains the following:

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

## Getting certificate

### Listing certificates in docker-compose.yml

This config will connect to the CertCache server specified in `CERTCACHE_UPSTREAM` and download the certificates listed in `CERTCACHE_CERTS`.

In this example we defined 1 certificate with 3 domain names (alt-names). It will be stored in the directory `certcache/certs/<cert-name>` on the client. If you do not provide a `certName` then the first domain name will be used as the directory name.

> ⚠️ the `testCert: true` specified in `CERTCACHE_CERTS` causes CertBot to generate testing certificates. This is useful when testing a setup. Remove `testCert` or set to `false` when you are ready to use valid certs.

### Getting certificates from the command line

If you do not want to list your certificates in `CERTCACHE_CERTS` in the Docker Compose file, you can get certificates from the command line using the command:

```
docker-compose run --rm certcache get -t  -d <your-domain-1>,<your-domain-2> --cert-name <cert-name>
```

This will store certificates in the `certcache/certs` and they will be kept up to date when you start the client.

## Running an HTTP redirect server

If you are running CertCache client on a host that does not have an HTTP server and want to use HTTP-01 ACME challenges, then you can use the inbuilt HTTP redirect server in CertCache. Add the following line to your `environment` in the `certcache` service of your `docker-compose.yml` file:

```yaml
CERTCACHE_HTTP_REDIRECT_URL: 'http://<certcache-domain>'
```

You will also need to add `80:80/tcp` to the list of `ports` in the `certcache` service of your `docker-compose.yml` file.

If you have an HTTP server that already uses port 80 you not be able to bind the same port to both CertCache and the HTTP server. In this instance you will need to run the `sync` command before starting everything with `docker-compose up`. See the section [Containers that depend on certificates in order to start](#containers-that-depend-on-certificates-in-order-to-start)

## Start the client

Run the following command from the directory that contans your `docker-compose.yml` file on the client

```
docker-compose up -d
```

If everything worked you should be able to see your certificates in the directory `certcache/certs` in the client.

## Containers that depend on certificates in order to start

Often, containers require certificates in order to start. For example Nginx will fail on startup if certificates referenced from config files are missing. Docker will normally restart containers that start with an error, so these will eventually start up successfully once certificates are present on disk.

If this sounds messy and you would prefer not to have logs full of error messages, you can prefetch the certificates using the following command from the CertCache client dir:

```
docker-compose run --rm certcache sync
```

If you defined a `CERTCACHE_HTTP_REDIRECT_URL`, and you want to start an HTTP redirect server to handle HTTP-01 before Nginx is ready, you can run:

```
docker-compose run --rm --ports "80:80/tcp" certcache sync
```

After the command has completed successsfully you can run `docker-compose up -d` and the certificates will be present.