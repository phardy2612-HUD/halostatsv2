import React, { useState, useMemo } from "react";
import { FilterBar } from "./UI";
import { getMedalName, isInterestingMedal } from "../utils/medals";
import { filterByDate, DATE_RANGES, GAME_MODE_FILTERS } from "../utils/stats";
import PLAYERS from "../players";

const DATE_OPTIONS = Object.keys(DATE_RANGES);
const MODE_OPTIONS = Object.keys(GAME_MODE_FILTERS);

const SPRITE_COLS = 16;
const SPRITE_SIZE = 256;
const DISPLAY_SIZE = 48;

function MedalIcon({ spriteIndex, spriteUrl, difficulty = 0 }) {
  const col = spriteIndex % SPRITE_COLS;
  const row = Math.floor(spriteIndex / SPRITE_COLS);
  const scale = DISPLAY_SIZE / SPRITE_SIZE;
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY[0];

  const wrapStyle = {
    width: DISPLAY_SIZE,
    height: DISPLAY_SIZE,
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border: `1.5px solid ${cfg.border}`,
    boxShadow: cfg.glow || "none",
    transition: "box-shadow 0.2s",
  };

  if (!spriteUrl) {
    return (
      <div style={{
        ...wrapStyle,
        background: "var(--surface3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
      }}>?</div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        backgroundImage: `url(${spriteUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`,
        backgroundSize: `${SPRITE_COLS * SPRITE_SIZE}px auto`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        imageRendering: "crisp-edges",
      }} />
    </div>
  );
}

const DIFFICULTY = {
  0: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", label: "Normal",    glow: null,                              border: "rgba(255,255,255,0.12)" },
  1: { bg: "rgba(0,180,216,0.15)",   color: "var(--accent)",          label: "Heroic",    glow: "0 0 10px rgba(0,180,216,0.5)",    border: "rgba(0,180,216,0.5)"    },
  2: { bg: "rgba(200,169,81,0.18)",  color: "var(--gold)",            label: "Legendary", glow: "0 0 14px rgba(200,169,81,0.65)",  border: "rgba(200,169,81,0.7)"   },
  3: { bg: "rgba(220,60,60,0.18)",   color: "#ff6060",                label: "Mythic",    glow: "0 0 18px rgba(220,60,60,0.8), 0 0 40px rgba(220,60,60,0.3)", border: "rgba(220,60,60,0.8)" },
};

function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY[0];
  return (
    <span style={{
      fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 2,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      flexShrink: 0,
    }}>{cfg.label}</span>
  );
}

export default function MedalsTable({ squadData, medalMeta }) {
  const [dateRange, setDateRange] = useState("This Month");
  const [gameMode, setGameMode]   = useState("All");
  const [showAll,  setShowAll]    = useState(false);
  const [tooltip,  setTooltip]    = useState(null);

  const spriteUrl = "/api/halo/medals?sprite=1";

  const { players, medals } = useMemo(() => {
    if (!squadData) return { players: [], medals: [] };

    const modeFilter = GAME_MODE_FILTERS[gameMode] || (() => true);
    const playerList = squadData.players.map(pd => ({
      gamertag: pd.gamertag,
      config: PLAYERS.find(p => p.gamertag.toLowerCase() === pd.gamertag.toLowerCase())
              || { gamertag: pd.gamertag, color: "#888", initials: "??" },
    }));

    const perPlayer = {};
    squadData.players.forEach(pd => {
      perPlayer[pd.gamertag] = {};
      const filtered = filterByDate(pd.matches || [], dateRange).filter(modeFilter);
      filtered.forEach(m => {
        (m.medals || []).forEach(med => {
          perPlayer[pd.gamertag][med.NameId] = (perPlayer[pd.gamertag][med.NameId] || 0) + med.Count;
        });
      });
    });

    const allIds = new Set();
    Object.values(perPlayer).forEach(obj => Object.keys(obj).forEach(id => allIds.add(Number(id))));

    const filteredIds = [...allIds].filter(id => showAll || isInterestingMedal(id));

    const medalRows = filteredIds.map(id => {
      const meta = medalMeta?.medals?.[id];
      const counts = {};
      let total = 0;
      playerList.forEach(p => {
        counts[p.gamertag] = perPlayer[p.gamertag]?.[id] || 0;
        total += counts[p.gamertag];
      });
      return {
        nameId:      id,
        name:        meta?.name        || getMedalName(id),
        description: meta?.description || "",
        spriteIndex: meta?.spriteIndex ?? null,
        difficulty:  meta?.difficulty  ?? 0,
        counts,
        total,
      };
    })
      .filter(r => r.total > 0)
      .sort((a, b) => b.difficulty - a.difficulty || b.total - a.total);

    return { players: playerList, medals: medalRows };
  }, [squadData, medalMeta, dateRange, gameMode, showAll]);

  if (!squadData) return null;
  const tooltipMedal = tooltip ? medals.find(m => m.nameId === tooltip.nameId) : null;

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

      {!medalMeta && (
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "10px 14px", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          Loading medal images from Waypoint…
        </div>
      )}

      {medals.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>No medals in this period</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Try a wider date range or switch to "Show All"</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "var(--surface)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 300, textAlign: "left", paddingLeft: 16 }}>Medal</th>
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
                const cfg = DIFFICULTY[row.difficulty] || DIFFICULTY[0];
                return (
                  <tr key={row.nameId}
                    onMouseEnter={e => setTooltip({ nameId: row.nameId, x: e.clientX, y: e.clientY })}
                    onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "default" }}
                  >
                    <td style={{ padding: "10px 16px", borderLeft: `2px solid ${cfg.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <MedalIcon
                          spriteIndex={row.spriteIndex ?? 0}
                          spriteUrl={medalMeta ? spriteUrl : null}
                          difficulty={row.difficulty}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                              {row.name}
                            </span>
                            <DifficultyBadge difficulty={row.difficulty} />
                          </div>
                          {row.description && (
                            <div style={{
                              fontFamily: "var(--font-body)", fontSize: 11,
                              color: "var(--text-muted)", lineHeight: 1.4,
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {row.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {players.map(p => {
                      const count = row.counts[p.gamertag] || 0;
                      const isLeader = count === maxCount && count > 0;
                      return (
                        <td key={p.gamertag} style={{
                          color: isLeader ? "var(--gold)" : count === 0 ? "var(--text-muted)" : "var(--text)",
                          fontWeight: isLeader ? 700 : 400, fontSize: 15,
                        }}>
                          {count === 0 ? "—" : count}
                        </td>
                      );
                    })}
                    <td style={{ color: "var(--accent)", fontWeight: 600, fontSize: 15 }}>{row.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Hover tooltip */}
      {tooltip && tooltipMedal && (
        <div style={{
          position: "fixed",
          left: Math.min(tooltip.x + 16, window.innerWidth - 290),
          top: tooltip.y - 10,
          zIndex: 200,
          background: "var(--surface2)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--r)",
          padding: "14px 16px",
          width: 260,
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <MedalIcon spriteIndex={tooltipMedal.spriteIndex ?? 0} spriteUrl={medalMeta ? spriteUrl : null} difficulty={tooltipMedal.difficulty} />
            <div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>
                {tooltipMedal.name}
              </div>
              <DifficultyBadge difficulty={tooltipMedal.difficulty} />
            </div>
          </div>
          {tooltipMedal.description && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: 0 }}>
              {tooltipMedal.description}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(DIFFICULTY).reverse().map(([d, cfg]) => (
          <span key={d} style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: cfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ● {cfg.label}
          </span>
        ))}
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: "auto" }}>
          ● Leader
        </span>
      </div>
    </div>
  );
}
