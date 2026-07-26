import { useEffect, useState } from 'react';
import { getRiskLevel, RISK_META } from '@/data/projects';

interface RiskGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

export function RiskGauge({ score, size = 120, className }: RiskGaugeProps) {
  const [progress, setProgress] = useState(0);
  const level = getRiskLevel(score);
  const meta = RISK_META[level];
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circ - (clamped / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="fill-none transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{ stroke: meta.fill, filter: `drop-shadow(0 0 8px ${meta.fill})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-2xl font-bold ${meta.color}`}>
          {Math.round(progress)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          Risk
        </span>
      </div>
    </div>
  );
}
