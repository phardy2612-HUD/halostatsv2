import { useState, useCallback, useRef } from "react";

export default function useSquadData() {
  const [data,        setData]        = useState(null);
  const [medalMeta,   setMedalMeta]   = useState(null); // { medals, spriteColumns, spriteSize }
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [session,     setSession]     = useState(null);
  const abortRef = useRef(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const s = await res.json();
      setSession(s);
      return s;
    } catch {
      const fallback = { loggedIn: false };
      setSession(fallback);
      return fallback;
    }
  }, []);

  const fetchSquad = useCallback(async (gamertags, count = 25) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/halo/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamertags, count }),
        signal: abortRef.current.signal,
      });

      if (res.status === 401) {
        const body = await res.json();
        setError(body.code === "EXPIRED" ? "token_expired" : "auth_failed");
        // Refresh session state
        checkSession();
        return;
      }

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Fetch failed");
      }

      const json = await res.json();
      setData(json);

      // Fetch medal metadata in parallel (fire and forget — don't block)
      fetch("/api/halo/medals")
        .then(r => r.ok ? r.json() : null)
        .then(meta => { if (meta) setMedalMeta(meta); })
        .catch(() => {}); // non-fatal

      // Refresh session so expiry banner stays accurate
      checkSession();
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkSession]);

  return { data, loading, error, session, checkSession, fetchSquad, medalMeta };
}
