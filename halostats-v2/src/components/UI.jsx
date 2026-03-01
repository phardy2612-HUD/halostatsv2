import React from "react";

// Player avatar circle
export function Avatar({ player, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: player.color + "22",
      border: `1.5px solid ${player.color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-mono)", fontSize: size * 0.3, fontWeight: 700,
      color: player.color, letterSpacing: 0,
    }}>
      {player.initials}
    </div>
  );
}

// Section header label — Waypoint style
export function SectionLabel({ children, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      {accent && <div style={{ width: 2, height: 12, background: "var(--accent)", borderRadius: 1, flexShrink: 0 }} />}
      <span style={{
        fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
        color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        {children}
      </span>
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 36, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderTopColor: "var(--accent)",
        animation: "spin 0.7s linear infinite",
      }} />
      {label && (
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </span>
      )}
    </div>
  );
}

// Error banner
export function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      background: "var(--loss-dim)", border: "1px solid rgba(217,83,79,0.3)",
      borderRadius: "var(--r)", padding: "10px 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--loss)", letterSpacing: "0.04em" }}>
        {message}
      </span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}

// Stat cell with best/worst highlight
export function StatValue({ value, isBest, isWorst, format }) {
  const color = isBest ? "var(--win)" : isWorst ? "var(--loss)" : "var(--text)";
  return (
    <span style={{ color, fontWeight: isBest ? 600 : 400 }}>
      {format ? format(value) : value}
    </span>
  );
}

// W/L/D pill
export function OutcomePill({ outcome }) {
  const cfg = outcome === 2
    ? { label: "W", color: "var(--win)",  bg: "var(--win-dim)"  }
    : outcome === 3
    ? { label: "L", color: "var(--loss)", bg: "var(--loss-dim)" }
    : { label: "D", color: "var(--draw)", bg: "rgba(240,173,78,0.12)" };
  return (
    <span style={{
      fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      padding: "2px 6px", borderRadius: 2,
      letterSpacing: "0.05em", textTransform: "uppercase",
    }}>
      {cfg.label}
    </span>
  );
}

// Primary CTA button
export function GlowButton({ children, onClick, disabled, variant = "primary" }) {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "12px 28px", borderRadius: "var(--r)",
      background: disabled ? "var(--surface3)" : isPrimary ? "var(--accent)" : "var(--surface2)",
      color: disabled ? "var(--text-muted)" : isPrimary ? "#000" : "var(--text)",
      border: `1px solid ${disabled ? "var(--border)" : isPrimary ? "var(--accent)" : "var(--border2)"}`,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.12s",
    }}>
      {children}
    </button>
  );
}

// Bottom tab bar
export function TabBar({ tabs, active, onChange }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)",
      borderTop: "1px solid var(--border2)",
      display: "flex",
      paddingBottom: "max(8px, env(safe-area-inset-bottom))",
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, padding: "10px 0 0", background: "none", border: "none",
            cursor: "pointer", position: "relative",
          }}>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 24, height: 2, background: "var(--accent)", borderRadius: "0 0 2px 2px",
              }} />
            )}
            <span style={{ fontSize: 17 }}>{tab.icon}</span>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.12s",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// Filter row wrapper
export function FilterBar({ children }) {
  return <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>{children}</div>;
}
