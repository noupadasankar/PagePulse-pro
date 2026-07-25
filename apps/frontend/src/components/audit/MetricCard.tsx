'use client';

import React from 'react';
import { metricDetails, MetricStatus, getStatusLabel, getStatusEmoji } from '@/lib/metric-helpers';
import { FileText, AlignLeft, Heading1, Image as ImageIcon, Link, Bot, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  id: string;
  value: string | number;
  status: MetricStatus;
  guidance?: string;
  index?: number;
}

const iconMap: Record<string, React.ElementType> = {
  FileText,
  AlignLeft,
  Heading1,
  Image: ImageIcon,
  Link,
  Bot
};

export default function MetricCard({ id, value, status, guidance, index = 0 }: MetricCardProps) {
  const details = metricDetails[id] || { title: id, desc: '', icon: 'HelpCircle', recommendation: guidance || '' };
  const IconComponent = iconMap[details.icon] || HelpCircle;

  const colorStyles = {
    green: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400',
    red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400',
  };

  const iconStyles = {
    green: 'text-green-500 bg-green-100 dark:bg-green-900/50',
    amber: 'text-amber-500 bg-amber-100 dark:bg-amber-900/50',
    red: 'text-red-500 bg-red-100 dark:bg-red-900/50',
  };

  return (
    <div
      className="glass-card rounded-xl p-5 flex flex-col gap-3 animate-fadeInUp hover:scale-[1.02]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", iconStyles[status])}>
            <IconComponent className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">{details.title}</h3>
        </div>
        <div className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1", colorStyles[status])}>
          {getStatusEmoji(status)} {getStatusLabel(status)}
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{details.desc}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 text-sm">
        <span className="font-semibold opacity-80">Recommendation:</span> {details.recommendation || guidance}
      </div>
    </div>
  );
}
