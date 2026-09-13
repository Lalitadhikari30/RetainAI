import { RiskBand, RiskVelocity } from '../types';
import { TrendArrow } from './TrendArrow';

interface RiskBadgeProps {
  score: number;
  band?: RiskBand;
  velocity?: RiskVelocity;
  showVelocityText?: boolean;
  className?: string;
}

export function RiskBadge({
  score,
  band,
  velocity = 'stable',
  showVelocityText = true,
  className = '',
}: RiskBadgeProps) {
  const resolvedBand: RiskBand = band || (score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low');

  if (resolvedBand === 'high') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold shadow-xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0 animate-pulse" />
        <span>{score}% — High</span>
        <TrendArrow velocity={velocity} />
        {showVelocityText && <span className="text-[10px] font-normal tracking-tight">{velocity}</span>}
      </div>
    );
  }

  if (resolvedBand === 'medium') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold shadow-xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <span>{score}% — Medium</span>
        <TrendArrow velocity={velocity} />
        {showVelocityText && <span className="text-[10px] font-normal tracking-tight">{velocity}</span>}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-semibold shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
      <span>{score}% — Low</span>
      <TrendArrow velocity={velocity} />
      {showVelocityText && <span className="text-[10px] font-normal tracking-tight">{velocity}</span>}
    </div>
  );
}
