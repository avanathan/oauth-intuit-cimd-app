import { useEffect, useRef, useState } from 'react';
import { CLIENT_ID, DEFAULT_SCOPE, ISSUER, REDIRECT_URI } from './config';
import { completeAuthorization, decodeJwt, startAuthorization, type TokenResponse } from './oauth';

export default function App() {
  const [scope, setScope] = useState(DEFAULT_SCOPE);
  const [resource, setResource] = useState('');
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const handled = useRef(false);

  // The authorization server redirects back to this page with ?code=...&state=... (or ?error=...).
  useEffect(() => {
    const search = window.location.search;
    if (handled.current || !(search.includes('code=') || search.includes('error='))) return;
    handled.current = true;
    setBusy(true);
    completeAuthorization(search)
      .then(setTokens)
      .catch((e: Error) => setError(e.message))
      .finally(() => {
        setBusy(false);
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, []);

  const signIn = () => {
    setError(null);
    setTokens(null);
    startAuthorization(scope, resource).catch((e: Error) => setError(e.message));
  };

  const claims = tokens ? decodeJwt(tokens.access_token) : null;

  return (
    <main>
      <h1>OAuth CIMD Sample App</h1>
      <p>3-legged authorization-code + PKCE flow, identified by a CIMD client_id.</p>

      <dl>
        <dt>Authorization server</dt>
        <dd>{ISSUER}</dd>
        <dt>client_id (metadata URL)</dt>
        <dd>
          <a href={CLIENT_ID}>{CLIENT_ID}</a>
        </dd>
        <dt>redirect_uri</dt>
        <dd>{REDIRECT_URI}</dd>
      </dl>

      <label>
        Scope
        <input value={scope} onChange={(e) => setScope(e.target.value)} />
      </label>
      <label>
        Resource (optional, RFC 8707)
        <input value={resource} onChange={(e) => setResource(e.target.value)} placeholder="https://..." />
      </label>
      <button onClick={signIn} disabled={busy}>
        {busy ? 'Exchanging code…' : 'Sign in'}
      </button>

      {error && <pre className="error">{error}</pre>}
      {tokens && (
        <>
          <h2>Token response</h2>
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
          {claims && (
            <>
              <h2>Access token claims</h2>
              <pre>{JSON.stringify(claims, null, 2)}</pre>
            </>
          )}
        </>
      )}
    </main>
  );
}
