// api/auth/refresh.js
// Refreshes the Spartan token using the stored refresh token

export default async function handler(req, res) {
  const cookie = req.cookies?.halo_session;
  if (!cookie) return res.status(401).json({ error: "No session" });

  let session;
  try {
    session = JSON.parse(Buffer.from(cookie, "base64").toString());
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }

  if (!session.refreshToken) return res.status(401).json({ error: "No refresh token" });

  const clientId     = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const redirectUri  = process.env.REDIRECT_URI || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/callback`;

  try {
    // Refresh OAuth token
    const oauthRes = await fetch("https://login.live.com/oauth20_token.srf", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "refresh_token",
        refresh_token: session.refreshToken,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        scope:         "XboxLive.signin XboxLive.offline_access",
      }),
    });
    const oauthData = await oauthRes.json();
    if (!oauthData.access_token) throw new Error("OAuth refresh failed");

    // Xbox user token
    const xblRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        Properties: { AuthMethod: "RPS", SiteName: "user.auth.xboxlive.com", RpsTicket: `d=${oauthData.access_token}` },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xblData = await xblRes.json();
    if (!xblData.Token) throw new Error("XBL refresh failed");

    // XSTS token
    const xstsRes = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        Properties: { SandboxId: "RETAIL", UserTokens: [xblData.Token] },
        RelyingParty: "https://prod.xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xstsData = await xstsRes.json();
    if (!xstsData.Token) throw new Error("XSTS refresh failed");

    // Spartan token
    const spartanRes = await fetch("https://settings.svc.halowaypoint.com/spartan-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "x-xbl-contract-version": "1" },
      body: JSON.stringify({
        Audience: "urn:343:s3:services",
        MinVersion: "4",
        Proof: [{ Token: xstsData.Token, TokenType: "Xbox_XSTSv3" }],
      }),
    });
    const spartanData = await spartanRes.json();
    if (!spartanData.SpartanToken) throw new Error("Spartan refresh failed");

    // Clearance
    const clearanceRes = await fetch(
      `https://settings.svc.halowaypoint.com/oban/flight-configurations/titles/hi/audiences/RETAIL/active`,
      { headers: { "x-343-authorization-spartan": spartanData.SpartanToken, "Accept": "application/json" } }
    );
    const clearanceData = await clearanceRes.json();

    const newSession = {
      ...session,
      spartanToken:   spartanData.SpartanToken,
      clearanceToken: clearanceData.FlightConfigurationId || session.clearanceToken,
      refreshToken:   oauthData.refresh_token || session.refreshToken,
      expiresAt:      Date.now() + (3 * 60 * 60 * 1000),
    };

    const encoded = Buffer.from(JSON.stringify(newSession)).toString("base64");
    res.setHeader("Set-Cookie", `halo_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=10800`);
    res.json({ ok: true, expiresAt: newSession.expiresAt });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: err.message });
  }
}
