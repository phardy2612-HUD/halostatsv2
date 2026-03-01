import React, { useState } from "react";
import { GlowButton, Spinner } from "./UI";

const STEPS = [
  {
    n: "01",
    title: "Open Halo Waypoint",
    body: "On a desktop or laptop browser, go to halowaypoint.com and make sure you're signed in to your Xbox account.",
    action: { label: "Open Waypoint →", href: "https://www.halowaypoint.com/halo-infinite/players" },
  },
  {
    n: "02",
    title: "Navigate to your stats",
    body: "Click on your profile or go to your player stats page. The page needs to make a real API call — just loading the homepage isn't enough.",
  },
  {
    n: "03",
    title: "Open DevTools → Network tab",
    body: "Press F12 (Windows) or Cmd+Option+I (Mac) to open Developer Tools. Click the Network tab at the top. If the list is empty, refresh the page.",
  },
  {
    n: "04",
    title: "Find a Waypoint API request",
    body: 'In the filter box inside the Network tab, type "halostats" to filter requests. Click on any request that appears — it should go to halostats.svc.halowaypoint.com.',
  },
  {
    n: "05",
    title: "Copy your Spartan Token",
    body: 'Click the request, then click "Headers". Scroll down to Request Headers and find "x-343-authorization-spartan". Copy the entire value — it starts with "v4=" and is very long.',
  },
  {
    n: "06",
    title: "Copy your Clearance Token",
    body: 'In the same Headers section, find "343-clearance" and copy that value too. If you can\'t find it, leave the field blank — the app will try to fetch it automatically.',
  },
];

export default function TokenSettings({ onSaved }) {
  const [spartan,   setSpartan]   = useState("");
  const [clearance, setClearance] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [step,      setStep]      = useState(null); // expanded step index

  async function handleSave() {
    if (!spartan.trim()) { setError("Spartan token is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spartanToken: spartan.trim(), clearanceToken: clearance.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save token"); return; }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px 40px",
      position: "relative", overflow: "hidden",
    }}>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", opacity: 0.2,
        maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 16 }}>
          <div style={{
            fontFamily: "var(--font-hud)", fontSize: 36, fontWeight: 900,
            letterSpacing: 4, textTransform: "uppercase", lineHeight: 1,
          }}>
            <span style={{ color: "var(--accent)", textShadow: "0 0 20px var(--accent-glow)" }}>HALO</span>
            <span style={{ color: "var(--text)" }}> SQUAD</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 3, marginTop: 6, textTransform: "uppercase" }}>
            Token Setup
          </div>
          <div style={{
            height: 1, background: "linear-gradient(to right, transparent, var(--accent), transparent)",
            margin: "16px 0", boxShadow: "0 0 8px var(--accent-glow)",
          }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Paste your Spartan token below. Follow the steps to grab it from Halo Waypoint — it takes about 2 minutes.
          </p>
        </div>

        {/* Step-by-step guide */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
            How to get your token
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STEPS.map((s, i) => {
              const isOpen = step === i;
              return (
                <div key={i}
                  className="card"
                  style={{ borderColor: isOpen ? "var(--accent)" : "var(--border)", transition: "border-color 0.15s" }}
                >
                  <button
                    onClick={() => setStep(isOpen ? null : i)}
                    style={{
                      width: "100%", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      textAlign: "left",
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                      color: isOpen ? "var(--accent)" : "var(--text-muted)",
                      minWidth: 24, transition: "color 0.15s",
                    }}>
                      {s.n}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-hud)", fontSize: 14, fontWeight: 700,
                      color: "var(--text)", flex: 1,
                    }}>
                      {s.title}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: "0 14px 14px",
                      borderTop: "1px solid var(--border)",
                      paddingTop: 12,
                    }}>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-mid)",
                        lineHeight: 1.65, marginBottom: s.action ? 12 : 0,
                      }}>
                        {s.body}
                      </p>
                      {s.action && (
                        <a href={s.action.href} target="_blank" rel="noreferrer" style={{
                          display: "inline-flex", alignItems: "center",
                          fontFamily: "var(--font-mono)", fontSize: 11,
                          color: "var(--accent)", textDecoration: "none",
                          border: "1px solid var(--accent)", borderRadius: 6,
                          padding: "6px 12px", letterSpacing: 0.5,
                        }}>
                          {s.action.label}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Token input fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Spartan Token <span style={{ color: "var(--loss)" }}>*</span>
            </label>
            <textarea
              value={spartan}
              onChange={e => setSpartan(e.target.value)}
              placeholder="v4=eyJhbGci..."
              rows={3}
              style={{
                width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: "var(--r)", padding: "10px 12px",
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)",
                resize: "vertical", outline: "none", lineHeight: 1.5,
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border2)"}
            />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Clearance Token <span style={{ color: "var(--text-muted)" }}>(optional)</span>
            </label>
            <input
              type="text"
              value={clearance}
              onChange={e => setClearance(e.target.value)}
              placeholder="Leave blank to auto-detect"
              style={{
                width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: "var(--r)", padding: "10px 12px",
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)",
                outline: "none", transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border2)"}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 12, padding: "10px 14px",
            background: "var(--loss-dim)", border: "1px solid var(--loss)",
            borderRadius: "var(--r)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--loss)",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Save button */}
        <GlowButton onClick={handleSave} disabled={saving || !spartan.trim()}>
          {saving ? "Verifying..." : "Save Token & Continue"}
        </GlowButton>

        {/* How long it lasts */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
          marginTop: 14, lineHeight: 1.7, letterSpacing: 0.3, textAlign: "center",
        }}>
          Tokens typically last 3–8 hours. The app will warn you when it's time to refresh.
          Your token is stored in an encrypted cookie and never logged or shared.
        </p>
      </div>
    </div>
  );
}
