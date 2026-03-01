// api/auth/save-token.js
// POST { spartanToken, clearanceToken }
// Validates the tokens work against Waypoint, then stores them in a session cookie

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { spartanToken, clearanceToken } = req.body || {};
  if (!spartanToken) return res.status(400).json({ error: "spartanToken required" });

  // Strip any accidental whitespace
  const spartan   = spartanToken.trim();
  const clearance = (clearanceToken || "").trim();

  // Validate by making a real Waypoint call
  try {
    const testRes = await fetch(
      "https://settings.svc.halowaypoint.com/oban/flight-configurations/titles/hi/audiences/RETAIL/active",
      {
        headers: {
          "x-343-authorization-spartan": spartan,
          "Accept": "application/json",
        },
      }
    );

    if (testRes.status === 401 || testRes.status === 403) {
      return res.status(401).json({ error: "Spartan token rejected by Waypoint — double-check you copied the full value" });
    }

    const flightData = await testRes.json();
    const resolvedClearance = clearance || flightData.FlightConfigurationId || "";

    // Store in cookie — no expiry enforcement here, the frontend handles warnings
    const session = {
      spartanToken:   spartan,
      clearanceToken: resolvedClearance,
      savedAt:        Date.now(),
      // Spartan tokens typically last ~3 hours but often work much longer
      expiresAt:      Date.now() + (4 * 60 * 60 * 1000),
    };

    const encoded = Buffer.from(JSON.stringify(session)).toString("base64");
    res.setHeader("Set-Cookie", `halo_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    res.json({ ok: true, expiresAt: session.expiresAt, clearanceToken: resolvedClearance });
  } catch (err) {
    console.error("save-token error:", err);
    res.status(500).json({ error: err.message });
  }
}
