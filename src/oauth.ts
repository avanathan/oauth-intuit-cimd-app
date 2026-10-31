import { AUTHORIZE_URL, CLIENT_ID, REDIRECT_URI, TOKEN_URL } from './config';

const STORE_KEY = 'oauth_pending';

interface Pending {
  state: string;
  verifier: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  id_token?: string;
  [key: string]: unknown;
}

const base64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const randomString = (byteLength: number): string =>
  base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));

const challengeFor = async (verifier: string): Promise<string> =>
  base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));

/** Step 1: send the browser to /oauth2/authorize with PKCE (S256) and a state value. */
export async function startAuthorization(scope: string, resource: string): Promise<void> {
  const pending: Pending = { state: randomString(16), verifier: randomString(48) };
  sessionStorage.setItem(STORE_KEY, JSON.stringify(pending));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope,
    state: pending.state,
    code_challenge: await challengeFor(pending.verifier),
    code_challenge_method: 'S256',
  });
  if (resource.trim()) params.set('resource', resource.trim());
  window.location.assign(`${AUTHORIZE_URL}?${params}`);
}

/** Step 2: back on the redirect URI, check state and swap the code for tokens. */
export async function completeAuthorization(search: string): Promise<TokenResponse> {
  const query = new URLSearchParams(search);
  const error = query.get('error');
  if (error) throw new Error(`${error}: ${query.get('error_description') ?? 'authorization refused'}`);

  const raw = sessionStorage.getItem(STORE_KEY);
  sessionStorage.removeItem(STORE_KEY);
  if (!raw) throw new Error('No authorization in progress (session storage empty). Start again.');
  const pending = JSON.parse(raw) as Pending;

  if (query.get('state') !== pending.state) throw new Error('state mismatch; possible CSRF, aborting.');
  const code = query.get('code');
  if (!code) throw new Error('Redirect carried no code.');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: pending.verifier,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Token endpoint ${response.status}: ${JSON.stringify(body)}`);
  return body as TokenResponse;
}

/** Decodes a JWT payload for display; returns null for an opaque token. */
export function decodeJwt(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
