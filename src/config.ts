// The e2e authorization server. Override with VITE_ISSUER to point at another environment.
export const ISSUER: string = import.meta.env.VITE_ISSUER ?? 'https://oauth2-svc-e2e.api.intuit.com';

export const AUTHORIZE_URL = `${ISSUER}/oauth2/authorize`;
export const TOKEN_URL = `${ISSUER}/oauth2/token`;

// CIMD: the client_id is the URL of the metadata document this site publishes (see vite.config.ts).
export const CLIENT_ID = __CLIENT_ID__;
export const REDIRECT_URI = __REDIRECT_URI__;

// The unverified CIMD tier in e2e is capped to this scope (application-e2e.yml).
export const DEFAULT_SCOPE = 'campaigns:read';
