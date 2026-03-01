import React from "react";

export function Avatar({ player, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: player.color + "1a",
      border: `1.5px solid ${player.color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-mono)", fontSize: size * 0.32, fontWeight: 700,
      color: player.color, letterSpacing: 0,
    }}>
      {player.initials}
    </div>
  );
}

export function PlayerTag({ player, size = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar player={player} size={size} />
      <span style={{
        fontFamily: "var(--font-hud)", fontSize: 14, fontWeight: 700,
        color: "var(--text)", letterSpacing: 0.3,
      }}>
        {player.gamertag}
      </span>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 14, background: "var(--accent)", borderRadius: 2, flexShrink: 0 }} />
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color: "var(--text-muted)", letterSpacing: 2.5, textTransform: "uppercase",
      }}>
        {children}
      </span>
    </div>
  );
}

export function Spinner({ size = 40, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 40 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: "2px solid var(--border2)",
        borderTopColor: "var(--accent)",
        animation: "spin 0.75s linear infinite",
      }} />
      {label && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
          letterSpacing: 2, textTransform: "uppercase",
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      background: "var(--loss-dim)", border: "1px solid var(--loss)",
      borderRadius: "var(--r)", padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--loss)" }}>
        ⚠ {message}
      </span>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: "none", border: "none", color: "var(--text-muted)",
          cursor: "pointer", fontSize: 16, padding: 0,
        }}>×</button>
      )}
    </div>
  );
}

export function StatValue({ value, isBest, isWorst, format }) {
  const color = isBest ? "var(--win)" : isWorst ? "var(--loss)" : "var(--text)";
  return (
    <span style={{ color, fontWeight: isBest || isWorst ? 700 : 400 }}>
      {format ? format(value) : value}
      {isBest  && <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>▲</span>}
      {isWorst && <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>▼</span>}
    </span>
  );
}

export function OutcomePill({ outcome }) {
  // outcome: 2=win, 3=loss, 1=draw
  const cfg = outcome === 2
    ? { label: "W", color: "var(--win)",  bg: "var(--win-dim)"  }
    : outcome === 3
    ? { label: "L", color: "var(--loss)", bg: "var(--loss-dim)" }
    : { label: "D", color: "var(--draw)", bg: "var(--draw-dim)" };

  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      padding: "2px 7px", borderRadius: 4, letterSpacing: 0.5,
    }}>
      {cfg.label}
    </span>
  );
}

export function GlowButton({ children, onClick, disabled, variant = "primary" }) {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "var(--font-hud)", fontSize: 14, fontWeight: 700,
      letterSpacing: 1.5, textTransform: "uppercase",
      padding: "12px 24px", borderRadius: "var(--r)",
      background: disabled ? "var(--surface2)" : isPrimary ? "var(--accent)" : "var(--surface2)",
      color: disabled ? "var(--text-muted)" : isPrimary ? "var(--bg)" : "var(--text)",
      border: `1px solid ${disabled ? "var(--border)" : isPrimary ? "var(--accent)" : "var(--border2)"}`,
      boxShadow: disabled || !isPrimary ? "none" : "0 0 24px var(--accent-glow)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(7,8,12,0.96)", backdropFilter: "blur(24px)",
      borderTop: "1px solid var(--border2)",
      display: "flex",
      paddingBottom: "max(10px, env(safe-area-inset-bottom))",
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, padding: "10px 0 0", background: "none", border: "none",
            cursor: "pointer", position: "relative",
          }}>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 2, background: "var(--accent)",
                borderRadius: "0 0 2px 2px",
                boxShadow: "0 0 8px var(--accent-glow)",
              }} />
            )}
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1.5,
              textTransform: "uppercase",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.15s",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function FilterBar({ children }) {
  return (
    <div style={{
      display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
    }}>
      {children}
    </div>
  );
}

export function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
        color: color || "var(--text)",
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)",
        letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  );
}
