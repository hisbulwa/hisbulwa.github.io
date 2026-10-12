const KEYCLOAK_BASE_URL = 'https://auth.majapah.it/';
const KEYCLOAK_REALM = 'majapahit';
const KEYCLOAK_CLIENT_ID = 'halo-potik';
const KEYCLOAK_REDIRECT_URI = 'http://localhost:8000/';

function keycloakEndpoint(path) {
  return new URL(`realms/${KEYCLOAK_REALM}/protocol/openid-connect/${path}`, KEYCLOAK_BASE_URL);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Permintaan callback SSO tidak valid.' }, { status: 400 });
  }

  const { code, codeVerifier } = body;
  if (typeof code !== 'string' || code.length === 0 || code.length > 2048 ||
    typeof codeVerifier !== 'string' || codeVerifier.length < 43 || codeVerifier.length > 128) {
    return Response.json({ error: 'Kode atau verifikator SSO tidak valid.' }, { status: 400 });
  }

  let tokenResponse;
  try {
    tokenResponse = await fetch(keycloakEndpoint('token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KEYCLOAK_CLIENT_ID,
        code,
        redirect_uri: KEYCLOAK_REDIRECT_URI,
        code_verifier: codeVerifier
      }),
      cache: 'no-store'
    });
  } catch (error) {
    console.error('Tidak dapat menghubungi endpoint token Keycloak.', error);
    return Response.json({ error: 'Tidak dapat menghubungi server SSO Majapahit.' }, { status: 502 });
  }

  if (!tokenResponse.ok) {
    console.error(`Pertukaran token Keycloak gagal (HTTP ${tokenResponse.status}).`);
    return Response.json({ error: 'Keycloak menolak pertukaran token. Silakan mulai login lagi.' }, { status: 401 });
  }

  let tokens;
  try {
    tokens = await tokenResponse.json();
  } catch (error) {
    console.error('Respons token Keycloak bukan JSON yang valid.', error);
    return Response.json({ error: 'Respons token dari server SSO tidak valid.' }, { status: 502 });
  }
  if (typeof tokens.access_token !== 'string' || !tokens.access_token) {
    console.error('Keycloak tidak mengembalikan access token.');
    return Response.json({ error: 'Keycloak tidak mengembalikan access token.' }, { status: 502 });
  }

  let userResponse;
  try {
    userResponse = await fetch(keycloakEndpoint('userinfo'), {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store'
    });
  } catch (error) {
    console.error('Tidak dapat mengambil profil dari Keycloak.', error);
    return Response.json({ error: 'Tidak dapat menghubungi profil SSO Majapahit.' }, { status: 502 });
  }

  if (!userResponse.ok) {
    console.error(`Pengambilan profil Keycloak gagal (HTTP ${userResponse.status}).`);
    return Response.json({ error: 'Gagal mengambil profil pengguna dari SSO.' }, { status: 502 });
  }

  let user;
  try {
    user = await userResponse.json();
  } catch (error) {
    console.error('Respons profil Keycloak bukan JSON yang valid.', error);
    return Response.json({ error: 'Respons profil dari server SSO tidak valid.' }, { status: 502 });
  }

  const username = user.preferred_username || user.email || user.name || user.sub;
  if (typeof username !== 'string' || !username) {
    console.error('Profil Keycloak tidak berisi identitas pengguna.');
    return Response.json({ error: 'Profil SSO tidak berisi identitas pengguna.' }, { status: 502 });
  }

  return Response.json({ username });
}
