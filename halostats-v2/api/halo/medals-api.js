// api/halo/medals.js
// GET /api/halo/medals          → medal metadata JSON
// GET /api/halo/medals?sprite=1 → proxied spritesheet PNG (requires auth)

const GAMECMS_BASE = "https://gamecms-hacs.svc.halowaypoint.com";
const METADATA_URL = `${GAMECMS_BASE}/hi/Waypoint/file/medals/metadata.json`;
const SPRITE_URL   = `${GAMECMS_BASE}/hi/Waypoint/file/medals/images/medal_sheet_xl.png`;

export default async function handler(req, res) {
  const cookie = req.cookies?.halo_session;
  if (!cookie) return res.status(401).json({ error: "Not logged in" });

  let session;
  try {
    session = JSON.parse(Buffer.from(cookie, "base64").toString());
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }

  const headers = {
    "x-343-authorization-spartan": session.spartanToken,
    "343-clearance": session.clearanceToken,
    "Accept": "*/*",
  };

  // Proxy the spritesheet PNG
  if (req.query.sprite === "1") {
    try {
      const upstream = await fetch(SPRITE_URL, { headers });
      if (!upstream.ok) return res.status(upstream.status).json({ error: "Sprite fetch failed" });

      const buf = await upstream.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h
      return res.send(Buffer.from(buf));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fetch and return medal metadata
  try {
    const upstream = await fetch(METADATA_URL, { headers });
    if (!upstream.ok) return res.status(upstream.status).json({ error: "Metadata fetch failed" });

    const raw = await upstream.json();

    // Normalize into { [nameId]: { name, description, spriteIndex, difficulty } }
    const medals = {};
    for (const medal of (raw.Medals || [])) {
      medals[medal.NameId] = {
        nameId:       medal.NameId,
        name:         medal.Name?.value   || `Medal #${medal.NameId}`,
        description:  medal.Description?.value || "",
        spriteIndex:  medal.SpriteIndex ?? 0,
        difficulty:   medal.DifficultyIndex ?? 0, // 0=normal 1=heroic 2=legendary 3=mythic
        type:         medal.TypeIndex ?? 0,
      };
    }

    res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1h
    return res.json({ medals, spriteColumns: 16, spriteSize: 256 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
