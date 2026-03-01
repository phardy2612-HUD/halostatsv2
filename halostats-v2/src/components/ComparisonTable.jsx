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

  const playerStats = useMemo(() => {
    if (!squadData) return [];
    return squadData.players.map(playerData => {
      const config = PLAYERS.find(p =>
        p.gamertag.toLowerCase() === playerData.gamertag.toLowerCase()
      ) || { gamertag: playerData.gamertag, color: "#888", initials: "??" };
      const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);
      const filtered = filterByDate(playerData.matches || [], dateRange).filter(modeFilter);
      const agg = aggregatePlayerStats(playerData, filtered);
      return { ...agg, config, error: playerData.error, noData: filtered.length === 0 };
    });
  }, [squadData, dateRange, gameMode]);

  const sorted = useMemo(() => {
    return [...playerStats].sort((a, b) => {
      const av = a[sortCol] ?? 0;
      const bv = b[sortCol] ?? 0;
      return sortAsc ? av - bv : bv - av;
    });
  }, [playerStats, sortCol, sortAsc]);

  function handleSort(key) {
    if (key === sortCol) setSortAsc(a => !a);
    else { setSortCol(key); setSortAsc(false); }
  }

  if (!squadData) return null;

  const statCols = STAT_COLUMNS.slice(1); // skip "Matches" col, show in summary row

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Period</div>
          <FilterBar>
            {DATE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${dateRange === opt ? "active" : ""}`} onClick={() => setDateRange(opt)}>{opt}</button>
            ))}
          </FilterBar>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Mode</div>
          <FilterBar>
            {MODE_OPTIONS.map(opt => (
              <button key={opt} className={`chip ${gameMode === opt ? "active" : ""}`} onClick={() => setGameMode(opt)}>{opt}</button>
            ))}
          </FilterBar>
        </div>
      </div>

      {/* Player summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, background: "var(--border)" }}>
        {sorted.map((s, i) => (
          <div key={s.gamertag} style={{
            background: "var(--surface)", padding: "14px 16px",
            borderTop: i === 0 ? `2px solid ${s.config.color}` : "2px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Avatar player={s.config} size={28} />
              <div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em" }}>
                  {s.gamertag}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                  {s.matchesPlayed} matches
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
              {[
                { l: "K/D",  v: s.kdRaw?.toFixed(2)  },
                { l: "W/L",  v: `${s.wins}/${s.losses}` },
                { l: "Acc",  v: `${(s.avgAccuracy||0).toFixed(0)}%` },
                { l: "Score",v: Math.round(s.avgScore||0).toLocaleString() },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1 }}>{v}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {s.noData && (
              <div style={{ marginTop: 8, fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
                No data — check privacy settings
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main comparison table */}
      <div style={{ overflowX: "auto", background: "var(--surface)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: 160, width: 160 }}>Player</th>
              {statCols.map(col => (
                <th
                  key={col.key}
                  className={sortCol === col.key ? "sorted" : ""}
                  onClick={() => handleSort(col.key)}
                  style={{ minWidth: 80 }}
                >
                  {col.label}
                  {sortCol === col.key && <span style={{ marginLeft: 3, opacity: 0.7 }}>{sortAsc ? "↑" : "↓"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, rowIdx) => (
              <tr key={s.gamertag}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: rowIdx === 0 ? "var(--gold)" : rowIdx === 1 ? "var(--silver)" : rowIdx === 2 ? "var(--bronze)" : "var(--text-muted)",
                      minWidth: 18,
                    }}>
                      #{rowIdx + 1}
                    </span>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.config.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500 }}>
                      {s.gamertag}
                    </span>
                  </div>
                </td>
                {statCols.map(col => {
                  const { best, worst } = getRankings(sorted, col.key, col.higherBetter);
                  const val = s[col.key] ?? 0;
                  const isBest  = val === best  && sorted.length > 1 && val !== worst;
                  const isWorst = val === worst && sorted.length > 1 && val !== best;
                  return (
                    <td key={col.key}>
                      <StatValue value={val} isBest={isBest} isWorst={isWorst} format={col.format} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
        {[{ color: "var(--win)", label: "Best" }, { color: "var(--loss)", label: "Worst" }].map(item => (
          <span key={item.label} style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: item.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ● {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
