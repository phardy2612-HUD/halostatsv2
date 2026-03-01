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
  { id: "compare",  label: "Compare",  icon: "⚔️" },
  { id: "medals",   label: "Medals",   icon: "🏅" },
  { id: "history",  label: "History",  icon: "📋" },
  { id: "token",    label: "Token",    icon: "🔑" },
];

const FETCH_COUNTS = [25, 50, 100];

export default function App() {
  const [tab,          setTab]          = useState("compare");
  const [fetchCount,   setFetchCount]   = useState(25);
  const [sessionReady, setSessionReady] = useState(false);
  const { data, loading, error, session, checkSession, fetchSquad } = useSquadData();

  const gamertags = PLAYERS.map(p => p.gamertag);

  useEffect(() => {
    checkSession().then(sess => {
      setSessionReady(true);
      if (sess.loggedIn) {
        fetchSquad(gamertags, fetchCount);
      }
    });
  }, []); // eslint-disable-line

  function handleTokenSaved() {
    checkSession().then(() => {
      setTab("compare");
      fetchSquad(gamertags, fetchCount);
    });
  }

  // First load spinner
  if (!sessionReady) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  // Show token setup if not logged in, or if on the token tab
  if (!session?.loggedIn || tab === "token") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: session?.loggedIn ? 80 : 0 }}>
          <TokenSettings onSaved={handleTokenSaved} />
        </div>
        {session?.loggedIn && (
          <TabBar tabs={TABS} active={tab} onChange={setTab} />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(7,8,12,0.97)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border2)",
        padding: "max(12px, env(safe-area-inset-top)) 16px 12px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 900, margin: "0 auto", width: "100%",
        }}>
          {/* Logo */}
          <div>
            <div style={{
              fontFamily: "var(--font-hud)", fontSize: 20, fontWeight: 900,
              letterSpacing: 3, textTransform: "uppercase", lineHeight: 1,
            }}>
              <span style={{ color: "var(--accent)" }}>HALO</span>
              <span style={{ color: "var(--text)" }}> SQUAD</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 2, marginTop: 2 }}>
              STATS TRACKER
            </div>
          </div>

          {/* Player avatars */}
          <div style={{ display: "flex" }}>
            {PLAYERS.map((p, i) => (
              <div key={p.gamertag} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar player={p} size={28} />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {FETCH_COUNTS.map(n => (
                <button key={n}
                  className={`chip ${fetchCount === n ? "active" : ""}`}
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => setFetchCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchSquad(gamertags, fetchCount)}
              disabled={loading}
              title="Refresh stats"
              style={{
                width: 32, height: 32, borderRadius: "var(--r-sm)",
                background: "var(--surface2)", border: "1px solid var(--border2)",
                color: loading ? "var(--text-muted)" : "var(--accent)",
                fontSize: 15, cursor: loading ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: loading ? "spin 0.8s linear infinite" : "none",
              }}
            >
              ↻
            </button>
          </div>
        </div>
      </header>

      {/* ── Token expiry banner ── */}
      <TokenExpiryBanner session={session} onRefresh={() => setTab("token")} />

      {/* ── Main content ── */}
      <main style={{
        flex: 1, overflowY: "auto",
        paddingBottom: "max(90px, calc(env(safe-area-inset-bottom) + 80px))",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 14px" }}>

          {loading && !data && <Spinner label="Fetching match data..." />}

          {error && (
            <div style={{ marginBottom: 16 }}>
              <ErrorBanner
                message={
                  error === "token_expired" ? "Token expired — tap the 🔑 tab to update it"
                  : error === "auth_failed"  ? "Auth failed — tap the 🔑 tab to update your token"
                  : error
                }
              />
              {(error === "token_expired" || error === "auth_failed") && (
                <div style={{ marginTop: 10 }}>
                  <GlowButton onClick={() => setTab("token")}>Update Token</GlowButton>
                </div>
              )}
            </div>
          )}

          {data && (
            <>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
                letterSpacing: 1, marginBottom: 16, textAlign: "right",
              }}>
                Updated {new Date(data.fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                {loading && <span style={{ marginLeft: 8, color: "var(--accent)" }}>• Refreshing...</span>}
              </div>

              {tab === "compare" && <ComparisonTable squadData={data} />}
              {tab === "medals"  && <MedalsTable     squadData={data} />}
              {tab === "history" && <MatchHistory    squadData={data} loading={loading} />}
            </>
          )}

          {!data && !loading && !error && session?.loggedIn && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
                Token saved — ready to load
              </div>
              <GlowButton onClick={() => fetchSquad(gamertags, fetchCount)}>
                Load Squad Data
              </GlowButton>
            </div>
          )}
        </div>
      </main>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
}
