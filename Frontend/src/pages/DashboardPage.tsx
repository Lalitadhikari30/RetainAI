import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Building,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Employee, DashboardStats, RiskBand } from '../types';
import { getEmployees, getDashboardStats } from '../api/service';
import { StatCard } from '../components/StatCard';
import { EmployeeRow } from '../components/EmployeeRow';
import { useToast } from '../context/ToastContext';
import { CustomSelect, SelectOption } from '../components/CustomSelect';

interface OutletContextType {
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { globalSearch } = useOutletContext<OutletContextType>();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployeesList, setAllEmployeesList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResyncing, setIsResyncing] = useState(false);

  // Filters State
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedRiskBand, setSelectedRiskBand] = useState<'all' | RiskBand>('all');
  const [sortBy, setSortBy] = useState<'risk-desc' | 'risk-asc' | 'name' | 'trend'>('risk-desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset pagination to page 1 whenever filters, search or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept, selectedRiskBand, sortBy, globalSearch]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [st, emps] = await Promise.all([
        getDashboardStats(),
        getEmployees({
          department: selectedDept,
          riskBand: selectedRiskBand,
          search: globalSearch,
          sortBy,
        }),
      ]);
      setStats(st);
      setEmployees(emps);
      if (selectedDept === 'all' && selectedRiskBand === 'all' && !globalSearch) {
        setAllEmployeesList(emps);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedDept, selectedRiskBand, sortBy, globalSearch]);

  // Dynamically compute department options & counts from live employee data
  const departmentOptions = useMemo(() => {
    const list = allEmployeesList.length > 0 ? allEmployeesList : employees;
    const counts: Record<string, number> = {};
    list.forEach((e) => {
      const dept = e.department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allEmployeesList, employees]);

  const departmentSelectOptions: SelectOption<string>[] = useMemo(() => [
    {
      value: 'all',
      label: `All Departments (${allEmployeesList.length > 0 ? allEmployeesList.length : employees.length})`,
    },
    ...departmentOptions.map(([dept, count]) => ({
      value: dept,
      label: `${dept} (${count})`,
    })),
  ], [allEmployeesList.length, employees.length, departmentOptions]);

  const sortSelectOptions: SelectOption<string>[] = [
    { value: 'risk-desc', label: 'Risk Score (High → Low)' },
    { value: 'risk-asc', label: 'Risk Score (Low → High)' },
    { value: 'name', label: 'Employee Name (A → Z)' },
    { value: 'trend', label: 'Trend Velocity (Rising First)' },
  ];

  const pageSizeOptions: SelectOption<number>[] = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
  ];

  // Pagination computations
  const totalEmployeesCount = employees.length;
  const totalPages = Math.max(1, Math.ceil(totalEmployeesCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return employees.slice(startIndex, startIndex + pageSize);
  }, [employees, safeCurrentPage, pageSize]);

  // Dynamic currency and metric formatting
  const formattedExposure = useMemo(() => {
    const exp = stats?.attritionCostExposure ?? (stats?.isManager ? 635000 : 1530636);
    if (exp >= 1_000_000) {
      return `$${(exp / 1_000_000).toFixed(2)}M`;
    }
    return `$${(exp / 1_000).toFixed(0)}k`;
  }, [stats?.attritionCostExposure, stats?.isManager]);

  const formattedAvgPerHire = useMemo(() => {
    const avg = stats?.attritionCostAvgPerHire ?? (stats?.isManager ? 211667 : 218662);
    return `$${(avg / 1000).toFixed(1)}k`;
  }, [stats?.attritionCostAvgPerHire, stats?.isManager]);

  const handleResync = async () => {
    setIsResyncing(true);
    showToast('Triggered live sync with Workday HRIS...', 'info');
    setTimeout(async () => {
      const emps = await getEmployees({
        department: selectedDept,
        riskBand: selectedRiskBand,
        search: globalSearch,
        sortBy,
      });
      setEmployees(emps);
      setIsResyncing(false);
      showToast(`Workday HRIS telemetry refreshed. ${emps.length} profiles synced.`, 'success');
    }, 1200);
  };

  const handleExportCsv = () => {
    if (employees.length === 0) {
      showToast('No employee records to export', 'warning');
      return;
    }

    const headers = [
      'Employee ID',
      'Name',
      'Role',
      'Department',
      'Band',
      'Tenure',
      'Location',
      'Flight Risk Score',
      'Risk Band',
      'Risk Velocity',
      'Primary Driver',
      'Annual Salary',
      'Replacement Cost',
    ];

    const rows = employees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.role}"`,
      e.department,
      `"${e.band}"`,
      `"${e.tenureFormatted}"`,
      `"${e.location}"`,
      e.flightRiskScore,
      e.flightRiskBand,
      e.riskVelocity,
      `"${e.primaryDriver}"`,
      e.annualSalary,
      e.replacementCost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `retainai_risk_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${employees.length} employee records to CSV`, 'success');
  };

  return (
    <div className="flex flex-col gap-7 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
            {stats?.isManager ? 'Team Flight Risk Overview' : 'Attrition Risk Overview'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {stats?.isManager
              ? `Real-time predictive flight risk scores across your direct squad of ${stats?.totalEmployees ?? employees.length} employees.`
              : `Real-time predictive flight risk scores across ${stats?.totalEmployees ?? employees.length} active enterprise employees.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResync}
            disabled={isResyncing}
            className="px-3 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin text-primary' : 'text-on-surface-variant'}`} />
            <span>{isResyncing ? 'Syncing...' : 'Sync Workday'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={stats?.isManager ? 'Squad Headcount' : 'Total Employees'}
          value={stats?.totalEmployees?.toLocaleString() ?? (employees.length ? employees.length.toLocaleString() : (stats?.isManager ? '14' : '104'))}
          subtitle={stats?.isManager ? 'Direct Reports' : 'Active'}
          icon={<Users className="w-4 h-4" />}
          badge={
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {stats?.totalEmployeesDelta ?? (stats?.isManager ? '+1 this quarter' : '+8 this quarter')}
            </span>
          }
          footerContent={
            <span>
              {stats?.isManager
                ? `Squad coverage across ${stats?.departmentCount ?? (departmentOptions.length || 2)} departments`
                : `Global coverage across ${stats?.departmentCount ?? (departmentOptions.length || 10)} departments`}
            </span>
          }
          sparklineColor="#4f46e5"
          sparklineData={stats?.sparklines?.totalEmployees}
          sparklinePath="M1 16L13 14L25 15L37 10L49 11L63 4"
        />

        <StatCard
          title={stats?.isManager ? 'Squad High Risk' : 'High Risk Employees'}
          value={stats?.highRiskEmployees ?? employees.filter((e) => e.flightRiskBand === 'high').length}
          subtitle="Flight Risk"
          isAlert={true}
          icon={<AlertTriangle className="w-4 h-4 text-tertiary" />}
          badge={
            <span className="text-[11px] font-semibold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-md">
              {stats?.highRiskPercent ?? (stats?.isManager ? '21.4% of squad' : '6.7% of workforce')}
            </span>
          }
          footerContent={<span>Requires immediate 1:1 intervention</span>}
          sparklineColor="#ba1a1a"
          sparklineData={stats?.sparklines?.highRisk}
          sparklinePath="M1 18L13 17L25 12L37 14L49 6L63 2"
        />

        <StatCard
          title="Estimated Attrition Exposure"
          value={formattedExposure}
          subtitle="Direct"
          icon={<DollarSign className="w-4 h-4" />}
          badge={
            <span className="text-[11px] font-semibold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-md">
              {stats?.attritionCostMomDelta ?? '+12% MoM'}
            </span>
          }
          footerContent={
            <span>
              Avg {formattedAvgPerHire} per at-risk hire replacement
            </span>
          }
          sparklineColor="#950029"
          sparklineData={stats?.sparklines?.attritionCost}
          sparklinePath="M1 15L13 13L25 12L37 9L49 7L63 3"
        />

        <StatCard
          title="Last Data Refresh"
          value={stats?.lastRefreshTime ? stats.lastRefreshTime.split(' ')[0] : '02:17 PM'}
          subtitle={stats?.lastRefreshTime ? stats.lastRefreshTime.split(' ').slice(1).join(' ') : 'IST'}
          icon={<Clock className="w-4 h-4" />}
          badge={
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Live Synced
            </span>
          }
          footerContent={
            <span>
              {stats?.lastRefreshDate ?? 'Today'} • {stats?.syncSource ?? 'Direct Ingestion'}
            </span>
          }
          sparklineColor="#10b981"
          sparklineData={stats?.sparklines?.dataRefresh}
          sparklinePath="M1 10L13 10L25 10L37 10L49 10L63 10"
        />
      </div>

      {/* Filter and Query Toolbar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Department Select & Risk Band Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              Dept:
            </span>
            <CustomSelect
              ariaLabel="Filter by department"
              value={selectedDept}
              onChange={(val) => {
                setSelectedDept(val);
                setCurrentPage(1);
              }}
              options={departmentSelectOptions}
              minWidth={210}
            />
          </div>

          {/* Risk Band Segment Pills */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs">
            <button
              onClick={() => setSelectedRiskBand('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedRiskBand === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Bands
            </button>
            <button
              onClick={() => setSelectedRiskBand('high')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                selectedRiskBand === 'high'
                  ? 'bg-tertiary text-on-tertiary shadow-xs'
                  : 'text-on-surface-variant hover:text-tertiary'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0" />
              High Risk (&gt;70%)
            </button>
            <button
              onClick={() => setSelectedRiskBand('medium')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                selectedRiskBand === 'medium'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-amber-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              Medium (40-70%)
            </button>
            <button
              onClick={() => setSelectedRiskBand('low')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                selectedRiskBand === 'low'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Low (&lt;40%)
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Sort:
          </span>
          <CustomSelect
            ariaLabel="Sort employees"
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={sortSelectOptions}
            minWidth={200}
            searchable={false}
          />
        </div>
      </div>

      {/* Main Attrition Watchlist Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">
              {stats?.isManager ? 'Direct Team Watchlist' : 'Attrition Risk Watchlist'}
            </h2>
            <span className="text-xs font-semibold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
              {employees.length} Tracked
            </span>
          </div>

          <span className="text-xs text-on-surface-variant">
            Target review cadence: Weekly 1:1 check-ins
          </span>
        </div>

        {/* Table element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-surface-container-low/70 text-xs font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Flight Risk Score</th>
                <th className="px-6 py-3">Primary AI Driver / Reason</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading predictive risk models...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-on-surface-variant">
                    No employees found matching the active filters or search terms.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => <EmployeeRow key={emp.id} employee={emp} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Interactive Pagination Controls */}
        <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-on-surface">
                {totalEmployeesCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-on-surface">
                {Math.min(safeCurrentPage * pageSize, totalEmployeesCount)}
              </strong>{' '}
              of <strong className="text-on-surface">{totalEmployeesCount}</strong>{' '}
              {stats?.isManager ? 'squad members' : 'employees'}
            </span>

            {/* Rows per page selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-outline-variant/30">
              <span className="text-[11px] text-on-surface-variant">Per page:</span>
              <CustomSelect
                ariaLabel="Rows per page"
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                options={pageSizeOptions}
                size="sm"
                minWidth={72}
                searchable={false}
                buttonClassName="bg-surface-container-lowest"
              />
            </div>
          </div>

          {/* Stepper / Page Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              title="First Page"
              className="p-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page numeric buttons */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (totalPages > 5) {
                  if (p !== 1 && p !== totalPages && Math.abs(p - safeCurrentPage) > 1) {
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span key={p} className="px-1 text-on-surface-variant font-mono text-[10px]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                }

                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      p === safeCurrentPage
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-outline-variant/30'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              title="Last Page"
              className="p-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RetainAI Copilot Executive Summary Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-fixed to-surface-container border border-primary-container/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Executive Synthesis
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-lowest text-primary font-bold">
                Auto-generated
              </span>
            </div>
            <p className="text-sm font-semibold text-on-surface leading-relaxed">
              {stats?.isManager
                ? `Engineering squad risk concentrated among senior staff (+14% this quarter) due to on-call surge following peer departures and compensation adjustments.`
                : `Engineering and Sales risk concentrated among senior staff (+14% this quarter) due to on-call surge following peer departures and compensation lagging market median by 16%.`}
            </p>
            <p className="text-xs text-on-surface-variant">
              {stats?.isManager
                ? `Immediate intervention on your top 3 flight profiles can preserve up to $635,000 in replacement costs.`
                : `Immediate intervention on top flight profiles can preserve up to $1.53M in replacement costs.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            onClick={() => {
              setSelectedDept('Engineering');
              setSelectedRiskBand('high');
              showToast('Filtered to High-Risk Engineering Outliers', 'info');
            }}
            className="px-3.5 py-2 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container-low text-xs font-bold transition-all border border-outline-variant/30 shadow-2xs"
          >
            Review Outliers
          </button>
          <button
            onClick={() => navigate('/copilot')}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Ask Copilot to Investigate</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
