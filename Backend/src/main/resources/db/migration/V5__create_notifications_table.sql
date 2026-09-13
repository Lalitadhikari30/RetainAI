-- =============================================================
-- RetainAI — V5: Create Notifications Table & Initial Seed
-- =============================================================

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'critical', 'warning', 'info'
    employee_id VARCHAR(20),
    employee_name VARCHAR(255),
    link VARCHAR(255),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Seed initial notifications matching UI state
INSERT INTO notifications (id, title, message, severity, employee_id, employee_name, link, read, created_at) VALUES
('notif-001', 'Critical Risk Alert', 'Risk jumped +14% following second teammate departure and on-call surge.', 'critical', 'EMP-88421', 'Marcus Thorne', '/employees/EMP-88421', FALSE, NOW() - INTERVAL '12 minutes'),
('notif-002', 'Elevated Risk Alert', 'Quota raised +25% post new manager transition.', 'warning', 'EMP-88422', 'Samantha Reed', '/employees/EMP-88422', FALSE, NOW() - INTERVAL '45 minutes');
