import React, { useState } from "react";

export default function TokenExpiryBanner({ session, onRefresh }) {
  const [dismissed, setDismissed] = useState(false);
  if (!session?.loggedIn || dismissed) return null;

  const { nearExpiry, expired, ageHours } = session;
  if (!nearExpiry && !expired) return null;

  if (expired) {
    return (
      <div style={{
        background: "var(--loss-dim)", borderBottom: "1px solid var(--loss)",
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--loss)" }}>
            Token expired — stats may not load
          </span>
        </div>
        <button onClick={onRefresh} style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
          color: "var(--bg)", background: "var(--loss)",
          border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer",
          letterSpacing: 0.5,
        }}>
          Update Token
        </button>
      </div>
    );
  }

  // Near expiry warning
  return (
    <div style={{
      background: "rgba(255,178,36,0.08)", borderBottom: "1px solid rgba(255,178,36,0.3)",
      padding: "8px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      flexWrap: "wrap",
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--draw)" }}>
        ⏱ Token is {ageHours}h old — consider refreshing soon
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onRefresh} style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--draw)", background: "none",
          border: "1px solid rgba(255,178,36,0.4)", borderRadius: 6,
          padding: "4px 10px", cursor: "pointer",
        }}>
          Refresh
        </button>
        <button onClick={() => setDismissed(true)} style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--text-muted)", background: "none",
          border: "none", cursor: "pointer", padding: "4px",
        }}>
          ✕
        </button>
      </div>
    </div>
  );
}
