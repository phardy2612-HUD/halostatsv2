// api/halo/squad.js
// POST /api/halo/squad
// Body: { gamertags: string[], count: number }
// Fetches match history + full PGCR stats for all players in parallel
// This is the main data-fetching endpoint used by the app

const WAYPOINT_BASE = "https://halostats.svc.halowaypoint.com";
const PROFILE_BASE  = "https://profile.svc.halowaypoint.com";

async function getXuid(gamertag, spartanToken) {
  const res = await fetch(`${PROFILE_BASE}/users/gt(${encodeURIComponent(gamertag)})`, {
    headers: { "x-343-authorization-spartan": spartanToken, "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Player not found: ${gamertag}`);
  const data = await res.json();
  return data.xuid;
}

async function getMatches(xuid, count, spartanToken, clearanceToken) {
  const res = await fetch(
    `${WAYPOINT_BASE}/hi/players/xuid(${xuid})/matches?count=${count}&start=0`,
    {
      headers: {
        "x-343-authorization-spartan": spartanToken,
        "343-clearance": clearanceToken,
        "Accept": "application/json",
      },
    }
  );
  if (!res.ok) return { Results: [] };
  return res.json();
}

async function getMatchStats(matchId, spartanToken, clearanceToken) {
  const res = await fetch(`${WAYPOINT_BASE}/hi/matches/${matchId}/stats`, {
    headers: {
      "x-343-authorization-spartan": spartanToken,
      "343-clearance": clearanceToken,
      "Accept": "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const cookie = req.cookies?.halo_session;
  if (!cookie) return res.status(401).json({ error: "Not logged in" });

  let session;
  try {
    session = JSON.parse(Buffer.from(cookie, "base64").toString());
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }

  // Soft expiry — warn but still try (tokens often last longer than expected)
  if (Date.now() > session.expiresAt + (2 * 60 * 60 * 1000)) {
    return res.status(401).json({ error: "Token expired", code: "EXPIRED" });
  }

  const { gamertags, count = 25 } = req.body;
  if (!gamertags?.length) return res.status(400).json({ error: "gamertags required" });

  const { spartanToken, clearanceToken } = session;

  try {
    // 1. Look up XUIDs for all gamertags in parallel
    const xuidResults = await Promise.allSettled(
      gamertags.map(gt => getXuid(gt, spartanToken))
    );
    const players = gamertags.map((gt, i) => ({
      gamertag: gt,
      xuid: xuidResults[i].status === "fulfilled" ? xuidResults[i].value : null,
      error: xuidResults[i].status === "rejected" ? xuidResults[i].reason?.message : null,
    }));

    // 2. Fetch match lists for all players in parallel
    const matchListResults = await Promise.allSettled(
      players.map(p => p.xuid ? getMatches(p.xuid, count, spartanToken, clearanceToken) : Promise.resolve({ Results: [] }))
    );

    // 3. Collect unique match IDs across all players
    const matchIdSet = new Set();
    matchListResults.forEach(result => {
      if (result.status === "fulfilled") {
        (result.value.Results || []).forEach(m => matchIdSet.add(m.MatchId));
      }
    });
    const matchIds = [...matchIdSet];

    // 4. Fetch full PGCR for each unique match (in parallel, max 10 at a time)
    const matchStatsMap = {};
    const batchSize = 10;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(id => getMatchStats(id, spartanToken, clearanceToken))
      );
      batch.forEach((id, j) => {
        if (results[j].status === "fulfilled" && results[j].value) {
          matchStatsMap[id] = results[j].value;
        }
      });
    }

    // 5. Build response: per-player match lists + stats
    const playerData = players.map((player, i) => {
      const matchList = matchListResults[i].status === "fulfilled"
        ? (matchListResults[i].value.Results || [])
        : [];

      const matches = matchList.map(m => {
        const fullStats = matchStatsMap[m.MatchId];
        const playerInMatch = fullStats?.Players?.find(
          p => p.PlayerId?.toLowerCase().includes(player.xuid?.toLowerCase())
        );

        const core = playerInMatch?.PlayerTeamStats?.[0]?.Stats?.CoreStats || {};

        return {
          matchId: m.MatchId,
          date: m.MatchInfo?.StartTime,
          map: m.MatchInfo?.MapVariant?.AssetId,
          mapName: null, // resolved separately from assets if needed
          mode: m.MatchInfo?.UgcGameVariant?.AssetId,
          modeName: null,
          playlistName: m.MatchInfo?.Playlist?.AssetId || null,
          isRanked: m.MatchInfo?.PlaylistExperience === 3,
          duration: m.MatchInfo?.PlayableDuration,
          outcome: playerInMatch?.Outcome, // 2=win, 3=loss, 1=draw
          rank: playerInMatch?.Rank,
          // Core stats - all the fields we care about
          kills:              core.Kills ?? 0,
          deaths:             core.Deaths ?? 0,
          assists:            core.Assists ?? 0,
          kda:                core.KDA ?? 0,
          score:              core.PersonalScore ?? 0,
          accuracy:           core.Accuracy ?? 0,
          shotsFired:         core.ShotsFired ?? 0,
          shotsHit:           core.ShotsHit ?? 0,
          damageDealt:        core.DamageDealt ?? 0,
          damageTaken:        core.DamageTaken ?? 0,
          grenadeKills:       core.GrenadeKills ?? 0,
          headshots:          core.HeadshotKills ?? 0,
          meleeKills:         core.MeleeKills ?? 0,
          powerWeaponKills:   core.PowerWeaponKills ?? 0,
          suicides:           core.Suicides ?? 0,
          betrayals:          core.Betrayals ?? 0,
          maxKillingSpree:    core.MaxKillingSpree ?? 0,
          avgLifeDuration:    core.AverageLifeDuration ?? "PT0S",
          medals:             core.Medals ?? [],
          calloutAssists:     core.CalloutAssists ?? 0,
          vehicleDestroys:    core.VehicleDestroys ?? 0,
          empAssists:         core.EmpAssists ?? 0,
        };
      });

      return {
        gamertag: player.gamertag,
        xuid: player.xuid,
        error: player.error,
        matches,
      };
    });

    res.json({
      players: playerData,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("squad error:", err);
    res.status(500).json({ error: err.message });
  }
}
