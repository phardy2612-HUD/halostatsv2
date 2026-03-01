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

  // Debug: return raw response to inspect structure
  if (req.query.debug === "1") {
    const upstream = await fetch(METADATA_URL, { headers });
    const raw = await upstream.json();
    return res.json({ firstMedal: (raw.medals || raw.Medals || [])[0], keys: Object.keys(raw) });
  }

  // Fetch and return medal metadata
  try {
    const upstream = await fetch(METADATA_URL, { headers });
    if (!upstream.ok) return res.status(upstream.status).json({ error: "Metadata fetch failed" });

    const raw = await upstream.json();

    // Normalize into { [nameId]: { name, description, spriteIndex, difficulty } }
    // API returns lowercase keys: nameId, spriteIndex, difficultyIndex etc.
    const medals = {};
    const medalArray = raw.medals || raw.Medals || [];
    for (const medal of medalArray) {
      const id = medal.nameId ?? medal.NameId;
      if (!id) continue;
      medals[id] = {
        nameId:      id,
        name:        medal.name?.value        ?? medal.Name?.value        ?? `Medal #${id}`,
        description: medal.description?.value ?? medal.Description?.value ?? "",
        spriteIndex: medal.spriteIndex        ?? medal.SpriteIndex        ?? 0,
        difficulty:  medal.difficultyIndex    ?? medal.DifficultyIndex    ?? 0,
        type:        medal.typeIndex          ?? medal.TypeIndex          ?? 0,
      };
    }

    // Debug: log a sample so we can verify structure in Vercel logs
    const sample = medalArray[0];
    console.log("[medals] sample keys:", sample ? Object.keys(sample) : "empty array");
    console.log("[medals] total medals parsed:", Object.keys(medals).length);

    res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1h
    return res.json({ medals, spriteColumns: 16, spriteSize: 256 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
