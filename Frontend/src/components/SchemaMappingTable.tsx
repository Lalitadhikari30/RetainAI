import { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { SchemaMapping } from '../types';
import { updateSchemaMapping } from '../api/service';
import { useToast } from '../context/ToastContext';
import { CustomSelect } from './CustomSelect';

interface SchemaMappingTableProps {
  initialMappings: SchemaMapping[];
  onMappingsChange?: (mappings: SchemaMapping[]) => void;
}

interface CanonicalOption {
  value: string;
  label: string;
}

const CANONICAL_OPTIONS: CanonicalOption[] = [
  { value: 'EmployeeNumber', label: 'Employee ID (Primary Key)' },
  { value: 'FullName', label: 'Full Name' },
  { value: 'Department', label: 'Department Identifier' },
  { value: 'MonthlyIncome', label: 'Base Salary / Monthly Income' },
  { value: 'OverTime', label: 'Overtime Hours / Flag' },
  { value: 'JobSatisfaction', label: 'Job Satisfaction Score (1-5)' },
  { value: 'YearsAtCompany', label: 'Years at Company / Tenure' },
  { value: 'YearsSinceLastPromotion', label: 'Years Since Last Promotion' },
  { value: 'DistanceFromHome', label: 'Commute Distance (Miles)' },
  { value: 'WorkLifeBalance', label: 'Work Life Balance Score' },
  { value: 'PerformanceRating', label: 'Performance Rating' },
  { value: 'Ignore', label: 'Ignore / Do Not Import' },
];

function resolveSelectedValue(field?: string): string {
  if (!field || field === 'Unmapped' || field.toLowerCase().includes('ignore')) {
    return 'Ignore';
  }
  const lower = field.toLowerCase().trim();
  const found = CANONICAL_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === lower || opt.label.toLowerCase() === lower
  );
  return found ? found.value : 'Ignore';
}

export function SchemaMappingTable({ initialMappings, onMappingsChange }: SchemaMappingTableProps) {
  const { showToast } = useToast();
  const [mappings, setMappings] = useState<SchemaMapping[]>(initialMappings);

  const handleFieldChange = async (id: string, newField: string) => {
    const updated = await updateSchemaMapping(id, newField);
    setMappings(updated);
    if (onMappingsChange) {
      onMappingsChange(updated);
    }
    const option = CANONICAL_OPTIONS.find((o) => o.value === newField);
    showToast(`Updated column mapping to "${option ? option.label : newField}"`, 'info');
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
          <tr>
            <th className="px-5 py-3.5">Uploaded CSV Column</th>
            <th className="px-5 py-3.5">Canonical HRIS Schema Field</th>
            <th className="px-5 py-3.5">Canonical Match Alignment</th>
            <th className="px-5 py-3.5">Sample Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/15 text-on-surface">
          {mappings.map((row) => {
            const isExact = row.matchType === 'Exact Match' || row.confidence === 'high' || (row.confidencePercent ?? 0) >= 90;
            const isSemantic = row.matchType === 'Semantic Match' || row.confidence === 'medium' || ((row.confidencePercent ?? 0) >= 70 && (row.confidencePercent ?? 0) < 90);
            const isIgnored = row.mappedField === 'Ignore' || row.mappedField === 'Unmapped' || row.mappedField === 'Ignore / Do Not Import';

            return (
              <tr key={row.id} className="hover:bg-surface-container-low/40 transition-colors">
                {/* CSV Column Header */}
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                  <div className="flex items-center gap-1.5">
                    <span>{row.csvColumn}</span>
                    {row.required && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-sans font-medium border border-amber-200">
                        Required
                      </span>
                    )}
                  </div>
                </td>

                {/* Mapped Canonical Field Dropdown */}
                <td className="px-5 py-3.5">
                  <CustomSelect
                    ariaLabel={`Mapping for ${row.csvColumn}`}
                    value={resolveSelectedValue(row.mappedField)}
                    onChange={(val) => handleFieldChange(row.id, val)}
                    options={CANONICAL_OPTIONS}
                    className="w-full max-w-xs"
                    buttonClassName="w-full bg-surface-container-lowest"
                    searchable={true}
                    minWidth={280}
                  />
                </td>

                {/* Match Type & Canonical Alignment */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {isIgnored ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant/70 bg-surface-container-low px-2 py-0.5 rounded-full">
                      Skipped / Ignored
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isExact
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSemantic
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isExact ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isSemantic ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>
                        {row.matchType || (isExact ? 'Exact Match' : 'Semantic Match')}
                        {row.confidencePercent ? ` (${row.confidencePercent}%)` : ''}
                      </span>
                    </span>
                  )}
                </td>

                {/* Sample Row Value */}
                <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant bg-surface-container-low/20">
                  {row.sampleValue || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
