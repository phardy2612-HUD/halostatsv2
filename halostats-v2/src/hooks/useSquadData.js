import { useState, useCallback, useRef } from "react";

export default function useSquadData() {
  const [data,          setData]          = useState(null);
  const [medalMeta,     setMedalMeta]     = useState(null);
  const [medalMetaError,setMedalMetaError]= useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [session,       setSession]       = useState(null);
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

  const fetchSquad = useCallback(async (gamertags, count = 100) => {
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
        checkSession();
        return;
      }

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Fetch failed");
      }

      const json = await res.json();
      setData(json);

      // Fetch medal metadata — log errors so we can debug
      fetch("/api/halo/medals")
        .then(async r => {
          if (!r.ok) {
            const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
            console.warn("[medals] metadata fetch failed:", err);
            setMedalMetaError(err.error || `HTTP ${r.status}`);
            return null;
          }
          return r.json();
        })
        .then(meta => {
          if (meta) {
            console.log("[medals] loaded", Object.keys(meta.medals || {}).length, "medals");
            setMedalMeta(meta);
          }
        })
        .catch(err => {
          console.warn("[medals] fetch exception:", err.message);
          setMedalMetaError(err.message);
        });

      checkSession();
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkSession]);

  return { data, loading, error, session, checkSession, fetchSquad, medalMeta, medalMetaError };
}
