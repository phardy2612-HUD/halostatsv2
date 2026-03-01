import React from "react";

export default function LoginScreen({ error }) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, gap: 32, position: "relative", overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        opacity: 0.3,
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontFamily: "var(--font-hud)", fontSize: 48, fontWeight: 900,
            letterSpacing: 6, textTransform: "uppercase", lineHeight: 1,
          }}>
            <span style={{
              color: "var(--accent)",
              textShadow: "0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow)",
            }}>
              HALO
            </span>
            <br />
            <span style={{ color: "var(--text)", fontSize: 32 }}>SQUAD STATS</span>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
            letterSpacing: 4, marginTop: 8, textTransform: "uppercase",
          }}>
            Squad Tracker · Ranked · Custom
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(to right, transparent, var(--accent), transparent)",
          margin: "24px 0",
          boxShadow: "0 0 8px var(--accent-glow)",
        }} />

        {/* Feature bullets */}
        <div style={{ marginBottom: 32, textAlign: "left" }}>
          {[
            "Compare kills, KDA, damage, accuracy across your squad",
            "Filter by This Week / Month / Year / All Time",
            "Ranked & Custom game breakdowns",
            "Medal tracking — Ninja, Perfection, Killionaire & more",
            "Uses only your Xbox login — no friend sign-ups needed",
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "6px 0", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }}>›</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-mid)" }}>{f}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            marginBottom: 16, padding: "10px 14px",
            background: "var(--loss-dim)", border: "1px solid var(--loss)",
            borderRadius: "var(--r)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--loss)",
          }}>
            ⚠ Login failed: {decodeURIComponent(error)}
          </div>
        )}

        <a href="/api/auth/login" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            background: "var(--accent)", color: "var(--bg)",
            fontFamily: "var(--font-hud)", fontSize: 16, fontWeight: 900,
            letterSpacing: 2, textTransform: "uppercase",
            padding: "16px 32px", borderRadius: "var(--r)",
            boxShadow: "0 0 32px var(--accent-glow)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 18 }}>🎮</span>
            Sign in with Xbox
          </div>
        </a>

        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
          marginTop: 16, lineHeight: 1.6, letterSpacing: 0.5,
        }}>
          Your credentials are never stored. Tokens are kept in an encrypted session cookie
          and expire after 3 hours. This app is not affiliated with 343 Industries or Microsoft.
        </p>
      </div>
    </div>
  );
}
