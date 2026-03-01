// api/halo/match.js
// GET /api/halo/match?id=MATCH_UUID
// Returns full PGCR (Post Game Carnage Report) for a single match
// Contains CoreStats: Kills, Deaths, Assists, KDA, AverageLifeDuration,
//   DamageDealt, DamageTaken, GrenadeKills, PowerWeaponKills, Accuracy,
//   HeadshotKills, MeleeKills, Medals[], etc.

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

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "match id required" });

  try {
    const statsRes = await fetch(
      `https://halostats.svc.halowaypoint.com/hi/matches/${id}/stats`,
      {
        headers: {
          "x-343-authorization-spartan": session.spartanToken,
          "343-clearance": session.clearanceToken,
          "Accept": "application/json",
        },
      }
    );

    if (!statsRes.ok) {
      return res.status(statsRes.status).json({ error: `Waypoint returned ${statsRes.status}` });
    }

    const data = await statsRes.json();
    res.json(data);
  } catch (err) {
    console.error("match stats error:", err);
    res.status(500).json({ error: err.message });
  }
}
