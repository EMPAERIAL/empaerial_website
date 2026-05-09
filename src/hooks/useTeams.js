"use client";

import { useState, useEffect, useCallback } from "react";

export default function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teams", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch teams: ${res.status}`);
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : [])
        .filter((t) => t && (t.title || t.name))
        .map((team) => ({
          ...team,
          members: Array.isArray(team.members) ? team.members : [],
        }));
      setTeams(normalized);
    } catch (err) {
      setError(err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
