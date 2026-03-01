import React, { useState, useMemo } from "react";
import { Avatar, FilterBar } from "./UI";
import { getMedalName, isInterestingMedal } from "../utils/medals";
import { filterByDate, DATE_RANGES, GAME_MODE_FILTERS } from "../utils/stats";
import PLAYERS from "../players";

const DATE_OPTIONS = Object.keys(DATE_RANGES);
const MODE_OPTIONS = Object.keys(GAME_MODE_FILTERS);

export default function MedalsTable({ squadData }) {
  const [dateRange, setDateRange] = useState("This Month");
  const [gameMode, setGameMode]   = useState("All");
  const [showAll,  setShowAll]    = useState(false);

  // Build medal totals per player
  const { players, medals } = useMemo(() => {
    if (!squadData) return { players: [], medals: [] };

    const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);
    const playerList = squadData.players.map(pd => ({
      gamertag: pd.gamertag,
      config: PLAYERS.find(p => p.gamertag.toLowerCase() === pd.gamertag.toLowerCase())
              || { gamertag: pd.gamertag, color: "#888", initials: "??" },
    }));

    // Aggregate medals per player
    const perPlayer = {}; // { gamertag: { nameId: count } }
    squadData.players.forEach(pd => {
      perPlayer[pd.gamertag] = {};
      const filtered = filterByDate(pd.matches || [], dateRange).filter(modeFilter);
      filtered.forEach(m => {
        (m.medals || []).forEach(med => {
          perPlayer[pd.gamertag][med.NameId] = (perPlayer[pd.gamertag][med.NameId] || 0) + med.Count;
        });
      });
    });

    // Collect all medal IDs that appear across all players
    const allIds = new Set();
    Object.values(perPlayer).forEach(obj => Object.keys(obj).forEach(id => allIds.add(Number(id))));

    // Filter: highlighted only unless showAll
    const filteredIds = [...allIds].filter(id => showAll || isInterestingMedal(id));

    // Build rows: { nameId, name, counts: { gamertag: n }, total }
    const medalRows = filteredIds.map(id => {
      const counts = {};
      let total = 0;
      playerList.forEach(p => {
        counts[p.gamertag] = perPlayer[p.gamertag]?.[id] || 0;
        total += counts[p.gamertag];
      });
      return { nameId: id, name: getMedalName(id), counts, total };
    }).filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);

    return { players: playerList, medals: medalRows };
  }, [squadData, dateRange, gameMode, showAll]);

  if (!squadData) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      {/* Filters */}
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
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className={`chip ${showAll ? "active" : ""}`} onClick={() => setShowAll(v => !v)}>
            {showAll ? "Highlights Only" : "Show All"}
          </button>
        </div>
      </div>

      {medals.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            No medals in this period
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            Try a wider date range or switch to "Show All"
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "var(--surface)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 160, textAlign: "left" }}>Medal</th>
                {players.map(p => (
                  <th key={p.gamertag} style={{ minWidth: 80 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.config.color }} />
                      <span>{p.gamertag}</span>
                    </div>
                  </th>
                ))}
                <th style={{ minWidth: 60, color: "var(--accent)" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {medals.map(row => {
                const maxCount = Math.max(...players.map(p => row.counts[p.gamertag] || 0));
                return (
                  <tr key={row.nameId}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isInterestingMedal(row.nameId) && (
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                        )}
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>{row.name}</span>
                      </div>
                    </td>
                    {players.map(p => {
                      const count = row.counts[p.gamertag] || 0;
                      const isLeader = count === maxCount && count > 0;
                      return (
                        <td key={p.gamertag} style={{ color: isLeader ? "var(--gold)" : count === 0 ? "var(--text-muted)" : "var(--text)", fontWeight: isLeader ? 600 : 400 }}>
                          {count === 0 ? "—" : count}
                        </td>
                      );
                    })}
                    <td style={{ color: "var(--accent)", fontWeight: 600 }}>{row.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", display: "flex", gap: 16 }}>
        <span style={{ color: "var(--gold)" }}>● Leader in that medal</span>
        <span style={{ color: "var(--accent)" }}>Highlighted = notable medals</span>
      </div>
    </div>
  );
}
