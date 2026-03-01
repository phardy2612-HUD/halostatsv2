import React, { useState, useMemo } from "react";
import { SectionLabel, Avatar, FilterBar } from "./UI";
import { DATE_RANGES, GAME_MODE_FILTERS, filterByDate } from "../utils/stats";
import { isInterestingMedal, getMedalName } from "../utils/medals";
import PLAYERS from "../players";

const DATE_OPTIONS = Object.keys(DATE_RANGES);
const MODE_OPTIONS = Object.keys(GAME_MODE_FILTERS);

export default function MedalsTable({ squadData }) {
  const [dateRange, setDateRange] = useState("This Month");
  const [gameMode,  setGameMode]  = useState("All");
  const [sortBy,    setSortBy]    = useState("total");

  const { medalRows, players } = useMemo(() => {
    if (!squadData) return { medalRows: [], players: [] };

    const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);
    const playerConfigs = squadData.players.map(pd => ({
      ...pd,
      config: PLAYERS.find(p => p.gamertag.toLowerCase() === pd.gamertag.toLowerCase())
        || { gamertag: pd.gamertag, color: "#888", initials: "??" },
      filteredMatches: filterByDate(pd.matches || [], dateRange).filter(modeFilter),
    }));

    // Aggregate medals per player
    const playerMedalTotals = playerConfigs.map(p => {
      const totals = {};
      p.filteredMatches.forEach(m => {
        (m.medals || []).forEach(med => {
          if (isInterestingMedal(med.NameId)) {
            totals[med.NameId] = (totals[med.NameId] || 0) + med.Count;
          }
        });
      });
      return totals;
    });

    // Collect all interesting medal IDs that any player has
    const allMedalIds = new Set();
    playerMedalTotals.forEach(totals => Object.keys(totals).forEach(id => allMedalIds.add(Number(id))));

    // Build rows
    const rows = [...allMedalIds].map(nameId => {
      const counts = playerConfigs.map((_, i) => playerMedalTotals[i][nameId] || 0);
      return {
        nameId,
        name: getMedalName(nameId),
        counts,
        total: counts.reduce((s, v) => s + v, 0),
      };
    });

    // Sort
    rows.sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : b.total - a.total);

    return { medalRows: rows, players: playerConfigs };
  }, [squadData, dateRange, gameMode, sortBy]);

  if (!squadData) return null;
  if (!medalRows.length) return (
    <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      No medal data for this period
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Date Range</div>
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
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 160, cursor: "pointer" }} onClick={() => setSortBy("name")}>
                Medal {sortBy === "name" && "↑"}
              </th>
              {players.map(p => (
                <th key={p.gamertag} style={{ textAlign: "center", minWidth: 80 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <Avatar player={p.config} size={22} />
                    <span style={{ fontSize: 8, color: "var(--text-muted)" }}>
                      {p.gamertag.slice(0, 10)}
                    </span>
                  </div>
                </th>
              ))}
              <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setSortBy("total")}>
                Total {sortBy === "total" && "↓"}
              </th>
            </tr>
          </thead>
          <tbody>
            {medalRows.map(row => {
              const maxCount = Math.max(...row.counts);
              return (
                <tr key={row.nameId}>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-hud)", fontSize: 13, fontWeight: 700,
                      color: "var(--text)",
                    }}>
                      {row.name}
                    </span>
                  </td>
                  {row.counts.map((count, i) => (
                    <td key={i} style={{ textAlign: "center" }}>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: count === maxCount && count > 0 ? 700 : 400,
                        color: count === maxCount && count > 0 ? "var(--gold)" : count === 0 ? "var(--border2)" : "var(--text)",
                      }}>
                        {count || "—"}
                      </span>
                    </td>
                  ))}
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
                      {row.total}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
