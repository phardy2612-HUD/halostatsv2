// api/halo/matches.js
// GET /api/halo/matches?gamertag=SomeTag&count=25&start=0
// Fetches match history for a gamertag using the authenticated user's Spartan token

export default async function handler(req, res) {
  const cookie = req.cookies?.halo_session;
  if (!cookie) return res.status(401).json({ error: "Not logged in" });

  let session;
  try {
    session = JSON.parse(Buffer.from(cookie, "base64").toString());
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }

  if (Date.now() > session.expiresAt) {
    return res.status(401).json({ error: "Token expired", code: "EXPIRED" });
  }

  const { gamertag, count = 25, start = 0 } = req.query;
  if (!gamertag) return res.status(400).json({ error: "gamertag required" });

  try {
    const url = `https://halostats.svc.halowaypoint.com/hi/players/xuid(${encodeURIComponent(gamertag)})/matches?count=${count}&start=${start}`;

    // Note: Waypoint accepts gamertag directly in some endpoints,
    // but the canonical form uses XUID. We'll try gamertag first
    // (halostats accepts it in some regions) and fall back to XUID lookup.
    const matchRes = await fetch(
      `https://halostats.svc.halowaypoint.com/hi/players/${encodeURIComponent(gamertag)}/matches?count=${count}&start=${start}`,
      {
        headers: {
          "x-343-authorization-spartan": session.spartanToken,
          "343-clearance": session.clearanceToken,
          "Accept": "application/json",
        },
      }
    );

    if (matchRes.status === 404 || matchRes.status === 400) {
      // Try XUID lookup
      const xuidRes = await fetch(
        `https://profile.svc.halowaypoint.com/users/gt(${encodeURIComponent(gamertag)})`,
        {
          headers: {
            "x-343-authorization-spartan": session.spartanToken,
            "Accept": "application/json",
          },
        }
      );
      const xuidData = await xuidRes.json();
      const xuid = xuidData.xuid;
      if (!xuid) return res.status(404).json({ error: `Player not found: ${gamertag}` });

      const retryRes = await fetch(
        `https://halostats.svc.halowaypoint.com/hi/players/xuid(${xuid})/matches?count=${count}&start=${start}`,
        {
          headers: {
            "x-343-authorization-spartan": session.spartanToken,
            "343-clearance": session.clearanceToken,
            "Accept": "application/json",
          },
        }
      );
      const data = await retryRes.json();
      return res.json({ ...data, _xuid: xuid });
    }

    const data = await matchRes.json();
    res.json(data);
  } catch (err) {
    console.error("matches error:", err);
    res.status(500).json({ error: err.message });
  }
}
