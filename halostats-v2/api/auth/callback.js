// api/auth/callback.js
// Handles the OAuth redirect from Microsoft and performs the full token chain:
// OAuth code → access token → Xbox user token → XSTS token → Spartan token → Clearance token

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`/?error=${encodeURIComponent(error || 'no_code')}`);
  }

  const clientId     = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const redirectUri  = process.env.REDIRECT_URI || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/callback`;

  try {
    // ── Step 1: Exchange authorization code for OAuth tokens ─────────────────
    const oauthRes = await fetch("https://login.live.com/oauth20_token.srf", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  redirectUri,
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         "XboxLive.signin XboxLive.offline_access",
      }),
    });
    const oauthData = await oauthRes.json();
    if (!oauthData.access_token) throw new Error(`OAuth failed: ${JSON.stringify(oauthData)}`);

    // ── Step 2: Exchange OAuth token for Xbox user token ─────────────────────
    const xblRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${oauthData.access_token}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xblData = await xblRes.json();
    if (!xblData.Token) throw new Error(`XBL failed: ${JSON.stringify(xblData)}`);
    const userHash = xblData.DisplayClaims.xui[0].uhs;

    // ── Step 3: Exchange Xbox token for XSTS token (Halo audience) ───────────
    const xstsRes = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        Properties: {
          SandboxId: "RETAIL",
          UserTokens: [xblData.Token],
        },
        RelyingParty: "https://prod.xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xstsData = await xstsRes.json();
    if (!xstsData.Token) throw new Error(`XSTS failed: ${JSON.stringify(xstsData)}`);

    // ── Step 4: Exchange XSTS token for Spartan token ────────────────────────
    const spartanRes = await fetch("https://settings.svc.halowaypoint.com/spartan-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-xbl-contract-version": "1",
      },
      body: JSON.stringify({
        Audience: "urn:343:s3:services",
        MinVersion: "4",
        Proof: [{
          Token: xstsData.Token,
          TokenType: "Xbox_XSTSv3",
        }],
      }),
    });
    const spartanData = await spartanRes.json();
    if (!spartanData.SpartanToken) throw new Error(`Spartan token failed: ${JSON.stringify(spartanData)}`);

    // ── Step 5: Get clearance token ───────────────────────────────────────────
    // We need the XUID first — it's in the XSTS token claims
    const xuid = xstsData.DisplayClaims.xui[0].xid;

    const clearanceRes = await fetch(
      `https://settings.svc.halowaypoint.com/oban/flight-configurations/titles/hi/audiences/RETAIL/active`,
      {
        headers: {
          "x-343-authorization-spartan": spartanData.SpartanToken,
          "Accept": "application/json",
        },
      }
    );
    const clearanceData = await clearanceRes.json();
    const clearanceToken = clearanceData.FlightConfigurationId || "";

    // ── Step 6: Store tokens in a cookie and redirect ────────────────────────
    const tokenPayload = {
      spartanToken:   spartanData.SpartanToken,
      clearanceToken: clearanceToken,
      refreshToken:   oauthData.refresh_token,
      xuid,
      expiresAt: Date.now() + (3 * 60 * 60 * 1000), // ~3 hours
    };

    const encoded = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");
    res.setHeader("Set-Cookie", `halo_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=10800`);
    res.redirect("/");
  } catch (err) {
    console.error("Auth error:", err);
    res.redirect(`/?error=${encodeURIComponent(err.message)}`);
  }
}
