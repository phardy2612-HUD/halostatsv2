// api/auth/login.js
// Redirects the user to Microsoft's login page
// Called when user clicks "Sign in with Xbox"

export default function handler(req, res) {
  const clientId = process.env.AZURE_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "XboxLive.signin XboxLive.offline_access",
    response_mode: "query",
  });

  const authUrl = `https://login.live.com/oauth20_authorize.srf?${params}`;
  res.redirect(authUrl);
}
