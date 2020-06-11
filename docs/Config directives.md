# Config directives

## ENV vars and settings config

The CertCache Docker image can be configured through environment variables or a JSON config file. It can also be configured through command arguments if you are using the command line interface.

The sample `docker-compose.yml` examples given throughout the documentation show CertCache being configured using env variables, however an alternative is to create a `conf/settings.json` config file to configure CertCache server and client containers).

Let's take an example of how to move `CERTCACHE_CERTS` and `CERTCACHE_UPSTREAM` from `docker-compose.yml` into `settings.json`. Take the following sample `docker-compose.yml` file as an example:

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
      CERTCACHE_UPSTREAM: <certcache-server>
      CERTCACHE_CERTS: |
        - certName: <cert-name>
          domains:
            - <your-domain-1>
            - '*.<your-domain-1>'
            - <your-domain-2>
          testCert: true
```

Steps involved in moving from env vars to `settings.json`:
  * Create a directory `conf` to hold your settings
  * Map the `conf` directory to `/certcache/conf/` in the container
  * Create a `settings.json` file
  * Create entries in the `settings.json` with the configuration directives that correspond to the `CERTCACHE_CERTS` and `CERTCACHE_UPSTREAM` env variables (see [Config Directives](#config-directives) for a map of env vars to settings config entries)

The updated `docker-compose.yml` file would look like this:

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
      - ./certcache/conf/:/certcache/conf/:rw
```

`./certcache/conf/settings.json`:

```json
{
  "certs": [
    {
      "certName": "<cert-name>",
      "domains": [
        "<your-domain-1>",
        "*.<your-domain-1>",
        "<your-domain-2>"
      ],
      "testCert": true
    }
  ]
}
```

## Config directives

| ENV variable                  | `conf/settings.json` key | CLI arg               | (Docker) default     | Description                                                                                                                                                                                   |
| ------------------------------| -------------------------| --------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `CERTCACHE_CAH_KEYS_DIR`      | `cahKeysDir`             | `--cahkeys`           | `/certcache/cahkeys` | Path to the cahkeys directory that holds authentication keys                                                                                                                                  |
| `CERTCACHE_CERTS_DIR`         | `certDir`                | -                     | `/certcache/certs`   | Path to the `certs` directory where certificates are written                                                                                                                                  |
| `CERTCACHE_CERTS`             | `certs`                  | - [^1]                | -                    | List of certificates to synchronise to CertCache client. Use YAML in env var.                                                                                                                 |
| `CERTCACHE_HTTP_REDIRECT_URL` | `httpRedirectUrl`        | `--http-redirect-url` | -                    | URL of CertCache server to redirect HTTP-01 HTTP requests - useful if CertCache client is being run on a container that a DNS points to that doesn't have an HTTP server to handle reircetion |
| `CERTCACHE_DAYS_RENEWAL`      | `renewalDays`            | `--days`              | 30                   | Number of days before certificates' expiry date to attempt renewal                                                                                                                            |
| `CERTCACHE_PORT`              | `server.port`            | `--port`              | 4433                 | Port that CertCache server runs on                                                                                                                                                            |
| `CERTCACHE_DOMAIN_ACCESS`     | `server.domainAccess`    | -                     | -                    | Control which domains each client can access                                                                                                                                                  |
| `CERTCACHE_SYNC_INTERVAL`     | `syncInterval`           | `--interval`          | 360 (6 hours)        | Number of minutes between synchronising certificates with CertCache server                                                                                                                    |
| `CERTCACHE_UPSTREAM`          | `upstream`               | `--host`              | -                    | Hostname of CertCache server                                                                                                                                                                  |

[^1]: cli arg `-d` or `--domains` is available when running `certcache get` from CLI to get each certificate individually, however there is no cli arg for `certcache client` or `certcache sync`


### Certbot config directives

| ENV variable                          | `conf/settings.json` key              | CLI arg                       |  (Docker) default                  | Description                                                                                                                                          |
| ------------------------------------- | ------------------------------------- | ----------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CERTCACHE_CERTBOT_CONFIG_DIR`        | `extensions.certbot.certdir`          | -                             | `/certcache/cache/certbot/config`  | Path to certbot config directory                                                                                                                     |
| `CERTCACHE_CERTBOT_EXEC`              | `extensions.certbot.certbotExec`      | -                             | searches for `certbot` in PATH     | `certbot` command to use to generate certificates using certbot                                                                                      |
| -                                     | `extensions.certbot.certbotLogsDir`   | -                             | `/certcache/cache/certbot/config`` | Path to certbot logs directory                                                                                                                       |
| -                                     | `extensions.certbot.certbotWorkDir`   | -                             | `/certcache/cache/certbot/work``   | Path to certbot work directory                                                                                                                       |
| `CERTCACHE_CERTBOT_DEFAULT_CHALLENGE` | `extensions.certbot.defaultChallenge` | `--certbot-default-challenge` | dns-01                             | default challenge used to generate certificates using certbot                                                                                        |
| `CERTCACHE_CERTBOT_DOMAINS`           | `extensions.certbot.domains`          | -                             | matches everything                 | Array of domains to match before using certbot to generate certificate. Regexps start with tilde (`~`) eg. `\.93million\.org$`. Use YAML in env var. |
| `CERTCACHE_CERTBOT_EMAIL`             | `extensions.certbot.email`            | `--certbot-email`             | -                                  | Email address you provide to `certbot` 'for important account notifications'                                                                         |
| `CERTCACHE_TEST_CERT`                 | `extensions.certbot.test-cert`        | `--test-cert`                 | false                              | Whether to generate a test certificate (useful when testing)                                                                                         |

### Third party certificate config directives

| ENV variable               | `conf/settings.json` key        | CLI arg | (Docker) default                  | Description                                                 |
| ------------               | ------------------------        | ------- | --------------------------------- | ----------------------------------------------------------- |
| `CERTCACHE_THIRDPARTY_DIR` | `extensions.thirdparty.certDir` | -       | `/certcache/cache/certbot/config` | Path to thirdparty certificate directory (CertCache server) |
