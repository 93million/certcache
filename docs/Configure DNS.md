## Configure DNS for CertCache server

Set up a DNS record to host CertCache server. Typically this would be a hostname like `certcache.93million.org` (we will refer to this as `<certcache-domain>` below).

From your DNS management control panel, perfrom the following steps:
  * Edit the DNS zone for the domain you want to host CertCache on
  * Add an `A` record for the host `<certcache-domain>` that points to the public IP of the machine you are using to host CertCache
  * Add and `NS` record for the host `acme.<certcache-domain>` that points to `<certcache-domain>`

To give an example running certcache on `certcache.93million.org`:
  * Edit the DNS zone for `93million.org`
  * Add an `A` record for the host `certcache.93million.org` that points to the public IP of the machine you are using to host CertCache
  * Add and `NS` record for the host `acme.certcache.93million.org` that points to `certcache.93million.org`

### ❓How to test

You can test using `dig` on the command line.

To test the `A` record, run `dig <certcache-domain> A +short` which should output the IP address of your certcache server. Eg:

```
$ dig certcache.93million.org A +short
10.20.30.40
```

To test the `NS` record, find the name servers of `<certcache-domain>` by running `dig <domain> NS +short` (eg. `dig 93million.org NS +short`). This will probably return several name servers. Choose any of them and run `dig acme.<certcache-domain> NS @<name-server>`. You should see your certcache server listed in `AUTHORITY SECTION`

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
