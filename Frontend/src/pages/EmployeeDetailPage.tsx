import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  Briefcase,
  MapPin,
  UserCheck,
  TrendingUp,
  Sparkles,
  Bot,
  Bell,
  CheckCircle2,
  Share2,
  FileText,
  Sliders,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Employee, RecommendedAction } from '../types';
import { getEmployeeDetail, logIntervention } from '../api/service';
import { RiskBadge } from '../components/RiskBadge';
import { useToast } from '../context/ToastContext';
import { CustomSelect, SelectOption } from '../components/CustomSelect';

const INTERVENTION_CATEGORIES: SelectOption<string>[] = [
  {
    value: 'Compensation Adjustment',
    label: 'Compensation Adjustment (Base / Equity)',
    description: 'Off-cycle salary adjustment or equity grant',
  },
  {
    value: 'Role & Promotion Alignment',
    label: 'Role & Promotion Alignment (L7 Principal Roadmap)',
    description: 'Promotion trajectory and technical growth plan',
  },
  {
    value: 'Workload & On-call Rebalancing',
    label: 'Workload & On-call Rebalancing',
    description: 'Shift rebalancing to reduce burnout vectors',
  },
  {
    value: 'Manager 1:1 Retention Sync',
    label: 'Manager 1:1 Retention Sync',
    description: 'Direct engagement conversation on career path',
  },
  {
    value: 'Flexible Hybrid Policy Exception',
    label: 'Flexible Hybrid Policy Exception',
    description: 'Remote schedule adjustment & flexibility grant',
  },
];

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Reminder Modal State
  const [selectedActionForReminder, setSelectedActionForReminder] = useState<RecommendedAction | null>(null);
  const [reminderDate, setReminderDate] = useState('2024-10-28');
  const [reminderNote, setReminderNote] = useState('');

  // Log Intervention Modal State
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionType, setInterventionType] = useState('Compensation Adjustment');
  const [interventionNotes, setInterventionNotes] = useState('Initiated off-cycle promotion review packet to VP of Engineering.');

  // Handle ESC key to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedActionForReminder(null);
        setShowInterventionModal(false);
      }
    };
    if (selectedActionForReminder || showInterventionModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedActionForReminder, showInterventionModal]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const emp = await getEmployeeDetail(id);
      if (emp) {
        setEmployee(emp);
      } else {
        // Fallback to default employee if id not found
        const fallback = await getEmployeeDetail('EMP-88421');
        setEmployee(fallback || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleCreateReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionForReminder) return;

    showToast(
      `Reminder scheduled for ${reminderDate}: "${selectedActionForReminder.title.slice(0, 40)}..."`,
      'success'
    );
    setSelectedActionForReminder(null);
  };

  const handleLogInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employee) {
      await logIntervention(
        employee.id,
        `${interventionType}: ${interventionNotes}`,
        new Date().toISOString().split('T')[0]
      );
    }
    showToast(`Intervention logged: ${interventionType}`, 'success');
    setShowInterventionModal(false);
  };

  if (loading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-xs text-on-surface-variant flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading employee risk telemetry...</span>
        </div>
      </div>
    );
  }

  // Radial Gauge Data for Recharts
  const gaugeValue = employee.flightRiskScore;
  const gaugeData = [
    { name: 'Risk', value: gaugeValue, color: gaugeValue >= 70 ? '#ba1a1a' : gaugeValue >= 40 ? '#f59e0b' : '#10b981' },
    { name: 'Remaining', value: 100 - gaugeValue, color: '#e5eeff' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150 max-w-7xl mx-auto">
      {/* Top Breadcrumbs & Quick Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attrition Watchlist</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigate('/copilot');
              showToast(`Initialized Copilot investigation for ${employee.name}`, 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-primary-fixed text-primary hover:bg-primary hover:text-on-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Copilot for {employee.name.split(' ')[0]}</span>
          </button>
          <button
            onClick={() => setShowInterventionModal(true)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Log Intervention</span>
          </button>
        </div>
      </div>

      {/* Main Employee Hero Profile Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Avatar & Personal Metadata */}
        <div className="flex items-start gap-4 flex-1">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-tertiary-fixed shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-tertiary text-on-tertiary font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {employee.initials}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">
                {employee.name}
              </h1>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant">
                {employee.id}
              </span>
              <RiskBadge
                score={employee.flightRiskScore}
                band={employee.flightRiskBand}
                velocity={employee.riskVelocity}
              />
            </div>

            <p className="text-sm font-semibold text-primary">
              {employee.role} • <span className="text-on-surface-variant font-normal">{employee.band}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-on-surface-variant pt-1">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-secondary" />
                {employee.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                Tenure: <strong className="text-on-surface font-semibold">{employee.tenureFormatted}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                {employee.location}
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-secondary" />
                Manager: <strong className="text-on-surface font-semibold">{employee.manager}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-secondary" />
                Comp: ${(employee.annualSalary / 1000).toFixed(0)}k Base
              </span>
            </div>
          </div>
        </div>

        {/* Right: Radial Gauge Chart & Velocity */}
        <div className="flex items-center gap-6 self-center lg:self-auto p-3.5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={36}
                  outerRadius={48}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold font-metric-mono text-tertiary">
                {employee.flightRiskScore}%
              </span>
              <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">
                Risk Score
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 pr-2">
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
              Flight Risk Velocity
            </span>
            <span className="text-sm font-bold text-on-surface flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-tertiary" />
              {employee.riskDelta}
            </span>
            <span className="text-[11px] text-on-surface-variant max-w-[150px] leading-tight mt-1">
              Triggered by overtime spike and compensation market gap.
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left 2 cols (Factor Decomposition & Trajectory) | Right 1 col (Copilot Synthesis & Cost Exposure) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Factor Decomposition (SHAP Importance) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                  Factor Decomposition (SHAP Importance)
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Algorithmic feature attribution explaining why {employee.name} is flagged at {employee.flightRiskScore}% risk.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                {employee.riskFactors?.length || 0} Active Signals
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {employee.riskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface">{factor.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        factor.status === 'high'
                          ? 'text-tertiary'
                          : factor.status === 'medium'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {factor.value}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        factor.status === 'high'
                          ? 'bg-tertiary'
                          : factor.status === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${factor.weight}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>Benchmark Context: {factor.benchmark}</span>
                    <span className="font-medium font-mono text-[10px] text-secondary">
                      Weight: {factor.weight}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temporal Analysis: 6-Month Historical Risk Trajectory */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                  Temporal Analysis: 6-Month Trajectory
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Monthly attrition flight risk progression correlated with team events.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                  Flight Risk %
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={employee.historicalTrajectory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataPoint = payload[0].payload;
                        return (
                          <div className="p-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-lg text-xs flex flex-col gap-1 border border-slate-700">
                            <span className="font-bold text-slate-200">{label} 2024</span>
                            <span className="font-mono text-sm font-bold text-tertiary-fixed">
                              Flight Risk: {dataPoint.score}%
                            </span>
                            {dataPoint.event && (
                              <span className="text-[11px] text-amber-300 font-medium">
                                Event: {dataPoint.event}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ba1a1a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Event Markers Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-amber-900 font-medium">
                  <strong>July Event:</strong> Teammate exited, increasing on-call rotation.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/60 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span className="text-red-900 font-medium">
                  <strong>August Event:</strong> P90 on-call alerts doubled to 18.5 hrs/wk.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span on desktop) */}
        <div className="flex flex-col gap-6">
          {/* RetainAI Copilot Synthesis Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  RetainAI Copilot Synthesis
                </h2>
                <span className="text-[10px] text-primary font-bold">Generative Retention Brief</span>
              </div>
            </div>

            <p className="text-xs text-on-surface leading-relaxed bg-surface-container-low/60 p-4 rounded-xl border border-outline-variant/20">
              {employee.copilotSummary}
            </p>

            {/* Recommended Actions: Suggest, never auto-execute */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                  Recommended Actions
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  Suggest, never auto-execute
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {employee.recommendedActions.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-on-surface leading-snug">
                        {rec.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          rec.impact === 'Very High'
                            ? 'bg-tertiary-fixed text-tertiary'
                            : 'bg-primary-fixed text-primary'
                        }`}
                      >
                        {rec.impact}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
                      <span>{rec.note}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedActionForReminder(rec);
                          setReminderNote(rec.title);
                        }}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-bold text-xs"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Create Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost of Attrition & Replacement Exposure Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Cost of Attrition & Replacement
            </h2>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
              <span className="text-xs font-semibold text-on-surface-variant">Estimated Replacement Cost</span>
              <span className="text-3xl font-extrabold font-metric-mono text-on-surface">
                ${employee.replacementCost.toLocaleString()}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">
                Recruiter fee (22%) + 5.2 months ramp-up productivity delta + onboarding overhead.
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-on-surface">Knowledge Loss Risk</span>
                <p className="text-xs text-on-surface-variant leading-relaxed p-2.5 rounded-lg bg-tertiary-fixed/20 border border-tertiary/20 text-tertiary font-medium">
                  {employee.knowledgeLossRisk}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Team Headcount</span>
                  <span className="text-sm font-bold font-mono text-on-surface mt-0.5">{employee.teamHeadcount}</span>
                  <span className="text-[10px] text-on-surface-variant">3 positions vacant</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">90-Day Turnover</span>
                  <span className="text-sm font-bold font-mono text-tertiary mt-0.5">{employee.teamTurnover90d}</span>
                  <span className="text-[10px] text-on-surface-variant">High squad churn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Creation Modal (Suggest, never auto-execute) */}
      {selectedActionForReminder &&
        createPortal(
          <div
            onClick={() => setSelectedActionForReminder(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-lg w-full p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Schedule Manager Reminder</h3>
                    <span className="text-[11px] text-on-surface-variant">Syncs with 1:1 Calendar & Manager Copilot</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedActionForReminder(null)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateReminderSubmit} className="flex flex-col gap-4">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs text-on-surface">
                  <span className="font-bold text-primary block mb-1">Recommended Action:</span>
                  {selectedActionForReminder.title}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Target Execution Date</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full text-xs bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">1:1 Meeting Notes / Context</label>
                  <textarea
                    rows={3}
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder="Notes for the 1:1 conversation..."
                    className="w-full text-xs bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setSelectedActionForReminder(null)}
                    className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Reminder</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Log Intervention Modal */}
      {showInterventionModal &&
        createPortal(
          <div
            onClick={() => setShowInterventionModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-lg w-full p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Log Retention Intervention</h3>
                    <span className="text-[11px] text-on-surface-variant">Records manager intervention to model history</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLogInterventionSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Intervention Category</label>
                  <CustomSelect
                    value={interventionType}
                    onChange={(val) => setInterventionType(val)}
                    options={INTERVENTION_CATEGORIES}
                    className="w-full"
                    buttonClassName="w-full bg-surface-container-low"
                    searchable={false}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Action Summary & Commitments</label>
                  <textarea
                    rows={3}
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    className="w-full text-xs bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setShowInterventionModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Log & Update Risk Model</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
