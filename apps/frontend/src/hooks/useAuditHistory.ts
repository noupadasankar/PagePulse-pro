import { useState, useEffect } from 'react';

export interface AuditHistoryEntry {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  healthScore?: number;
}

export interface HistoryEntry {
  id: string;
  url: string;
  score: number;
  date: string; // ISO string
}

export function useAuditHistory() {
  const [history, setHistory] = useState<AuditHistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('auditHistory');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse audit history', e);
      }
    }
  }, []);

  const addEntry = (entry: AuditHistoryEntry) => {
    const newHistory = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('auditHistory', JSON.stringify(newHistory));
  };

  const toHistoryEntry = (entry: AuditHistoryEntry): HistoryEntry => ({
    id: entry.id,
    url: entry.url,
    score: entry.score,
    date: entry.timestamp,
  });

  return { history, addEntry, addAudit: addEntry, addHistory: addEntry, toHistoryEntry };
}
