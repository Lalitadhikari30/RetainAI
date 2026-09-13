import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types';
import { RiskBadge } from './RiskBadge';

interface EmployeeRowProps {
  employee: Employee;
  key?: React.Key;
}

export function EmployeeRow({ employee }: EmployeeRowProps) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/employees/${employee.id}`);
  };

  const isHighRisk = employee.flightRiskBand === 'high';

  return (
    <tr
      onClick={handleRowClick}
      className={`transition-colors group cursor-pointer border-b border-surface-container-low ${
        isHighRisk
          ? 'bg-tertiary-fixed/20 hover:bg-tertiary-fixed/35'
          : 'hover:bg-surface-container-low/70'
      }`}
    >
      {/* Employee Column */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className={`w-9 h-9 rounded-full object-cover shrink-0 ring-2 ${
                isHighRisk ? 'ring-tertiary-fixed' : 'ring-surface-container'
              }`}
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-2 ${
                isHighRisk
                  ? 'bg-tertiary text-on-tertiary ring-tertiary-fixed'
                  : employee.flightRiskBand === 'medium'
                  ? 'bg-amber-600 text-white ring-amber-200'
                  : 'bg-emerald-600 text-white ring-emerald-200'
              }`}
            >
              {employee.initials}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
              {employee.name}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {employee.role}
            </span>
          </div>
        </div>
      </td>

      {/* Department Column */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface text-xs font-medium border border-outline-variant/20">
          {employee.department}
        </span>
      </td>

      {/* Flight Risk Score Column */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <RiskBadge
          score={employee.flightRiskScore}
          band={employee.flightRiskBand}
          velocity={employee.riskVelocity}
        />
      </td>

      {/* Primary AI Driver / Reason */}
      <td className="px-6 py-3.5 max-w-md">
        <div className="flex items-start gap-2">
          {isHighRisk ? (
            <AlertTriangle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
          ) : employee.flightRiskBand === 'medium' ? (
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <span className="text-xs text-on-surface line-clamp-1 leading-relaxed">
            {employee.primaryDriver}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-primary transition-all text-xs font-semibold shadow-xs border border-outline-variant/20"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
