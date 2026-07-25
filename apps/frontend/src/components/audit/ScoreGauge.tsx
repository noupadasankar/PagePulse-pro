'use client';

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let colorClass = 'stroke-red-500 text-red-500';
  let label = 'Critical';
  if (score >= 90) {
    colorClass = 'stroke-green-500 text-green-500';
    label = 'Excellent';
  } else if (score >= 50) {
    colorClass = 'stroke-amber-500 text-amber-500';
    label = 'Needs Work';
    if (score >= 70) label = 'Good';
  }

  return (
    <div className="relative flex flex-col items-center justify-center animate-fadeInUp" style={{ width: size, height: size }}>
      <svg
        className="score-gauge w-full h-full drop-shadow-md"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Circle */}
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground Circle */}
        <circle
          className={colorClass}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colorClass}`} style={{ animation: 'countUp 1s ease-out' }}>
          {Math.round(animatedScore)}
        </span>
        <span className="text-sm text-muted-foreground mt-1 font-medium">{label}</span>
      </div>
    </div>
  );
}
