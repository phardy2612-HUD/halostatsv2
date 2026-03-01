// src/utils/stats.js
import { parseDuration, isInterestingMedal, getMedalName } from "./medals";

export const DATE_RANGES = {
  "This Week":  () => { const d = new Date(); d.setDate(d.getDate() - 7);  return d; },
  "This Month": () => { const d = new Date(); d.setDate(d.getDate() - 30); return d; },
  "This Year":  () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d; },
  "All Time":   () => new Date(0),
};

export const GAME_MODE_FILTERS = {
  "All":     () => true,
  "Ranked":  m => m.isRanked,
  "Custom":  m => !m.isRanked,
};

// Filter matches by date range
export function filterByDate(matches, rangeLabel) {
  const since = DATE_RANGES[rangeLabel]?.() || new Date(0);
  return matches.filter(m => new Date(m.date) >= since);
}

// Outcome codes: 2=Win, 3=Loss, 1=Draw
function isWin(m)  { return m.outcome === 2; }
function isLoss(m) { return m.outcome === 3; }

// Compute aggregate stats for one player over a set of matches
export function aggregatePlayerStats(playerData, matches) {
  const n = matches.length;
  if (n === 0) return null;

  const sum = (key)    => matches.reduce((s, m) => s + (m[key] || 0), 0);
  const avg = (key)    => n > 0 ? sum(key) / n : 0;
  const max = (key)    => Math.max(...matches.map(m => m[key] || 0));

  const kills            = sum("kills");
  const deaths           = sum("deaths");
  const assists          = sum("assists");
  const wins             = matches.filter(isWin).length;
  const losses           = matches.filter(isLoss).length;

  // Average life duration from ISO durations
  const totalLifeSecs = matches.reduce((s, m) => s + parseDuration(m.avgLifeDuration), 0);
  const avgLifeSecs   = n > 0 ? totalLifeSecs / n : 0;

  // Medal aggregation
  const medalTotals = {};
  matches.forEach(m => {
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
    gamertag:         playerData.gamertag,
    matchesPlayed:    n,
    wins,
    losses,
    winRate:          n > 0 ? wins / n : 0,
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
    totalGrenadeKills:    sum("grenadeKills"),
    avgGrenadeKills:      avg("grenadeKills"),
    totalPowerWeaponKills:sum("powerWeaponKills"),
    avgPowerWeaponKills:  avg("powerWeaponKills"),
    totalHeadshots:       sum("headshots"),
    totalMeleeKills:      sum("meleeKills"),
    maxKillingSpree:      max("maxKillingSpree"),
    totalScore:           sum("score"),
    avgScore:             avg("score"),
    interestingMedals,
    medalTotals,
  };
}

// Build the comparison table rows for all stat categories
export const STAT_COLUMNS = [
  { key: "matchesPlayed",      label: "Matches",         format: v => v,               higherBetter: true  },
  { key: "winRate",            label: "Win Rate",        format: v => `${(v*100).toFixed(1)}%`, higherBetter: true  },
  { key: "wins",               label: "Wins",            format: v => v,               higherBetter: true  },
  { key: "losses",             label: "Losses",          format: v => v,               higherBetter: false },
  { key: "kda",                label: "KDA",             format: v => v.toFixed(2),    higherBetter: true  },
  { key: "kdRaw",              label: "K/D",             format: v => v.toFixed(2),    higherBetter: true  },
  { key: "avgKills",           label: "Avg Kills",       format: v => v.toFixed(1),    higherBetter: true  },
  { key: "avgDeaths",          label: "Avg Deaths",      format: v => v.toFixed(1),    higherBetter: false },
  { key: "avgAssists",         label: "Avg Assists",     format: v => v.toFixed(1),    higherBetter: true  },
  { key: "avgAccuracy",        label: "Accuracy",        format: v => `${v.toFixed(1)}%`, higherBetter: true },
  { key: "avgDamageDealt",     label: "Avg Damage Dealt",format: v => Math.round(v).toLocaleString(), higherBetter: true  },
  { key: "avgDamageTaken",     label: "Avg Damage Taken",format: v => Math.round(v).toLocaleString(), higherBetter: false },
  { key: "avgLifeSecs",        label: "Avg Life",        format: v => formatLife(v),   higherBetter: true  },
  { key: "avgGrenadeKills",    label: "Grenade Kills",   format: v => v.toFixed(2),    higherBetter: true  },
  { key: "avgPowerWeaponKills",label: "Power Weapon Kills", format: v => v.toFixed(2), higherBetter: true  },
  { key: "totalHeadshots",     label: "Headshots",       format: v => v,               higherBetter: true  },
  { key: "maxKillingSpree",    label: "Best Spree",      format: v => v,               higherBetter: true  },
  { key: "avgScore",           label: "Avg Score",       format: v => Math.round(v).toLocaleString(), higherBetter: true },
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
  const best = higherBetter ? Math.max(...values) : Math.min(...values);
  const worst = higherBetter ? Math.min(...values) : Math.max(...values);
  return { best, worst };
}
