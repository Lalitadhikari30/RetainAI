import { CopilotMessage } from '../types';

export const initialCopilotMessages: CopilotMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '09:42 AM • Sent by Elena Vance',
    text: 'Why is Marcus Thorne flagged as high risk, and what can I do before his Friday review?',
  },
  {
    id: 'msg-2',
    sender: 'copilot',
    timestamp: '09:42 AM',
    text: '**Marcus Thorne** (Sr. Staff Software Engineer) was reclassified at **88% High Risk** (↑ +14% this quarter). Analysis of historical telemetry, sentiment pulse, and git ticket flow reveals three acute drivers:\n\n* **Stagnation (4.2 yrs):** Without grade tier advancement despite top decile impact ratings.\n* **Fatigue (18.5 hrs/wk):** Weekly avg on-call load post dual-departure in August.\n* **Comp Band (-16%):** Disparity relative to tech sector L6 compensation median.',
    meta: {
      stagnation: '4.2 yrs',
      fatigue: '18.5 hrs',
      compBand: '-16%',
      employeeId: 'EMP-88421',
      employeeName: 'Marcus Thorne',
      generatedMs: 410,
      actions: [
        'Frame Friday around ownership of the v3 migration. Marcus prioritizes architectural sovereignty. Offering tech-lead mandate for the Q1 auth rewrite directly counters stagnation signals.',
        'Bring a concrete Principal promotion roadmap. Do not defer to the annual cycle. Present a written scorecard for L7 promotion approval by December.',
        'Immediately reassign secondary pager duty. Pull in DevRel/Core Infra rotational coverage to cap on-call duty below 6 hours/week before sprint close.',
      ],
    },
  },
];

export const starterPromptChips = [
  'Who are my highest-risk employees this month?',
  'Why did Core Engineering risk jump +18%?',
  'Compare attrition exposure across Sales vs Product',
  'Recommend manager coaching for burnout prevention',
];

export function getMockCopilotResponse(query: string): CopilotMessage {
  const lower = query.toLowerCase();

  if (lower.includes('marcus') || lower.includes('thorne')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: '**Marcus Thorne** remains our highest urgency individual flight risk (88% Attrition Probability). Key leverage points:\n\n1. **Autonomy over Process:** He is frustrated by bureaucratic RFC approvals.\n2. **Financial Alignment:** A +12% salary adjustment plus a 4-year retention equity grant closes the SF Radford benchmark gap.\n3. **On-Call Relief:** Reassigning 10 hrs/wk of secondary on-call reduces burn rate by 60%.',
      meta: {
        stagnation: '4.2 yrs in band',
        fatigue: '18.5 hrs/wk on-call',
        compBand: '-16% below market',
        employeeId: 'EMP-88421',
        employeeName: 'Marcus Thorne',
        generatedMs: 380,
        actions: [
          'Schedule 1:1 roadmap sync before end of week',
          'Submit off-cycle equity grant proposal to Compensation Committee',
          'Rotate secondary Tier-1 pager coverage to European team squad',
        ],
      },
    };
  }

  if (lower.includes('highest-risk') || lower.includes('highest risk') || lower.includes('who are')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: 'Currently, **42 employees (3.4% of total workforce)** sit in the Critical Flight Risk cohort (>70% risk). Top 3 individuals with highest replacement cost exposure:\n\n1. **Marcus Thorne (88% - Engineering):** $215,000 replacement cost. Auth & Billing single point of failure.\n2. **Samantha Reed (84% - Sales):** $175,000 replacement cost. Manages $4.2M annual enterprise pipeline.\n3. **Julian Vance (82% - Engineering):** $240,000 replacement cost. Lead ML compute architect.',
      meta: {
        stagnation: 'Avg 3.8 yrs',
        fatigue: 'Avg 16.2 hrs OT',
        compBand: '-14% market delta',
        generatedMs: 440,
        actions: [
          'Run automated retention review across top 5 flight profiles',
          'Deploy targeted retention equity refresh for IC-6/M-1 staff',
          'Notify VP of Engineering regarding single-point-of-failure risks',
        ],
      },
    };
  }

  if (lower.includes('engineering') || lower.includes('jump') || lower.includes('18%')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: '**Engineering Risk Spike Analysis (+18% in Q3):**\n\n* **Root Cause 1:** Two senior devops departures in August concentrated 80% of cluster incident response onto 3 architects.\n* **Root Cause 2:** RTO policy enforcement (2-day in-person minimum) disproportionately impacted staff engineers with commutes > 35 miles.\n* **Model Prediction:** Without proactive intervention, Engineering attrition will trigger an estimated **$1.2M in direct replacement costs** by Q1.',
      meta: {
        fatigue: 'Tripled P1 alerts',
        compBand: '-15% SF benchmark',
        generatedMs: 490,
        actions: [
          'Approve hybrid remote exceptions for staff with >30 mile commutes',
          'Authorize contractor backfill for infrastructure on-call rotation',
          'Schedule Engineering retention townhall with CTO',
        ],
      },
    };
  }

  if (lower.includes('sales') && lower.includes('product')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: '**Cohort Comparison: Sales vs Product**\n\n* **Sales (11 High Risk):** Primary driver is commission compression (-18%) and quota recalibration (+25%). Retention is volatile but responds quickly to accelerator restructuring.\n* **Product (7 High Risk):** Primary driver is career stagnation and engineering dependency friction. Retention requires architectural autonomy and direct equity vesting incentives.\n\n*Total Attrition Exposure:* Sales accounts for **$1.4M**; Product accounts for **$980k**.',
      meta: {
        generatedMs: 360,
        actions: [
          'Review Sales compensation plan accelerator cliffs',
          'Unblock Product roadmap cross-team dependencies in Jira',
        ],
      },
    };
  }

  if (lower.includes('burnout') || lower.includes('coaching') || lower.includes('wellness')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: '**Manager Burnout Mitigation Playbook:**\n\n1. **Early Warning Signals:** Watch for pull requests submitted after 10 PM and drops in peer review comments.\n2. **Intervention Framework:** Enforce "No Pager Weeks" following major launch cycles.\n3. **1:1 Conversation Script:** "I noticed the recent sprint load was intense. Let’s identify two non-critical deliverables we can push to next quarter."',
      meta: {
        generatedMs: 320,
        actions: [
          'Distribute 1:1 Manager Coaching template to all Directors',
          'Audit weekly sprint on-call hours across core repos',
        ],
      },
    };
  }

  return {
    id: `copilot-${Date.now()}`,
    sender: 'copilot',
    timestamp: 'Just now',
    text: `Based on your query regarding "${query}", RetainAI synthesized workforce signals across Workday, Carta, and Jira telemetry:\n\n* **Cohort Trajectory:** Overall retention stability remains strong at 96.6% across low and medium risk bands.\n* **Recommended Action:** Monitor the 42 high-risk employees identified in the latest Workday sync (#4192).\n* **Predictive Precision:** Current XGBoost model operates at 87.4% accuracy (84.2% precision) for churn forecasting.`,
    meta: {
      generatedMs: 410,
      actions: [
        'Explore detailed metrics in the Attrition Watchlist',
        'Download the executive flight risk summary report',
      ],
    },
  };
}
