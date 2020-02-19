# Certcache quick start

## Certcache server and clients

Certcache uses a server and client architecture. Certcache server is run on a specified host, to which clients connect to obtain and renew certificates.

A company might run Certcache on their domain `certcache.example.com`. Clients (typially application servers and load balancers) then connect to this server to obtain and renew Certificates. Authentication is made using client HTTPS keys.

In this quick start guide we will be creating a server running locally at `certcache.localhost` using the `hosts` file. In production you would use something like `certcache.<yourdomain.tld>`.

## NPM install

Install certbot using NPM

```
npm install --global certcache
```

## Create server and client directories

We will be running a local server and client from 2 different directories for this demo.

In this example, we are locating them in the home directory at `~/certcache-demo`, however feel free to place them wherever you want.

```
mkdir ~/certcache-demo ~/certcache-demo/server ~/certcache-demo/client
```

## Generate keys

We will need to generate server and client keys on the server, then copy only the client key to the client.

### Create a server name

You will need to create a server name. This is the name to which clients will connect to obtain certificates and keys.

In this demo we will be editing the `hosts` file. In production you would create a host entry in your company's DNS zone (eg. `certcache.<yourdomain.tld>`)

Add a new line to your `hosts` file to resolve `certcache.localhost` to your loopback address:

On Mac/Linux

```
echo "127.0.0.1 certcache.localhost" | sudo tee -a /etc/hosts
```

On Windows:

```
echo "127.0.0.1 certcache.localhost" >> /proc/cygdrive/c/Windows/System32/Drivers/etc/hosts
```

### Server key

On the server, generate a server/client key pair using the following command:

```
cd ~/certcache-demo/server
certbot --name certcache.localhost
```

There should now be a new directory named `cahkeys` in the current directory.

```
ls -l cahkeys
```

This will show there are 2 keys present:

```
total 32
-rw-r--r--@ 1 pommy  staff  5377 31 Dec 15:26 client.cahkey
-rw-r--r--@ 1 pommy  staff  7858 31 Dec 15:26 server.cahkey
```

`server.cahkey` is used to generate new client keys and validate clients. It must remain only on the certcache server. Do not remove it or send it to any one.

`client.cahkey` should be provided to each Certcache client to allow it to connect. It should be treated very sensitively. It allows anyone with access to it to obtain keys and certificates.

*NB: the server key generated will only work with the name provided (in this example `certcache.localhost`). If this name changes, server and client keys must be regenerated with the new name. Presently, no wildcards or alternative names can be specified in the name.*

### Client key

The client key needs to be copied from the server to the client so it can connect to the server.

```
cd ~/certcache-demo/server
cp cahkeys/client.cahkey ~/certcache-demo/client/cahkeys/
```

### Generating certificiates using Let's Encrypt

Certcache can use Let's Encrypt to generate certificates for requested domains.

In this demo we will use `ngrok` (https://ngrok.com) to quickly create a domain to test using Let's Encrypt.

If you don't want to use ngrok and have access to a domain for testing purposes, you can generatea cert for that domain using something like `ssh -R 80:localhost:80 <ssh host>`. For simplicity we will not cover that in this guide.

Install `ngrok` and create an instance running on port 80 using the command:

`ngrok http 80`

Make a note of the domain from which ngrok is forwarding http requests on port 80 (eg. `example1234.ngrok.io`)

```
ngrok by @inconshreveable                                                                                                                                                                                                                     (Ctrl+C to quit)

Session Status                online
…
Forwarding                    http://example1234.ngrok.io -> http://localhost:80
…

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

#### Certbot authentication methods

Currently only HTTP-01 challenge type is supported so wildcards are not yet available.

## Requesting certificates

Start Certcache server.

You need to provide an email address for use with Let's Encrypt. Please change the value of `CERTCACHE_LETSENCRYPT_EMAIL` to the address you use with LetEncrypt

```
cd ~/certcache-demo/server
CERTCACHE_LETSENCRYPT_EMAIL=test@example.com certcache serve
```

Request a certificate from Certcache client:

```
cd ~/certcache-demo/client
certcache get -h certcache.localhost -d example1234.ngrok.io
```

Certificates that support multiple domains using SAN (subject alternative names) can be requested by separating domains using a comma

```
certcache get -h certcache.localhost -d foo.example.com,bar.example.com,other.93million.com
```

#### ACME validation

In this demo, both the server and the client are accessible on the same domain. In production, a web server will redirect Certbot's ACME validation requests to Certcache server. See the guide on running Certcache in production for further information about how to redirect ACME requests to Certcache server.

### Using certificates from third party providers

Third party certificates and keys can be placed in the directory `backends/thirdparty` in the server. Certificates and keys should be in PEM format. Certificates should have one of the the file extensions `.pem`, `.cer` or `.crt`, keys should use `.pem` or `.key`.

Certificates authority chains are compiled recursively by searching through PEM files stores inside `backends/thirdparty`.

### Listing certificates

Certificates in Certcache server or client can be listed using the `list-certs` command.

From the server:

```
cd ~/certcache-demo/server
certcache list-certs
```

You will see the server certificate listed in the `Backend: certbot` section showing how Certcache generated the certificate.

```
===================
Backend: certbot
===================
Path:         /Users/pommy/certcache-demo/server/backends/certbot/config/live/9972fc1ca6f8c7b3bab0f6b53b2ba052/cert.pem
Common name:  59fdaa31.ngrok.io
Alt names:    59fdaa31.ngrok.io
Issuer:       Let's Encrypt Authority X3
Start date:   Tue Feb 18 2020 14:57:07 GMT+0100 (Central European Standard Time)
End date:     Mon May 18 2020 15:57:07 GMT+0200 (Central European Summer Time)



===================
Backend: thirdparty
===================


===================
Client certs
===================
```

From the client:

```
cd ~/certcache-demo/client
certcache list-certs
```

You will see the server certificate listed in the `Client certs` section showing how Certcache generated the certificate.

```
===================
Backend: certbot
===================


===================
Backend: thirdparty
===================


===================
Client certs
===================
Path:         /Users/pommy/certcache-demo/client/certs/example1234.ngrok.io/cert.pem
Common name:  example1234.ngrok.io
Alt names:    example1234.ngrok.io
Issuer:       Let's Encrypt Authority X3
Start date:   Tue Feb 18 2020 14:57:07 GMT+0100 (Central European Standard Time)
End date:     Mon May 18 2020 15:57:07 GMT+0200 (Central European Summer Time)
```

### Certificate caching

If you re-run the `get` command to get the same certificate again, you will notice it runs much faster. This is because the certificate is being served from the cache.

From `~/certcache-demo/client`, try deleting the `certs` directory and now run the `list-certs` command. No certificates should be listed. Now re-run the same `get` command as before, followed by the `list-certs` command. The certifiate should reappear with the same start/end dates.

As certificates are cached, `certcache` requests are not subject to the same rate limits as `certbot` using Let's Encrypt.

### Renewing certificates

To automatically keep certificates up to date, use the following command:

```
certcache client
```

This will periodically scan local certificates and request new certificates from the server for any certificates expiring within 30 days.

## Using certificates and keys

Certificates in Certcache are stored using the same format as Let's Encrypt certificates.

4 files exist in each directory:

* `chain.pem`: certificate authority chain 
* `cert.pem`: x509 certificate
* `privkey.pem`: private key
* `fullchain.pem`: certificate + CA chain

Use them the same way you would use Let's Encrypt certs

## Rights management

Certcache supports rights management through a YAML formatted environment variable. This is best handled using docker-compose. See the rights management section in the readme for using docker-compose for more information about this.
