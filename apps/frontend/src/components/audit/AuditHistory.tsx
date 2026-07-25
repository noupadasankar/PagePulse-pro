'use client';

import React from 'react';
import { RotateCcw, Clock, Trash2, ArrowRight } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/metric-helpers';

export interface HistoryEntry {
  id: string;
  url: string;
  score: number;
  date: string; // ISO string
}

interface AuditHistoryProps {
  entries?: HistoryEntry[];
  onReaudit: (url: string) => void;
}

// Helper for relative time
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString();
}

export default function AuditHistory({ entries = [], onReaudit }: AuditHistoryProps) {
  const recentEntries = entries.slice(0, 5);

  if (entries.length === 0) {
    return (
      <div className="w-full p-8 border rounded-2xl border-dashed bg-muted/20 text-center animate-fadeInUp">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Audit History</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm mb-6">
          Your recent page audits will appear here. Run your first audit to start analyzing and improving your pages.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Audits
        </h3>
      </div>
      
      <div className="glass-card rounded-xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">URL</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((entry, idx) => {
                const status = entry.score >= 90 ? 'green' : entry.score >= 50 ? 'amber' : 'red';
                const statusColor = getStatusColor(status);
                
                return (
                  <tr 
                    key={entry.id} 
                    className="border-t border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://www.google.com/s2/favicons?domain=${entry.url}&sz=16`} alt="" className="w-4 h-4 rounded-sm" />
                        <span className="font-medium truncate max-w-[200px] block" title={entry.url}>{entry.url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${statusColor}`}>
                        {entry.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-background border ${statusColor.replace('text-', 'border-').replace('text-', 'bg-').replace('500', '100')} dark:bg-background`}>
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(entry.date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onReaudit(entry.url)}
                        className="inline-flex items-center gap-1.5 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Re-audit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-muted/20 p-3 border-t text-center">
          <button className="text-xs text-muted-foreground hover:text-destructive flex items-center justify-center gap-1.5 mx-auto transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      </div>
    </div>
  );
}
