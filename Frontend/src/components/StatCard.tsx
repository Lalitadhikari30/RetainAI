import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  footerContent?: React.ReactNode;
  sparklineColor?: string;
  sparklinePath?: string;
  sparklineData?: number[];
  isAlert?: boolean;
  className?: string;
}

function generateSparklineSvg(data: number[], width = 64, height = 20, padding = 3): string {
  if (!data || data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  return data
    .map((val, idx) => {
      const x = Math.round(padding + (idx * (width - 2 * padding)) / (data.length - 1));
      const y =
        range === 0
          ? Math.round(height / 2)
          : Math.round(height - padding - ((val - min) / range) * (height - 2 * padding));
      return `${idx === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
}

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  footerContent,
  sparklineColor = '#4f46e5',
  sparklinePath = 'M1 16L13 13L25 15L37 8L49 11L63 3',
  sparklineData,
  isAlert = false,
  className = '',
}: StatCardProps) {
  const effectiveSparklinePath = sparklineData && sparklineData.length >= 2
    ? generateSparklineSvg(sparklineData)
    : sparklinePath;
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/30 relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-sm ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isAlert ? 'text-tertiary' : 'text-on-surface-variant'
            }`}
          >
            {title}
          </span>
          {badge ? badge : icon ? <div className="text-secondary">{icon}</div> : null}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold tracking-tight font-metric-mono ${
              isAlert ? 'text-tertiary' : 'text-on-background'
            }`}
          >
            {value}
          </span>
          {subtitle && (
            <span
              className={`text-xs font-medium ${
                isAlert ? 'text-tertiary' : 'text-on-surface-variant'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {footerContent ? (
        <div
          className={`mt-4 flex items-center justify-between pt-3 -mx-5 -mb-5 px-5 py-2.5 text-xs ${
            isAlert ? 'bg-tertiary-fixed/30 text-tertiary' : 'bg-surface-container-low/60 text-on-surface-variant'
          }`}
        >
          {footerContent}
          {effectiveSparklinePath && (
            <svg className="w-16 h-5 shrink-0" fill="none" viewBox="0 0 64 20">
              <path
                d={effectiveSparklinePath}
                stroke={sparklineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      ) : null}
    </div>
  );
}
