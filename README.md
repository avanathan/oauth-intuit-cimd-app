# oauth-intuit-cimd-app

GitHub Pages app (React + TypeScript + Vite) that runs a 3-legged OAuth2 flow
(authorization code + PKCE) against the **e2e** oauth2-service, using a CIMD `client_id`.

## How it works

- The build publishes `oauth/metadata.json`. Its URL **is** the `client_id`.
- `Sign in` redirects to `/oauth2/authorize`. After login and consent, the server redirects back
  to the site root with `?code&state`, and the page exchanges the code at `/oauth2/token`.
- Public client: `token_endpoint_auth_method: none`, PKCE S256, no secret.
- In e2e an unverified CIMD client is capped to `campaigns:read`.

## Config

| Env var | Default |
| --- | --- |
| `PAGES_ORIGIN` | `https://avanathan.github.io` |
| `PAGES_BASE` | `/oauth-intuit-cimd-app/` |
| `VITE_ISSUER` | `https://oauth2-svc-e2e.api.intuit.com` |

`client_id` and `redirect_uri` are derived from `PAGES_ORIGIN` + `PAGES_BASE`. The service requires
them to share an origin and `client_id` to equal the document's URL exactly. The origin must also
resolve to a public address, because the service refuses to fetch a metadata document from a
private one.

## Commands

```bash
npm install
npm run build          # type-check + build to dist/
npm run publish:pages  # build and push dist/ to gh-pages
```

Then enable Pages for the repo (branch `gh-pages`, folder `/`) and open
`https://avanathan.github.io/oauth-intuit-cimd-app/`.

Requires the e2e token endpoint to allow CORS from the Pages origin.
