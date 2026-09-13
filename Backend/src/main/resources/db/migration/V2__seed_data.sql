-- =============================================================
-- RetainAI — V2: Seed Data (matches frontend mock data exactly)
-- =============================================================

-- Seed Users (passwords are BCrypt hashed "password123")
INSERT INTO users (id, email, password_hash, role, name, avatar) VALUES
('usr-001', 'elena.vance@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'HR_ADMIN', 'Elena Vance', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('usr-002', 'alex.chen@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'MANAGER', 'Alex Chen', NULL),
('usr-003', 'carlos.mendoza@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'MANAGER', 'Carlos Mendoza', NULL),
('usr-004', 'sarah.jenkins@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'MANAGER', 'Sarah Jenkins', NULL),
('usr-005', 'jordan.lee@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'MANAGER', 'Jordan Lee', NULL),
('usr-006', 'claire.dupont@company.com', '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne', 'MANAGER', 'Claire Dupont', NULL);

-- Seed Employees (matching frontend mock data exactly)
INSERT INTO employees (id, employee_number, name, initials, avatar, role, department, band, tenure_years, tenure_months, location, manager_id, manager_name, monthly_income, annual_salary, overtime_hours_per_week, job_satisfaction, years_since_last_promotion, commute_distance_miles, peer_departures, comp_vs_market_delta_percent, active) VALUES
('EMP-88421', 88421, 'Marcus Thorne', 'MT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Sr. Staff Software Engineer', 'Engineering', 'IC-6 Staff', 4, 2, 'San Francisco (Hybrid)', 'usr-002', 'Alex Chen', 15416, 185000, 18.5, 2, 4.2, 38, 3, -16, TRUE),
('EMP-88422', 88422, 'Samantha Reed', 'SR', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Account Executive', 'Sales', 'IC-5 Senior', 2, 8, 'New York (Hybrid)', 'usr-003', 'Carlos Mendoza', 12500, 150000, 12.0, 2, 2.8, 15, 2, -12, TRUE),
('EMP-88423', 88423, 'David Chen', 'DC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Product Lead', 'Product', 'M-1 Lead', 3, 5, 'San Francisco (Hybrid)', 'usr-004', 'Sarah Jenkins', 14500, 174000, 8.5, 3, 3.1, 22, 2, -14, TRUE),
('EMP-88424', 88424, 'Elena Rostova', 'ER', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'DevOps Architect', 'Engineering', 'IC-5 Senior', 2, 1, 'Remote (US)', 'usr-002', 'Alex Chen', 13750, 165000, 16.0, 2, 2.1, 0, 2, -8, TRUE),
('EMP-88425', 88425, 'Rachel Adams', 'RA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'Customer Support Spec', 'Customer Success', 'IC-3 Specialist', 1, 9, 'Austin (Hybrid)', 'usr-005', 'Jordan Lee', 6500, 78000, 4.0, 3, 1.8, 12, 1, -4, TRUE),
('EMP-88426', 88426, 'Kevin Patel', 'KP', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Financial Analyst', 'Finance', 'IC-4 Analyst', 2, 4, 'Chicago (In-Office)', 'usr-006', 'Claire Dupont', 8200, 98400, 5.0, 4, 1.5, 8, 0, 2, TRUE),
('EMP-88427', 88427, 'Maya Lin', 'ML', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', 'Design Systems Lead', 'Product', 'IC-5 Senior', 3, 1, 'San Francisco (Hybrid)', 'usr-004', 'Sarah Jenkins', 13500, 162000, 2.0, 5, 0.8, 14, 0, 6, TRUE),
('EMP-88428', 88428, 'Julian Vance', 'JV', NULL, 'Staff ML Engineer', 'Engineering', 'IC-6 Staff', 3, 9, 'San Francisco (Hybrid)', 'usr-002', 'Alex Chen', 16200, 194400, 15.5, 2, 3.5, 28, 3, -18, TRUE);

-- Seed initial upload batch
INSERT INTO upload_batches (id, batch_number, uploaded_by, uploaded_at, filename, status, employees_processed, compute_duration) VALUES
('batch-4192', '#4192', 'usr-001', '2024-10-24 09:15:00', 'workday_q3_final.csv', 'Completed', 1248, '1m 14s'),
('batch-4188', '#4188', 'usr-001', '2024-09-18 14:30:00', 'adp_sync_sept.csv', 'Completed', 1220, '1m 08s'),
('batch-4172', '#4172', 'usr-001', '2024-08-12 11:05:00', 'bamboo_august_dump.csv', 'Completed', 1195, '1m 02s'),
('batch-4160', '#4160', 'usr-001', '2024-07-01 10:00:00', 'test_export_err.csv', 'Failed (Missing headers)', 0, '4s');

-- Seed Predictions (matching frontend mock data exactly)
-- Marcus Thorne — 88% High Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-001', 'EMP-88421', 'batch-4192', 88, 'high', 'rising', '+14% since July',
 'No promotion in 4.2 years, 18+ hrs weekly overtime, commute >45m',
 '[{"feature":"YearsSinceLastPromotion","importance":0.94},{"feature":"OverTime","importance":0.86},{"feature":"MonthlyIncome","importance":0.72},{"feature":"PeerDepartures","importance":0.65},{"feature":"DistanceFromHome","importance":0.32}]',
 '[{"name":"Years Since Last Promotion","value":"4.2 yrs (94% weight)","weight":94,"benchmark":"Company band tenure benchmark is 2.1 yrs for L6 Staff level.","iconName":"hourglass","status":"high"},{"name":"Overtime & On-Call Load","value":"18.5 hrs/wk (86% weight)","weight":86,"benchmark":"P90 on-call alerts doubled across August-September cycle.","iconName":"alarm","status":"high"},{"name":"Compensation vs Market Median","value":"-16% delta (72% weight)","weight":72,"benchmark":"Lagging Radford SF Metro Tech median for comparable roles.","iconName":"payments","status":"medium"},{"name":"Peer Departures in Team","value":"3 in 90d (65% weight)","weight":65,"benchmark":"Includes departure of Tech Lead and Lead DevOps partner.","iconName":"group","status":"medium"},{"name":"Commute Distance","value":"38 miles (32% weight)","weight":32,"benchmark":"East Bay commute requiring 2-day mandatory office presence.","iconName":"commute","status":"low"}]',
 '[{"month":"May","score":32},{"month":"Jun","score":38},{"month":"Jul","score":54,"event":"Teammate Exited"},{"month":"Aug","score":71,"event":"On-call Doubled"},{"month":"Sep","score":82},{"month":"Oct","score":88}]',
 'Marcus has been in the same Staff Engineer band for over four years despite consistently exceeding sprint targets. In the past 90 days, his on-call incidents doubled following two senior teammate departures, driving his weekly overtime to peak levels. Combined with compensation falling 16% below San Francisco market percentiles, these signals strongly indicate high flight risk to competitive offers.',
 '[{"id":"rec-1","title":"Schedule a 1:1 growth conversation this week to discuss Principal level roadmap and career trajectory.","impact":"High","note":"Target completion: Within 3 business days","targetDays":"3 days"},{"id":"rec-2","title":"Review on-call rotation distribution and rebalance sprint workload with engineering management.","impact":"High","note":"Alleviates 18.5 hr/wk burnout driver","targetDays":"5 days"},{"id":"rec-3","title":"Initiate off-cycle compensation review with Total Rewards committee.","impact":"Very High","note":"Recommended adjustment: +12% base + equity refresh","targetDays":"Next pay cycle"}]',
 215000, 'Critical — Sole Primary System Architect for Auth & Billing pipelines.', '5 / 8', '37.5%', 'full', '2024-10-24 09:15:00');

-- Samantha Reed — 84% High Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-002', 'EMP-88422', 'batch-4192', 84, 'high', 'rising', '+18% since August',
 'Quota increase +25%, manager change within last 60 days',
 '[{"feature":"ManagerChange","importance":0.91},{"feature":"QuotaExpansion","importance":0.82},{"feature":"CommissionRate","importance":0.68}]',
 '[{"name":"Manager Relationship Disruption","value":"New Manager in 60d (91% weight)","weight":91,"benchmark":"Historical flight spikes occur 3-6 months post manager switch.","iconName":"group","status":"high"},{"name":"Quota Expansion Velocity","value":"+25% Target (82% weight)","weight":82,"benchmark":"Sales territory realignments created pipeline friction.","iconName":"trending","status":"high"},{"name":"Commission Realization Rate","value":"-18% MoM (68% weight)","weight":68,"benchmark":"Slower deal closure cycle due to delayed technical solutions.","iconName":"payments","status":"medium"}]',
 '[{"month":"May","score":35},{"month":"Jun","score":42},{"month":"Jul","score":50},{"month":"Aug","score":66,"event":"Manager Replaced"},{"month":"Sep","score":76,"event":"Quota Raised +25%"},{"month":"Oct","score":84}]',
 'Samantha was recently assigned a new sales VP with altered territory distributions and a 25% quota spike without pipeline adjustments. Deal velocity slowed in Q3 leading to diminished commission realization.',
 '[{"id":"rec-sr-1","title":"Conduct compensation & pipeline rebalance audit with VP of Sales.","impact":"Very High","note":"Adjust accelerated tiers to protect Q4 quota morale.","targetDays":"4 days"},{"id":"rec-sr-2","title":"Provide dedicated Sales Engineering support for her enterprise pipeline.","impact":"High","note":"Shortens technical validation stage by 14 days.","targetDays":"1 week"}]',
 175000, 'High — Manages top 3 financial tier enterprise accounts.', '6 / 9', '25%', 'full', '2024-10-24 09:15:00');

-- David Chen — 79% High Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-003', 'EMP-88423', 'batch-4192', 79, 'high', 'stable', 'stable across Q3',
 'Compensation 14% below industry benchmark, peer departures',
 '[{"feature":"MonthlyIncome","importance":0.88},{"feature":"CrossFuncBlockers","importance":0.70}]',
 '[{"name":"Compensation Benchmark Gap","value":"-14% vs Market (88% weight)","weight":88,"benchmark":"SF Product Lead median currently at $200k base.","iconName":"payments","status":"high"},{"name":"Cross-functional Dependency Blockers","value":"3 teams blocked (70% weight)","weight":70,"benchmark":"Engineering velocity delays impacting roadmap deliveries.","iconName":"alarm","status":"medium"}]',
 '[{"month":"May","score":65},{"month":"Jun","score":72},{"month":"Jul","score":78},{"month":"Aug","score":80},{"month":"Sep","score":79},{"month":"Oct","score":79}]',
 'David has plateaued in compensation following two major product rollouts that gained market traction. External recruiters from early-stage unicorns are actively targeting his profile.',
 '[{"id":"rec-dc-1","title":"Present executive roadmap sponsorship and equity refresher grant.","impact":"Very High","note":"Target retention through upcoming Product Series launch.","targetDays":"5 days"}]',
 195000, 'High — Product visionary for Core Analytics & Export suites.', '4 / 5', '20%', 'full', '2024-10-24 09:15:00');

-- Elena Rostova — 74% High Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-004', 'EMP-88424', 'batch-4192', 74, 'high', 'rising', '+12% in 30 days',
 'On-call frequency tripled in Q3, flagged burnout sentiment',
 '[{"feature":"OverTime","importance":0.92}]',
 '[{"name":"On-Call Surge & Alert Fatigue","value":"3x Incident Growth (92% weight)","weight":92,"benchmark":"Excessive nocturnal P1 incident escalation.","iconName":"alarm","status":"high"}]',
 '[{"month":"May","score":38},{"month":"Jun","score":45},{"month":"Jul","score":55},{"month":"Aug","score":62},{"month":"Sep","score":68},{"month":"Oct","score":74}]',
 'Elena is experiencing severe burnout after multiple cloud migration incidents and team turnover left her as the sole on-call escalation architect.',
 '[{"id":"rec-er-1","title":"Spin up managed on-call vendor support or distribute rotational shifts across secondary squad.","impact":"High","note":"Eliminate nocturnal weekend shifts immediately.","targetDays":"2 days"}]',
 180000, 'Severe — Primary maintainer of Kubernetes & CI/CD cluster.', '3 / 6', '50%', 'full', '2024-10-24 09:15:00');

-- Rachel Adams — 56% Medium Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-005', 'EMP-88425', 'batch-4192', 56, 'medium', 'stable', 'stable past 60d',
 'Stagnant review score, low internal collaboration score',
 '[{"feature":"CareerProgression","importance":0.55}]',
 '[{"name":"Career Progression Ambiguity","value":"No clear next level (55% weight)","weight":55,"benchmark":"Average tenure to IC-4 promotion is 18 months.","iconName":"hourglass","status":"medium"}]',
 '[{"month":"May","score":50},{"month":"Jun","score":54},{"month":"Jul","score":57},{"month":"Aug","score":55},{"month":"Sep","score":56},{"month":"Oct","score":56}]',
 'Rachel is performing reliably but expressed career path ambiguity during the Q3 pulse survey.',
 '[{"id":"rec-ra-1","title":"Outline senior customer specialist enablement rubric.","impact":"Medium","note":"Set clear milestones for Q1 promotion.","targetDays":"2 weeks"}]',
 75000, 'Moderate — Tier-2 escalations liaison.', '8 / 8', '12%', 'reduced', '2024-10-24 09:15:00');

-- Kevin Patel — 48% Medium Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-006', 'EMP-88426', 'batch-4192', 48, 'medium', 'falling', '-6% in last quarter',
 'Role rotation request pending, market compensation aligned',
 '[{"feature":"InternalMobility","importance":0.45}]',
 '[{"name":"Internal Mobility Fulfillment","value":"Transfer requested (45% weight)","weight":45,"benchmark":"Role rotation to Strategic Finance requested in July.","iconName":"trending","status":"medium"}]',
 '[{"month":"May","score":62},{"month":"Jun","score":58},{"month":"Jul","score":54},{"month":"Aug","score":51},{"month":"Sep","score":49},{"month":"Oct","score":48}]',
 'Kevin has shown improvement in sentiment after positive manager 1:1 check-ins. Risk is trending downward.',
 '[{"id":"rec-kp-1","title":"Confirm timeline for Strategic Finance project secondment.","impact":"Medium","note":"Provide 20% allocation to Strategic FP&A.","targetDays":"1 week"}]',
 92000, 'Low — Well-documented FP&A models.', '6 / 6', '0%', 'full', '2024-10-24 09:15:00');

-- Maya Lin — 22% Low Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-007', 'EMP-88427', 'batch-4192', 22, 'low', 'falling', '-15% post equity grant',
 'Recent equity refresh and internal team recognition',
 '[{"feature":"JobSatisfaction","importance":0.96}]',
 '[{"name":"Work Satisfaction & Recognition","value":"Top Decile (96% retention signal)","weight":96,"benchmark":"High engagement across design system workshops.","iconName":"trending","status":"low"}]',
 '[{"month":"May","score":45},{"month":"Jun","score":40},{"month":"Jul","score":32},{"month":"Aug","score":28},{"month":"Sep","score":24},{"month":"Oct","score":22}]',
 'Maya is highly engaged following her recent promotion and equity refresher. Lowest flight risk cohort.',
 '[{"id":"rec-ml-1","title":"Invite Maya to mentor junior UI designers in the upcoming cohort.","impact":"Medium","note":"Sustains leadership engagement.","targetDays":"1 month"}]',
 155000, 'Moderate — Design library owner.', '5 / 5', '0%', 'full', '2024-10-24 09:15:00');

-- Julian Vance — 82% High Risk
INSERT INTO predictions (id, employee_id, batch_id, risk_score, risk_band, risk_velocity, risk_delta, primary_driver, feature_importances_json, risk_factors_json, historical_trajectory_json, ai_explanation, recommended_actions_json, replacement_cost, knowledge_loss_risk, team_headcount, team_turnover_90d, model_used, created_at) VALUES
('pred-008', 'EMP-88428', 'batch-4192', 82, 'high', 'rising', '+16% past 90 days',
 'AI compute budget constraints, competitor headhunting outreach',
 '[{"feature":"ComputeInfra","importance":0.88}]',
 '[{"name":"Compute Infrastructure Deficit","value":"High Friction (88% weight)","weight":88,"benchmark":"GPU cluster allocation delays impacting model experimentation.","iconName":"alarm","status":"high"}]',
 '[{"month":"May","score":40},{"month":"Jun","score":48},{"month":"Jul","score":58},{"month":"Aug","score":68},{"month":"Sep","score":76},{"month":"Oct","score":82}]',
 'Julian is receiving constant offers from autonomous AI labs. Blocked experimentation cycles are primary push factor.',
 '[{"id":"rec-jv-1","title":"Grant autonomous cloud compute budget for LLM research projects.","impact":"Very High","note":"Empowers technical exploration directly.","targetDays":"3 days"}]',
 240000, 'Critical — Lead engineer for recommendation fine-tuning.', '4 / 6', '33%', 'full', '2024-10-24 09:15:00');

-- Seed column mappings for the initial batch
INSERT INTO column_mappings (id, batch_id, source_column, mapped_to, confidence, confidence_percent, match_type, sample_value, required, confirmed) VALUES
('map-1', 'batch-4192', 'emp_id_num', 'Employee ID (Primary Key)', '100%', 100, 'Exact Match', 'EMP-88421', TRUE, TRUE),
('map-2', 'batch-4192', 'full_name', 'Full Name', '100%', 100, 'Exact Match', 'Marcus Sterling', TRUE, TRUE),
('map-3', 'batch-4192', 'dept_code', 'Department Identifier', '95%', 95, 'Fuzzy Match', 'ENG-CORE', TRUE, TRUE),
('map-4', 'batch-4192', 'last_promo_date', 'Last Promotion Date (ISO-8601)', '95%', 95, 'Fuzzy Match', '2022-03-15', TRUE, TRUE),
('map-5', 'batch-4192', 'weekly_ot_hrs', 'Overtime Hours / Wk (Numeric)', '88%', 88, 'Semantic Match', '14.5', TRUE, TRUE),
('map-6', 'batch-4192', 'base_salary_usd', 'Base Salary (Annualized USD)', '100%', 100, 'Exact Match', '$132,000', TRUE, TRUE),
('map-7', 'batch-4192', 'commute_distance_mi', 'Commute Distance (Miles)', '88%', 88, 'Semantic Match', '24.2', TRUE, TRUE);
