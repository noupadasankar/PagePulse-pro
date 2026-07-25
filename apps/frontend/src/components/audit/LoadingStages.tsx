'use client';

import React from 'react';
import { Wifi, Download, Code2, BarChart3, FileCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Stage = 0 | 1 | 2 | 3 | 4;

interface LoadingStagesProps {
  currentStage: Stage;
}

const STAGES = [
  { icon: Wifi, label: 'Connecting to server' },
  { icon: Download, label: 'Downloading HTML' },
  { icon: Code2, label: 'Parsing DOM tree' },
  { icon: BarChart3, label: 'Computing metrics' },
  { icon: FileCheck, label: 'Generating report' },
];

export default function LoadingStages({ currentStage }: LoadingStagesProps) {
  const progressPercent = Math.round((currentStage / (STAGES.length - 1)) * 100);

  return (
    <div className="w-full max-w-md mx-auto p-6 glass-card rounded-2xl animate-fadeInUp" aria-live="polite">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Audit Progress</span>
          <span className="text-sm font-medium text-primary">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isFuture = idx > currentStage;
          const Icon = isCompleted ? CheckCircle2 : stage.icon;

          return (
            <div key={idx} className="flex items-center gap-4 relative">
              {idx !== STAGES.length - 1 && (
                <div
                  className={cn(
                    "absolute left-4 top-8 w-0.5 h-10 -ml-[1px]",
                    isCompleted ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
              
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300",
                  isCompleted && "bg-green-100 border-green-500 text-green-500 dark:bg-green-900/30",
                  isCurrent && "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]",
                  isFuture && "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCurrent && !isCompleted ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <span
                  className={cn(
                    "font-medium transition-colors duration-300",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isCurrent && "text-foreground font-bold",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
