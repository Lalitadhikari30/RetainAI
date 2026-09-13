import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RiskVelocity } from '../types';

interface TrendArrowProps {
  velocity: RiskVelocity;
  className?: string;
}

export function TrendArrow({ velocity, className = '' }: TrendArrowProps) {
  if (velocity === 'rising') {
    return <TrendingUp className={`w-3.5 h-3.5 text-tertiary stroke-[2.5] ${className}`} />;
  }
  if (velocity === 'falling') {
    return <TrendingDown className={`w-3.5 h-3.5 text-emerald-600 stroke-[2.5] ${className}`} />;
  }
  return <Minus className={`w-3.5 h-3.5 text-amber-600 stroke-[2.5] ${className}`} />;
}
