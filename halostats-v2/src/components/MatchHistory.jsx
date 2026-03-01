import React, { useState, useMemo } from "react";
import { Avatar, OutcomePill, SectionLabel, FilterBar, Spinner } from "./UI";
import { formatSeconds, parseDuration } from "../utils/medals";
import { DATE_RANGES, GAME_MODE_FILTERS, filterByDate } from "../utils/stats";
import PLAYERS from "../players";

const DATE_OPTIONS = Object.keys(DATE_RANGES);
const MODE_OPTIONS = Object.keys(GAME_MODE_FILTERS);

export default function MatchHistory({ squadData, loading }) {
  const [dateRange, setDateRange] = useState("This Week");
  const [gameMode, setGameMode]   = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("all");

  const playerConfigs = useMemo(() => {
    if (!squadData) return [];
    return squadData.players.map(pd => ({
      ...pd,
      config: PLAYERS.find(p => p.gamertag.toLowerCase() === pd.gamertag.toLowerCase())
        || { gamertag: pd.gamertag, color: "#888", initials: "??" },
    }));
  }, [squadData]);

  const displayMatches = useMemo(() => {
    if (!squadData) return [];
    const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);

    const targets = selectedPlayer === "all"
      ? playerConfigs
      : playerConfigs.filter(p => p.gamertag === selectedPlayer);

    return targets.flatMap(p =>
      filterByDate(p.matches || [], dateRange)
        .filter(modeFilter)
        .map(m => ({ ...m, playerConfig: p.config, gamertag: p.gamertag }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [squadData, dateRange, gameMode, selectedPlayer, playerConfigs]);

  if (loading) return <Spinner label="Loading matches..." />;
  if (!squadData) return null;

  function groupByDate(matches) {
    const groups = {};
    const order = [];
    matches.forEach(m => {
      const d = new Date(m.date);
      const now = new Date();
      let label;
      if (d.toDateString() === now.toDateString()) label = "Today";
      else if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) label = "Yesterday";
      else label = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
      if (!groups[label]) { groups[label] = []; order.push(label); }
      groups[label].push(m);
    });
    return order.map(label => ({ label, matches: groups[label] }));
  }

  const grouped = groupByDate(displayMatches);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Date</div>
          <FilterBar>
            {DATE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${dateRange === opt ? "active" : ""}`} onClick={() => setDateRange(opt)}>{opt}</button>
            ))}
          </FilterBar>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Mode</div>
          <FilterBar>
            {MODE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${gameMode === opt ? "active" : ""}`} onClick={() => setGameMode(opt)}>{opt}</button>
            ))}
          </FilterBar>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Player</div>
          <FilterBar>
            <button className={`chip ${selectedPlayer === "all" ? "active" : ""}`} onClick={() => setSelectedPlayer("all")}>All</button>
            {playerConfigs.map(p => (
              <button key={p.gamertag} className={`chip ${selectedPlayer === p.gamertag ? "active" : ""}`} onClick={() => setSelectedPlayer(p.gamertag)}>
                {p.gamertag}
              </button>
            ))}
          </FilterBar>
        </div>
      </div>

      {!displayMatches.length ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
          No matches in this period
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.label}>
            <SectionLabel>{group.label}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.matches.map((m, i) => (
                <MatchCard key={`${m.matchId}-${m.gamertag}-${i}`} match={m} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MatchCard({ match: m }) {
  const [expanded, setExpanded] = useState(false);
  const lifeStr = formatSeconds(parseDuration(m.avgLifeDuration));
  const kdColor = m.kda >= 1.5 ? "var(--win)" : m.kda >= 1.0 ? "var(--accent)" : m.kda >= 0.7 ? "var(--draw)" : "var(--loss)";

  return (
    <div className="card" style={{ cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
      {/* Top row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", background: "var(--surface2)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Avatar player={m.playerConfig} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-hud)", fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>
            {m.gamertag}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>
              {m.isRanked ? "RANKED" : "CUSTOM"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
              {new Date(m.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <OutcomePill outcome={m.outcome} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: kdColor, minWidth: 48, textAlign: "right" }}>
          {(m.kda || 0).toFixed(2)}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--text-muted)", fontWeight: 400, letterSpacing: 1 }}>KDA</div>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        padding: "10px 14px", gap: 0,
      }}>
        {[
          { l: "K", v: m.kills },
          { l: "D", v: m.deaths },
          { l: "A", v: m.assists },
          { l: "ACC", v: `${(m.accuracy||0).toFixed(0)}%` },
          { l: "DMG", v: Math.round(m.damageDealt||0).toLocaleString() },
        ].map(({ l, v }) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700 }}>{v}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, paddingTop: 12 }}>
            {[
              { l: "Nade Kills",   v: m.grenadeKills },
              { l: "Power Kills",  v: m.powerWeaponKills },
              { l: "Headshots",    v: m.headshots },
              { l: "Melee Kills",  v: m.meleeKills },
              { l: "Dmg Taken",    v: Math.round(m.damageTaken||0).toLocaleString() },
              { l: "Avg Life",     v: lifeStr },
              { l: "Best Spree",   v: m.maxKillingSpree },
              { l: "Score",        v: m.score?.toLocaleString() },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign: "center", padding: "6px 0" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-mid)" }}>{v}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Medals earned this match */}
          {(m.medals || []).length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {m.medals.slice(0, 8).map((med, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  background: "var(--bg2)", border: "1px solid var(--border2)",
                  borderRadius: 4, padding: "3px 8px", color: "var(--text-mid)",
                }}>
                  {getMedalName(med.NameId)} ×{med.Count}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getMedalName(id) {
  const names = {
    2789163448: "Ninja", 1229482539: "Pancake", 989552596: "Grenade Stick",
    1080613889: "Perfection", 1350019962: "Extermination",
    2877574698: "Killionaire", 1720896249: "Killtacular",
    1580027473: "Killtrocity", 3022799793: "Killamanjaro",
    3601718394: "Kilpocalypse", 2168749214: "Overkill",
    467375945: "Triple Kill", 1486446780: "Double Kill",
    3705888289: "Running Riot", 4119182945: "Rampage",
    523965598: "Bulltrue", 1068279322: "Reversal",
    4195138384: "Hail Mary", 2421588822: "From the Grave",
  };
  return names[id] || `Medal`;
}
