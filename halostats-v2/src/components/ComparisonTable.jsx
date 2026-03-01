import React, { useState, useMemo } from "react";
import { Avatar, StatValue, FilterBar } from "./UI";
import { aggregatePlayerStats, STAT_COLUMNS, DATE_RANGES, GAME_MODE_FILTERS, getRankings, filterByDate } from "../utils/stats";
import PLAYERS from "../players";

const DATE_OPTIONS = Object.keys(DATE_RANGES);
const MODE_OPTIONS = Object.keys(GAME_MODE_FILTERS);

export default function ComparisonTable({ squadData }) {
  const [dateRange, setDateRange] = useState("This Month");
  const [gameMode, setGameMode]   = useState("All");
  const [sortCol,  setSortCol]    = useState("kda");
  const [sortAsc,  setSortAsc]    = useState(false);

  // Build per-player aggregate stats
  const playerStats = useMemo(() => {
    if (!squadData) return [];

    return squadData.players.map(playerData => {
      // Find player config from players.js
      const config = PLAYERS.find(p =>
        p.gamertag.toLowerCase() === playerData.gamertag.toLowerCase()
      ) || { gamertag: playerData.gamertag, color: "#888", initials: "??" };

      // Filter matches by date + mode
      const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);
      const filtered = filterByDate(playerData.matches || [], dateRange)
        .filter(modeFilter);

      const agg = aggregatePlayerStats(playerData, filtered);
      return { ...agg, config, error: playerData.error };
    }).filter(Boolean);
  }, [squadData, dateRange, gameMode]);

  // Sort
  const sorted = useMemo(() => {
    return [...playerStats].sort((a, b) => {
      const av = a[sortCol] ?? 0;
      const bv = b[sortCol] ?? 0;
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? av - bv : bv - av;
    });
  }, [playerStats, sortCol, sortAsc]);

  function handleSort(key) {
    if (key === sortCol) setSortAsc(a => !a);
    else { setSortCol(key); setSortAsc(false); }
  }

  if (!squadData) return null;
  if (!sorted.length) return (
    <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      No match data available
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Filters */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Date Range</div>
          <FilterBar>
            {DATE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${dateRange === opt ? "active" : ""}`} onClick={() => setDateRange(opt)}>
                {opt}
              </button>
            ))}
          </FilterBar>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Game Mode</div>
          <FilterBar>
            {MODE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${gameMode === opt ? "active" : ""}`} onClick={() => setGameMode(opt)}>
                {opt}
              </button>
            ))}
          </FilterBar>
        </div>
      </div>

      {/* Match count summary */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {sorted.map(s => (
          <div key={s.gamertag} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 12px", background: "var(--surface2)",
            border: "1px solid var(--border)", borderRadius: 20,
          }}>
            <Avatar player={s.config} size={20} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mid)" }}>
              {s.gamertag}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>
              {s.matchesPlayed} games
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: s.winRate >= 0.5 ? "var(--win)" : "var(--loss)" }}>
              {(s.winRate * 100).toFixed(0)}% WR
            </span>
          </div>
        ))}
      </div>

      {/* Main comparison table — horizontal scroll on mobile */}
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 140, position: "sticky", left: 0, background: "var(--bg2)", zIndex: 2 }}>
                Player
              </th>
              {STAT_COLUMNS.slice(1).map(col => (
                <th
                  key={col.key}
                  className={sortCol === col.key ? "sorted" : ""}
                  onClick={() => handleSort(col.key)}
                  style={{ textAlign: "center", minWidth: 90 }}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span style={{ marginLeft: 4 }}>{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, rowIdx) => (
              <tr key={s.gamertag}>
                {/* Sticky player column */}
                <td style={{
                  position: "sticky", left: 0, background: "var(--surface)", zIndex: 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                      color: rowIdx === 0 ? "var(--gold)" : rowIdx === 1 ? "var(--silver)" : rowIdx === 2 ? "var(--bronze)" : "var(--text-muted)",
                      minWidth: 16,
                    }}>
                      #{rowIdx + 1}
                    </span>
                    <Avatar player={s.config} size={26} />
                    <span style={{ fontFamily: "var(--font-hud)", fontSize: 13, fontWeight: 700 }}>
                      {s.gamertag}
                    </span>
                  </div>
                </td>
                {/* Stat columns */}
                {STAT_COLUMNS.slice(1).map(col => {
                  const { best, worst } = getRankings(sorted, col.key, col.higherBetter);
                  const val = s[col.key] ?? 0;
                  const isBest  = val === best  && sorted.length > 1;
                  const isWorst = val === worst && sorted.length > 1;
                  return (
                    <td key={col.key} style={{ textAlign: "center" }}>
                      <StatValue
                        value={val}
                        isBest={isBest}
                        isWorst={isWorst}
                        format={col.format}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {[
          { color: "var(--win)",  label: "▲ Best in squad"  },
          { color: "var(--loss)", label: "▼ Worst in squad" },
        ].map(item => (
          <span key={item.label} style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: item.color,
            letterSpacing: 1,
          }}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
