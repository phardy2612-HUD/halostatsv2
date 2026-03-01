import React, { useState, useEffect } from "react";
import "./index.css";
import PLAYERS from "./players";
import useSquadData from "./hooks/useSquadData";
import TokenSettings from "./components/TokenSettings";
import TokenExpiryBanner from "./components/TokenExpiryBanner";
import ComparisonTable from "./components/ComparisonTable";
import MedalsTable from "./components/MedalsTable";
import MatchHistory from "./components/MatchHistory";
import { Avatar, Spinner, TabBar, GlowButton, ErrorBanner } from "./components/UI";

const TABS = [
  { id: "compare", label: "Compare", icon: "⚔️" },
  { id: "medals",  label: "Medals",  icon: "🏅" },
  { id: "history", label: "History", icon: "📋" },
  { id: "token",   label: "Token",   icon: "🔑" },
];

const FETCH_COUNTS = [25, 50, 100];

export default function App() {
  const [tab,          setTab]          = useState("compare");
  const [fetchCount,   setFetchCount]   = useState(25);
  const [sessionReady, setSessionReady] = useState(false);
  const { data, loading, error, session, checkSession, fetchSquad, medalMeta } = useSquadData();

  const gamertags = PLAYERS.map(p => p.gamertag);

  useEffect(() => {
    checkSession().then(sess => {
      setSessionReady(true);
      if (sess?.loggedIn) fetchSquad(gamertags, fetchCount);
    });
  }, []); // eslint-disable-line

  function handleTokenSaved() {
    checkSession().then(() => {
      setTab("compare");
      fetchSquad(gamertags, fetchCount);
    });
  }

  function handleRefresh() {
    fetchSquad(gamertags, fetchCount);
  }

  function handleCountChange(n) {
    setFetchCount(n);
    fetchSquad(gamertags, n);
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
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: session?.loggedIn ? 80 : 0 }}>
          <TokenSettings onSaved={handleTokenSaved} />
        </div>
        {session?.loggedIn && <TabBar tabs={TABS} active={tab} onChange={setTab} />}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

      {/* ── Header — Waypoint style ── */}
      <header style={{
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border2)",
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 16px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48 }}>
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

            {/* Player avatars */}
            <div style={{ display: "flex", gap: 6 }}>
              {PLAYERS.map(p => <Avatar key={p.gamertag} player={p} size={26} />)}
            </div>
          </div>

          {/* Token expiry */}
          {session && <TokenExpiryBanner session={session} onUpdate={() => setTab("token")} />}

          {/* Tab nav + controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
            {/* Tabs */}
            <div style={{ display: "flex" }}>
              {TABS.filter(t => t.id !== "token").map(t => (
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

            {/* Fetch count + refresh */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {FETCH_COUNTS.map(n => (
                <button key={n} className={`chip ${fetchCount === n ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 11 }}
                  onClick={() => handleCountChange(n)}>
                  {n}
                </button>
              ))}
              <button onClick={handleRefresh} disabled={loading} style={{
                background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
                color: loading ? "var(--text-muted)" : "var(--accent)",
                fontSize: 16, padding: "0 4px",
                animation: loading ? "spin 0.7s linear infinite" : "none",
                display: "inline-block",
              }} title="Refresh">↻</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
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
              {tab === "medals"  && <MedalsTable squadData={data} medalMeta={medalMeta} />}
              {tab === "history" && <MatchHistory squadData={data} />}
            </>
          )}

          {data && (
            <div style={{ marginTop: 16, fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em", textAlign: "right" }}>
              Updated {new Date(data.fetchedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </main>

      {/* Bottom nav for mobile (token tab access) */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border2)",
        display: "flex", justifyContent: "flex-end",
        padding: "8px 16px max(8px, env(safe-area-inset-bottom))",
      }}>
        <button onClick={() => setTab("token")} style={{
          background: "none", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)",
          padding: "6px 12px", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--text-muted)",
        }}>
          🔑 Token
        </button>
      </nav>
    </div>
  );
}
