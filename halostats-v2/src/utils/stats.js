// src/utils/stats.js
import { parseDuration, isInterestingMedal, getMedalName } from "./medals";

export const DATE_RANGES = {
  "This Week": () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // Get day of week (0-6), adjust so Monday is 0. 
    // (d.getDay() + 6) % 7 turns Sun(0)->6, Mon(1)->0, Tue(2)->1, etc.
    const day = (d.getDay() + 6) % 7; 
    d.setDate(d.getDate() - day);
    return d;
  },
  "This Month": () => {
    const d = new Date();
    // Set to the 1st day of the current month at 00:00:00
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },
  "This Year": () => {
    // Set to January 1st of the current year
    return new Date(new Date().getFullYear(), 0, 1);
  },
  "All Time": () => new Date(0),
};

// Waypoint's isRanked field is unreliable — filter by playlist ID instead.
// dcb2e24e = Ranked Slayer (your main squad playlist)
// Everything else = social/casual sessions
const RANKED_SLAYER_PLAYLIST = "dcb2e24e-05fb-4390-8076-32a0cdb4326e";

export const GAME_MODE_FILTERS = {
  "All":     () => true,
  "Ranked":  m => m.playlistName === RANKED_SLAYER_PLAYLIST,
  "Social":  m => m.playlistName !== RANKED_SLAYER_PLAYLIST,
};

// Filter matches by date range
export function filterByDate(matches, rangeLabel) {
  const since = DATE_RANGES[rangeLabel]?.() || new Date(0);
  return matches.filter(m => new Date(m.date) >= since);
}

// Outcome codes: 2=Win, 3=Loss, 1=Draw
function isWin(m)  { return m.outcome === 2; }
function isLoss(m) { return m.outcome === 3; }

const EMPTY_STATS = (gamertag) => ({
  gamertag,
  matchesPlayed: 0, wins: 0, losses: 0, winRate: 0,
  kills: 0, deaths: 0, assists: 0, kda: 0, kdRaw: 0,
  avgKills: 0, avgDeaths: 0, avgAssists: 0, avgAccuracy: 0,
  avgDamageDealt: 0, avgDamageTaken: 0, avgLifeSecs: 0,
  totalGrenadeKills: 0, avgGrenadeKills: 0,
  totalPowerWeaponKills: 0, avgPowerWeaponKills: 0,
  totalHeadshots: 0, totalMeleeKills: 0,
  maxKillingSpree: 0, totalScore: 0, avgScore: 0,
  interestingMedals: [], medalTotals: {},
});

// Compute aggregate stats for one player over a set of matches
export function aggregatePlayerStats(playerData, matches) {
  const gamertag = typeof playerData === "string" ? playerData : playerData.gamertag;

  // Filter out aborted/lobby matches (under 60s with 0 kills and 0 deaths)
  const validMatches = (matches || []).filter(m => {
    const secs = parseDuration(m.duration || "PT0S");
    return !(secs < 60 && m.kills === 0 && m.deaths === 0);
  });

  const n = validMatches.length;
  if (n === 0) return EMPTY_STATS(gamertag);

  const sum = (key) => validMatches.reduce((s, m) => s + (m[key] || 0), 0);
  const avg = (key) => sum(key) / n;
  const max = (key) => Math.max(...validMatches.map(m => m[key] || 0));

  const kills   = sum("kills");
  const deaths  = sum("deaths");
  const assists = sum("assists");
  const wins    = validMatches.filter(isWin).length;
  const losses  = validMatches.filter(isLoss).length;

  // Average life duration from ISO durations
  const totalLifeSecs = validMatches.reduce((s, m) => s + parseDuration(m.avgLifeDuration), 0);
  const avgLifeSecs   = totalLifeSecs / n;

  // Medal aggregation
  const medalTotals = {};
  validMatches.forEach(m => {
    (m.medals || []).forEach(med => {
      if (!medalTotals[med.NameId]) medalTotals[med.NameId] = 0;
      medalTotals[med.NameId] += med.Count;
    });
  });

  const interestingMedals = Object.entries(medalTotals)
    .filter(([id]) => isInterestingMedal(Number(id)))
    .map(([id, count]) => ({ nameId: Number(id), name: getMedalName(Number(id)), count }))
    .sort((a, b) => b.count - a.count);

  return {
    gamertag,
    matchesPlayed:    n,
    wins,
    losses,
    winRate:          wins / n,
    kills,
    deaths,
    assists,
    kda:              deaths > 0 ? (kills + assists * 0.3) / deaths : kills,
    kdRaw:            deaths > 0 ? kills / deaths : kills,
    avgKills:         avg("kills"),
    avgDeaths:        avg("deaths"),
    avgAssists:       avg("assists"),
    avgAccuracy:      avg("accuracy"),
    avgDamageDealt:   avg("damageDealt"),
    avgDamageTaken:   avg("damageTaken"),
    avgLifeSecs,
    totalGrenadeKills:     sum("grenadeKills"),
    avgGrenadeKills:       avg("grenadeKills"),
    totalPowerWeaponKills: sum("powerWeaponKills"),
    avgPowerWeaponKills:   avg("powerWeaponKills"),
    totalHeadshots:        sum("headshots"),
    totalMeleeKills:       sum("meleeKills"),
    maxKillingSpree:       max("maxKillingSpree"),
    totalScore:            sum("score"),
    avgScore:              avg("score"),
    interestingMedals,
    medalTotals,
  };
}

// Build the comparison table rows for all stat categories
export const STAT_COLUMNS = [
  { key: "matchesPlayed",       label: "Matches",          format: v => v,                                    higherBetter: true  },
  { key: "winRate",             label: "Win Rate",         format: v => `${(v*100).toFixed(1)}%`,             higherBetter: true  },
  { key: "wins",                label: "Wins",             format: v => v,                                    higherBetter: true  },
  { key: "losses",              label: "Losses",           format: v => v,                                    higherBetter: false },
  { key: "kda",                 label: "KDA",              format: v => v.toFixed(2),                         higherBetter: true  },
  { key: "kdRaw",               label: "K/D",              format: v => v.toFixed(2),                         higherBetter: true  },
  { key: "avgKills",            label: "Avg Kills",        format: v => v.toFixed(1),                         higherBetter: true  },
  { key: "avgDeaths",           label: "Avg Deaths",       format: v => v.toFixed(1),                         higherBetter: false },
  { key: "avgAssists",          label: "Avg Assists",      format: v => v.toFixed(1),                         higherBetter: true  },
  { key: "avgAccuracy",         label: "Accuracy",         format: v => `${v.toFixed(1)}%`,                   higherBetter: true  },
  { key: "avgDamageDealt",      label: "Avg Dmg Dealt",    format: v => Math.round(v).toLocaleString(),       higherBetter: true  },
  { key: "avgDamageTaken",      label: "Avg Dmg Taken",    format: v => Math.round(v).toLocaleString(),       higherBetter: false },
  { key: "avgLifeSecs",         label: "Avg Life",         format: v => formatLife(v),                        higherBetter: true  },
  { key: "avgGrenadeKills",     label: "Nade Kills",       format: v => v.toFixed(2),                         higherBetter: true  },
  { key: "avgPowerWeaponKills", label: "Power Kills",      format: v => v.toFixed(2),                         higherBetter: true  },
  { key: "totalHeadshots",      label: "Headshots",        format: v => v,                                    higherBetter: true  },
  { key: "maxKillingSpree",     label: "Best Spree",       format: v => v,                                    higherBetter: true  },
  { key: "avgScore",            label: "Avg Score",        format: v => Math.round(v).toLocaleString(),       higherBetter: true  },
];

function formatLife(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Find the best and worst value among players for a stat
export function getRankings(stats, colKey, higherBetter) {
  const values = stats.map(s => s[colKey] ?? 0);
  const best  = higherBetter ? Math.max(...values) : Math.min(...values);
  const worst = higherBetter ? Math.min(...values) : Math.max(...values);
  return { best, worst };
}
