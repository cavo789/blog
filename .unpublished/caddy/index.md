---
slug: caddy
title: "Caddy — Zero-Config HTTPS as a Docker Container"
description: "Caddy is a web server that automatically obtains and renews TLS certificates. As a Docker container, it turns a five-line Caddyfile into a production-ready HTTPS reverse proxy — no Certbot, no cron jobs, no nginx config to untangle."
authors: [christophe, claude]
image: /img/v2/encryption.webp
mainTag: docker
draft: true
tags: [docker, linux, ssl]
date: 2026-09-15
ai_assisted: true
---

![Caddy — Zero-Config HTTPS as a Docker Container](/img/v2/encryption.webp)

<TLDR>
Caddy is a web server that obtains TLS certificates automatically — from Let's Encrypt for public domains, from its own local CA for development. A `Caddyfile` is dramatically simpler than an nginx config: `reverse_proxy app:3000` is a complete, working reverse proxy. As a Docker container with two named volumes for certificate storage, Caddy handles HTTPS with no Certbot, no cron jobs, and no certificate renewal to maintain.
</TLDR>

Setting up HTTPS with nginx or Apache means configuring the server, installing Certbot, running it, setting up a cron job for renewal, and praying the renewal doesn't break when your domain validation changes. Every time you add a new subdomain, you repeat the process.

Caddy does all of this automatically, triggered by the fact that you put a domain name in the config.

<!-- truncate -->

## Seeing the HTTPS

`tls internal` in the Caddyfile is all it takes — no separate `mkcert` step, no manually trusting a certificate:

<Terminal source="./files/terminal_https_proof.txt" typewriter />

`HTTP/2 200`, a `server: Caddy` header, and the request succeeded over TLS without `curl -k` — the certificate is genuinely trusted, not just accepted despite a warning. That's what "zero-config HTTPS" actually buys you.

## What makes Caddy different

Three things distinguish Caddy from nginx or Apache as a reverse proxy:

1. **Automatic HTTPS**: Put a public domain name in the Caddyfile, and Caddy obtains a Let's Encrypt certificate, installs it, and renews it — with no additional configuration, no Certbot, no cron job.

2. **The Caddyfile format**: Caddy's config format is genuinely readable. A complete HTTPS reverse proxy is one directive. An nginx equivalent is thirty lines with `ssl_certificate`, `ssl_protocols`, `location` blocks, and proxy headers.

3. **Local HTTPS for development**: The `tls internal` directive uses Caddy's built-in CA to issue a locally-trusted certificate for `localhost` or any `.localhost` domain — no `mkcert` required, no browser warning to bypass.

## Installation

### Static file server

The simplest use case: serve a folder of files over HTTP.

<Snippet source="./files/Caddyfile.static" language="caddy" />

<Snippet source="./files/compose.yaml" language="yaml" />

In the `compose.yaml`, the `caddy_data` volume persists TLS certificates across container restarts. Without it, Caddy requests a new certificate every time it starts — which risks hitting Let's Encrypt rate limits.

Start it:

<Terminal>
docker compose up -d
</Terminal>

Your app is now reachable on port 8080. Caddy also automatically enables gzip compression (`encode gzip`) and sets appropriate `Content-Type` headers for static files.

## More Demos

### Reverse proxy — the most common use case

Point Caddy at another container:

<Snippet source="./files/Caddyfile.proxy" language="caddy" />

`app` is the Docker Compose service name. Caddy resolves it through Docker's internal DNS. No IP addresses, no port mapping needed on the `app` service — Caddy handles all ingress from the outside.

The `app` service has no `ports:` mapping in `compose.yaml`. It's invisible from outside the Docker network. Caddy is the only entry point.

### Automatic HTTPS for public domains

Replace `:80` with your actual domain name, and Caddy obtains a certificate automatically:

```
yourdomain.com {
    reverse_proxy app:3000
}
```

That's it. When Caddy starts:
1. It detects that `yourdomain.com` is a public hostname
2. It uses the ACME HTTP-01 challenge with Let's Encrypt to prove you control the domain
3. It installs the certificate and redirects HTTP to HTTPS
4. It schedules automatic renewal before the certificate expires

**Requirements**: port 80 and 443 must be open and reachable from the internet, and your domain's DNS must point to the server.

<AlertBox type="warning" title="ACME challenges require a reachable server">
Automatic HTTPS only works if Let's Encrypt can reach your server on port 80 to complete the domain challenge. Behind a NAT or firewall, Caddy will fall back to self-signed certificates and log an error. Use `tls internal` for local development instead.
</AlertBox>

### Local HTTPS for development

For local development, use Caddy's built-in CA with `tls internal` — the same directive behind the proof shown at the top of this article:

<Snippet source="./files/Caddyfile.local-tls" language="caddy" />

Caddy generates a certificate for `localhost` and `myapp.localhost` signed by a local CA it creates on first run. On subsequent runs, the CA and certificates are loaded from the `caddy_data` volume. `docker compose exec caddy caddy trust` installs that CA into the system trust store — after that, `https://localhost` shows a green padlock in Chrome, Firefox, and Safari, and your local development environment behaves identically to production.

This is the same outcome as using `mkcert` (covered in the <Link to="/blog/docker-localhost-ssl">Docker localhost SSL</Link> article), but without a separate tool — Caddy manages both the CA and the certificate issuance.

### Multiple domains in one Caddyfile

<Snippet source="./files/Caddyfile.multi" language="caddy" />

Each block is an independent virtual host. Caddy obtains a separate certificate for each domain. You can mix public domains (automatic Let's Encrypt) with `tls internal` domains in the same file.

The `basicauth` block shows password protection: the hashed password is generated with `caddy hash-password --plaintext mypassword`.

## Under the Hood (skip this if you just want to use it)

### Logging

Add structured JSON access logs to any block:

```
app.example.com {
    log {
        output file /var/log/caddy/access.log
        format json
    }
    reverse_proxy app:3000
}
```

Mount `/var/log/caddy` as a volume if you need to read the logs from the host.

### Caddy vs nginx as a Docker reverse proxy

| | nginx | Caddy |
|--|-------|-------|
| HTTPS setup | Manual + Certbot | Automatic |
| Certificate renewal | Cron job | Built-in |
| Local dev HTTPS | mkcert (separate tool) | `tls internal` (built-in) |
| Config complexity | High (many directives) | Low (one line per rule) |
| Config hot-reload | `nginx -s reload` | `caddy reload` |
| HTTP/3 support | Requires nginx 1.25+ | Built-in |

Nginx is more flexible for edge cases and has a larger ecosystem of tutorials. Caddy wins for the 95% case: a reverse proxy for a Docker-based app where you want HTTPS without ceremony.

## Conclusion

Caddy earns its reputation for simplicity. A five-line Caddyfile does what takes thirty nginx directives and a Certbot installation. The `tls internal` directive makes local HTTPS genuinely pleasant, as the trusted `HTTP/2 200` shown above proves. And as a Docker container with two volumes for state, it drops into any `compose.yaml` without friction.

Caddy is a natural evolution from the <Link to="/blog/docker-html-site">static HTML site in Docker</Link> (basic nginx approach) and the <Link to="/blog/docker-localhost-ssl">Docker localhost SSL</Link> setup (manual Certbot + Apache). It also connects to the upcoming Traefik article — Traefik is the heavier-weight alternative for Kubernetes or complex multi-service routing; Caddy is the right tool when you want HTTPS with minimal config and no label-based routing system to learn.

If you reach for nginx whenever you need a reverse proxy, try Caddy once. The config alone will change your default choice.
