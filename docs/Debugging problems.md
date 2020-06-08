# Debugging problems

## Testing connection from client to server

After generating keys, and starting up your certcache server, you can test connection from the client to the server by running this command the directory your client's `docker-compose.yml` is in:

```bash
docker-compose run --rm certcache test
```

Once you have server and client configured correctly you should see a confirmation message like this:

```
$ docker-compose run --rm certcache test
Connected sucessfully to server certcache.93million.org:4433 running version 0.1.0-beta.0
```

## Viewing logs

If there were errors obtaining certicates there will be log entries in the client and the server.

To view client logs, run `docker-compose logs certcache` from the client. The client logs will only tell you if there were problems retrieving the certificate from the server but won't go into detail.

Viewing logs on the server will provide more information. From the server, run `docker-compose logs certcacheserver`

### Increasing log verbosity

By default the server logs are not very verbose. CertCache uses the npm `debug` package. Viewing debug messages will give further information. Set the env var `DEBUG` to `certcache:*` in the `environment` section of the `certcacheserver` container in your `docker-compose.yml` file:

```yaml
version: '3.7'
services:
  certcacheserver:
    container_name: certcacheserver
    image: 93million/certcache
    …
    environment:
      DEBUG: certcache:*
```

Future logs should contain extra information to help debug problems.

## Viewing certificates in the server cache

It can be useful to view certificates in the server cache. It can give you an idea whether a problem you are experiencing lies in the generation of cert on the server, or in the deployment of certificates from the server to the client.

From the server, run `docker-compose run --rm certcacheserver ls`

This will list certbot and thirdparty certificates in the server cache.
