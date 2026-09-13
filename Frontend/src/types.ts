export type RiskBand = 'high' | 'medium' | 'low';
export type RiskVelocity = 'rising' | 'stable' | 'falling';

export interface RiskFactor {
  name: string;
  value: string;
  weight: number; // 0 - 100%
  benchmark: string;
  iconName: 'hourglass' | 'alarm' | 'payments' | 'group' | 'commute' | 'trending';
  status: RiskBand;
}

export interface TrajectoryPoint {
  month: string;
  score: number;
  event?: string;
  color?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  impact: 'High' | 'Very High' | 'Medium';
  note: string;
  targetDays?: string;
}

export interface Employee {
  id: string;
  employeeNumber: number;
  name: string;
  initials: string;
  avatar?: string;
  role: string;
  department: 'Engineering' | 'Sales' | 'Product' | 'Customer Success' | 'Finance';
  band: string;
  tenureYears: number;
  tenureMonths: number;
  tenureFormatted: string;
  location: string;
  manager: string;
  monthlyIncome: number;
  annualSalary: number;
  flightRiskScore: number; // 0 - 100
  flightRiskBand: RiskBand;
  riskVelocity: RiskVelocity;
  riskDelta: string;
  primaryDriver: string;
  overtimeHoursPerWeek: number;
  jobSatisfaction: number; // 1 - 5
  yearsSinceLastPromotion: number;
  commuteDistanceMiles: number;
  peerDepartures: number;
  compVsMarketDeltaPercent: number; // e.g. -16
  replacementCost: number;
  knowledgeLossRisk: string;
  teamHeadcount: string;
  teamTurnover90d: string;
  historicalTrajectory: TrajectoryPoint[];
  riskFactors: RiskFactor[];
  copilotSummary: string;
  recommendedActions: RecommendedAction[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  meta?: {
    stagnation?: string;
    fatigue?: string;
    compBand?: string;
    employeeId?: string;
    employeeName?: string;
    actions?: string[];
    generatedMs?: number;
  };
}

export interface SchemaMapping {
  id: string;
  csvColumn: string;
  mappedField: string;
  confidence: string;
  confidencePercent: number;
  matchType: 'Exact Match' | 'Fuzzy Match' | 'Semantic Match';
  sampleValue: string;
  required: boolean;
}

export interface IngestionBatch {
  id: string;
  batchNumber: string;
  timestamp: string;
  filename: string;
  cohort: string;
  status: 'Completed' | 'Failed (Missing headers)' | 'Processing';
  computeDuration: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalEmployeesDelta: string;
  highRiskEmployees: number;
  highRiskPercent: string;
  attritionCostExposure: number;
  attritionCostAvgPerHire: number;
  attritionCostMomDelta: string;
  lastRefreshDate: string;
  lastRefreshTime: string;
  syncSource: string;
  departmentCount?: number;
  isManager?: boolean;
  roleName?: string;
  sparklines?: {
    totalEmployees?: number[];
    highRisk?: number[];
    attritionCost?: number[];
    dataRefresh?: number[];
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  employeeId?: string;
  employeeName?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
