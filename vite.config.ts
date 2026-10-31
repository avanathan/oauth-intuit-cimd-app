import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Where the built site is served. The CIMD client_id is an https URL on this origin, and the
// service requires every redirect_uri to share that origin, so these two values define the client.
const ORIGIN = process.env.PAGES_ORIGIN ?? 'https://avanathan.github.io';
const BASE = process.env.PAGES_BASE ?? '/oauth-intuit-cimd-app/';

export const clientId = `${ORIGIN}${BASE}oauth/metadata.json`;
export const redirectUri = `${ORIGIN}${BASE}`;

// The CIMD metadata document. client_id must equal the URL it is served from, exactly.
const metadata = {
  client_id: clientId,
  client_name: 'OAuth CIMD Sample App',
  redirect_uris: [redirectUri],
  grant_types: ['authorization_code'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
};

function cimdMetadata(): Plugin {
  const body = JSON.stringify(metadata, null, 2);
  return {
    name: 'cimd-metadata',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'oauth/metadata.json', source: body });
    },
    configureServer(server) {
      server.middlewares.use(`${BASE}oauth/metadata.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(body);
      });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), cimdMetadata()],
  define: {
    __CLIENT_ID__: JSON.stringify(clientId),
    __REDIRECT_URI__: JSON.stringify(redirectUri),
  },
});
