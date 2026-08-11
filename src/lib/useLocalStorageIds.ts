"use client";

import { useEffect, useState, useCallback } from "react";

export function useLocalStorageIds(key: string) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setIds(raw ? JSON.parse(raw) : []);
    } catch {
      setIds([]);
    }
    setReady(true);
  }, [key]);

  const persist = useCallback(
    (next: string[]) => {
      setIds(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    },
    [key]
  );

  const toggle = useCallback(
    (id: string, max?: number) => {
      setIds((current) => {
        const exists = current.includes(id);
        let next: string[];
        if (exists) {
          next = current.filter((i) => i !== id);
        } else {
          next = max ? [...current, id].slice(-max) : [...current, id];
        }
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key]
  );

  return { ids, ready, toggle, persist };
}
