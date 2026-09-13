-- =============================================================
-- RetainAI — V1: Initial Schema
-- =============================================================

-- Users table (HR Admins and Managers)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_id VARCHAR(36),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Employees table (HR data subjects)
CREATE TABLE employees (
    id VARCHAR(20) PRIMARY KEY,
    employee_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(5),
    avatar VARCHAR(500),
    role VARCHAR(255),
    department VARCHAR(100) NOT NULL,
    band VARCHAR(50),
    tenure_years INTEGER DEFAULT 0,
    tenure_months INTEGER DEFAULT 0,
    location VARCHAR(255),
    manager_id VARCHAR(36),
    manager_name VARCHAR(255),
    monthly_income DECIMAL(12,2),
    annual_salary DECIMAL(12,2),
    overtime_hours_per_week DECIMAL(5,1) DEFAULT 0,
    job_satisfaction INTEGER,
    years_since_last_promotion DECIMAL(5,1),
    commute_distance_miles DECIMAL(5,1),
    distance_from_home INTEGER,
    work_life_balance INTEGER,
    performance_rating INTEGER,
    peer_departures INTEGER DEFAULT 0,
    comp_vs_market_delta_percent DECIMAL(5,1),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Upload batches (CSV ingestion tracking)
CREATE TABLE upload_batches (
    id VARCHAR(36) PRIMARY KEY,
    batch_number VARCHAR(20),
    uploaded_by VARCHAR(36),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filename VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processing',
    employees_processed INTEGER DEFAULT 0,
    compute_duration VARCHAR(20),
    CONSTRAINT fk_batch_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Predictions (ML model output + AI explanations)
CREATE TABLE predictions (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    batch_id VARCHAR(36),
    risk_score INTEGER,
    risk_band VARCHAR(10),
    risk_velocity VARCHAR(10),
    risk_delta VARCHAR(100),
    primary_driver TEXT,
    feature_importances_json TEXT,
    risk_factors_json TEXT,
    historical_trajectory_json TEXT,
    ai_explanation TEXT,
    recommended_actions_json TEXT,
    replacement_cost DECIMAL(12,2),
    knowledge_loss_risk TEXT,
    team_headcount VARCHAR(20),
    team_turnover_90d VARCHAR(20),
    model_used VARCHAR(10),
    confidence_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediction_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_prediction_batch FOREIGN KEY (batch_id) REFERENCES upload_batches(id)
);

-- Column mappings (AI-suggested CSV → canonical schema mapping)
CREATE TABLE column_mappings (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    source_column VARCHAR(255),
    mapped_to VARCHAR(255),
    confidence VARCHAR(10),
    confidence_percent INTEGER,
    match_type VARCHAR(50),
    sample_value VARCHAR(500),
    required BOOLEAN DEFAULT FALSE,
    confirmed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_mapping_batch FOREIGN KEY (batch_id) REFERENCES upload_batches(id)
);

-- Intervention logs (manager retention actions)
CREATE TABLE intervention_logs (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    logged_by VARCHAR(36),
    action_taken TEXT NOT NULL,
    date_taken DATE NOT NULL,
    outcome VARCHAR(20),
    outcome_checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intervention_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_intervention_logger FOREIGN KEY (logged_by) REFERENCES users(id)
);

-- Indexes for common queries
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_predictions_employee_id ON predictions(employee_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_intervention_employee_id ON intervention_logs(employee_id);
CREATE INDEX idx_column_mappings_batch_id ON column_mappings(batch_id);
