import React, { useState, useEffect } from "react";
import "./index.css";
import PLAYERS from "./players";
import useSquadData from "./hooks/useSquadData";
import TokenSettings from "./components/TokenSettings";
import TokenExpiryBanner from "./components/TokenExpiryBanner";
import ComparisonTable from "./components/ComparisonTable";
import MedalsTable from "./components/MedalsTable";
import { PlayerAvatar, Spinner, GlowButton, ErrorBanner } from "./components/UI";

// History tab hidden until UI is ready
const TABS = [
  { id: "compare", label: "Compare", icon: "⚔️" },
  { id: "medals",  label: "Medals",  icon: "🏅" },
];

const FETCH_COUNT = 100; // fixed — no UI toggle needed

export default function App() {
  const [tab,          setTab]          = useState("compare");
  const [sessionReady, setSessionReady] = useState(false);
  const { data, loading, error, session, checkSession, fetchSquad, medalMeta, medalMetaError } = useSquadData();

  const gamertags = PLAYERS.map(p => p.gamertag);

  useEffect(() => {
    checkSession().then(sess => {
      setSessionReady(true);
      if (sess?.loggedIn) fetchSquad(gamertags, FETCH_COUNT);
    });
  }, []); // eslint-disable-line

  function handleTokenSaved() {
    checkSession().then(() => {
      setTab("compare");
      fetchSquad(gamertags, FETCH_COUNT);
    });
  }

  function handleRefresh() {
    fetchSquad(gamertags, FETCH_COUNT);
  }

  if (!sessionReady) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <Spinner label="Loading" />
      </div>
    );
  }

  if (!session?.loggedIn || tab === "token") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <TokenSettings onSaved={handleTokenSaved} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <header style={{
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border2)",
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 16px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Top bar — logo + player avatars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="13" stroke="var(--accent)" strokeWidth="1.5" />
                  <path d="M7 14h4l3-6 3 12 3-8 2 2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text)" }}>
                Squad Stats
              </span>
            </div>

            {/* Real Waypoint avatars */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {PLAYERS.map(p => (
                <PlayerAvatar key={p.gamertag} player={p} size={32} />
              ))}
            </div>
          </div>

          {/* Token expiry warning */}
          {session && <TokenExpiryBanner session={session} onUpdate={() => setTab("token")} />}

          {/* Tab nav + refresh */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: tab === t.id ? "var(--text)" : "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "12px 14px",
                  borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "all 0.12s",
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {loading && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Fetching…
                </span>
              )}
              <button onClick={handleRefresh} disabled={loading} style={{
                background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
                color: loading ? "var(--text-muted)" : "var(--accent)",
                fontSize: 18, padding: "0 4px",
                display: "inline-block",
                animation: loading ? "spin 0.7s linear infinite" : "none",
              }} title="Refresh">↻</button>
              <button onClick={() => setTab("token")} style={{
                background: "none", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)",
                padding: "5px 10px", cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--text-muted)",
              }}>🔑 Token</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>

          {error && (
            <div style={{ marginBottom: 16 }}>
              <ErrorBanner message={`Error: ${error}`} />
            </div>
          )}

          {loading && !data ? (
            <Spinner label="Fetching match data" />
          ) : !data ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <GlowButton onClick={handleRefresh}>Load Stats</GlowButton>
            </div>
          ) : (
            <>
              {tab === "compare" && <ComparisonTable squadData={data} />}
              {tab === "medals"  && <MedalsTable squadData={data} medalMeta={medalMeta} medalMetaError={medalMetaError} />}
            </>
          )}

          {data && (
            <div style={{ marginTop: 16, fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em", textAlign: "right" }}>
              Updated {new Date(data.fetchedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
