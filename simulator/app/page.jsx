'use client';

import { useEffect, useRef, useState } from 'react';

const AUTH_KEY = 'ipotik_auth_user';
const TRANSACTION_KEY = 'ipotik_keycloak_transaction';
const KEYCLOAK_BASE_URL = 'https://auth.majapah.it/';
const KEYCLOAK_REALM = 'majapahit';
const KEYCLOAK_CLIENT_ID = 'halo-potik';
const KEYCLOAK_REDIRECT_URI = 'https://hisbulwa.github.io/simulator/index.html';

function keycloakEndpoint(path) {
  return new URL(`realms/${KEYCLOAK_REALM}/protocol/openid-connect/${path}`, KEYCLOAK_BASE_URL);
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function randomBase64Url(byteLength = 32) {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export default function LoginPage() {
  const callbackStarted = useRef(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let savedTheme;
    try {
      savedTheme = localStorage.getItem('ipotik_theme');
    } catch (themeError) {
      console.warn('Preferensi tema tidak dapat dibaca.', themeError);
    }
    const activeTheme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = activeTheme;
    setTheme(activeTheme);

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const oauthError = url.searchParams.get('error');
    if (!code && !oauthError) {
      if (sessionStorage.getItem(AUTH_KEY)) window.location.replace('/index.html');
      return;
    }
    if (callbackStarted.current) return;
    callbackStarted.current = true;
    setBusy(true);

    async function completeLogin() {
      try {
        if (oauthError) {
          throw new Error(url.searchParams.get('error_description') || oauthError);
        }

        const transaction = JSON.parse(sessionStorage.getItem(TRANSACTION_KEY) || 'null');
        const age = Date.now() - transaction?.createdAt;
        if (!transaction || typeof transaction.codeVerifier !== 'string' ||
          transaction.state !== url.searchParams.get('state') ||
          !Number.isFinite(age) || age < 0 || age > 10 * 60 * 1000) {
          throw new Error('Sesi login SSO tidak valid atau kedaluwarsa. Silakan coba lagi.');
        }

        const callbackResponse = await fetch('/api/auth/keycloak/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, codeVerifier: transaction.codeVerifier })
        });
        const result = await callbackResponse.json();
        if (!callbackResponse.ok) {
          throw new Error(result.error || `Callback SSO gagal (HTTP ${callbackResponse.status}).`);
        }
        sessionStorage.setItem(AUTH_KEY, result.username);
        window.location.replace('/index.html');
      } catch (loginError) {
        console.error('Login SSO Majapahit gagal.', loginError);
        setError(`Login SSO gagal: ${loginError.message}`);
        window.history.replaceState({}, '', '/');
        setBusy(false);
      } finally {
        sessionStorage.removeItem(TRANSACTION_KEY);
      }
    }

    completeLogin();
  }, []);

  async function loginWithSso() {
    setBusy(true);
    setError('');
    try {
      const codeVerifier = randomBase64Url(64);
      const challenge = base64Url(new Uint8Array(await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier)
      )));
      const state = randomBase64Url();
      sessionStorage.setItem(TRANSACTION_KEY, JSON.stringify({
        codeVerifier,
        state,
        createdAt: Date.now()
      }));

      const authorizeUrl = keycloakEndpoint('auth');
      authorizeUrl.search = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        redirect_uri: KEYCLOAK_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      });
      window.location.assign(authorizeUrl);
    } catch (loginError) {
      console.error('Login SSO Majapahit gagal dimulai.', loginError);
      setError('Tidak dapat memulai login SSO. Pastikan aplikasi dibuka melalui http://localhost:8000.');
      setBusy(false);
    }
  }

  function loginLocally(event) {
    event.preventDefault();
    const value = username.trim();
    const password = event.currentTarget.elements.password.value.trim();
    if (!value || !password) {
      setError('Username dan password wajib diisi');
      return;
    }
    sessionStorage.setItem(AUTH_KEY, value);
    window.location.assign('/index.html');
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('ipotik_theme', nextTheme);
    } catch (themeError) {
      console.warn('Preferensi tema tidak dapat disimpan.', themeError);
    }
    setTheme(nextTheme);
  }

  return (
    <main id="login-view">
      <section className="login-card">
        <button
          type="button"
          className="btn theme-toggle login-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
        >
          Tema {theme === 'dark' ? 'terang' : 'gelap'}
        </button>
        <header className="login-header">
          <h1>Pojok Statistik</h1>
          <p>Masuk ke Simulator Penilaian IPotik 2026</p>
        </header>
        <div className="login-error" role="alert">{error}</div>
        <form onSubmit={loginLocally}>
          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <input
              type="text"
              id="login-username"
              name="username"
              placeholder="Masukkan username"
              autoComplete="username"
              spellCheck="false"
              required
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary login-submit" disabled={busy}>
            Masuk
          </button>
        </form>
        <div className="login-sso-divider" aria-hidden="true">atau</div>
        <button
          type="button"
          className="btn login-sso-button"
          onClick={loginWithSso}
          disabled={busy}
        >
          {busy ? 'Memproses...' : 'Login dengan SSO Majapahit'}
        </button>
        <div className="login-hint">
          Akun default evaluasi: <strong>admin</strong> / <strong>admin</strong>
        </div>
      </section>
    </main>
  );
}
