# ECDSA Certificates

## Using ECDSA for certs defined in `CERTCACHE_CERTS`

CertCache supports generating and caching of ECDSA certificates.

ECDSA algorithms can be requested for each cert defined in `CERTCACHE_CERTS` separately:

```yaml
version: '3.7'
services:
  certcache:
    container_name: certcache
      …
      CERTCACHE_CERTS: |
        - certName: cert1
          domains:
            - '<cert-domain-1>'
            - '*.<cert-domain-1>'
          keyType: ecdsa
        - certName: cert2
          domains:
            - '<cert-domain-2>'
            - '*.<cert-domain-2>'
```

In this example, `cert1` will have an ECDSA public key algorithm, while `cert2` will use the default algorithm of RSA.

If you want to use ECDSA for all certificates that do not specify a `keyType`, set the default algorithm using the env var `CERTCACHE_KEY_TYPE`:

```yaml
version: '3.7'
services:
  certcache:
    container_name: certcache
      …
      CERTCACHE_CERTS: |
        - certName: cert1
          domains:
            - '<cert-domain-1>'
            - '*.<cert-domain-1>'
        - certName: cert2
          domains:
            - '<cert-domain-2>'
            - '*.<cert-domain-2>'
      CERTCACHE_KEY_TYPE: ecdsa
```

The default curve is `secp256r1`. The elliptic curve can be defined separately within each certificate within `CERTCACHE_CERTS`, or changed for all certs (that don't define an `ellipticCurve`) using the env var `CERTCACHE_ELLIPTIC_CURVE`:

```yaml
version: '3.7'
services:
  certcache:
    container_name: certcache
      …
      CERTCACHE_CERTS: |
        - certName: cert1
          domains:
            - '<cert-domain-1>'
            - '*.<cert-domain-1>'
          keyType: ecdsa
        - certName: cert2
          domains:
            - '<cert-domain-2>'
            - '*.<cert-domain-2>'
          keyType: ecdsa
          ellipticCurve: secp256r1
      CERTCACHE_ELLIPTIC_CURVE: secp384r1
```

## Using ECDSA for certs retrieved from the command line

You can get ECDSA certificates from the command line using the CLI command `certcache get -d 'cert-domain-1,cert-domain-2' --key-type ecdsa`:

If using docker-compose:

```
docker-compose run --rm certcache get -d 'cert-domain-1,cert-domain-2' --key-type ecdsa
```

Curves can optionally be specified using `--elliptic-curve`.
