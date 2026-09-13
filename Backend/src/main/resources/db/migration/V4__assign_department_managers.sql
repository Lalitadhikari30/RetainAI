-- =============================================================
-- RetainAI — V4: Partition Employees to Department Managers
-- =============================================================

-- Sales Team -> Carlos Mendoza (usr-003)
UPDATE employees SET manager_id = 'usr-003', manager_name = 'Carlos Mendoza' 
WHERE LOWER(department) LIKE '%sale%';

-- Product Team -> Sarah Jenkins (usr-004)
UPDATE employees SET manager_id = 'usr-004', manager_name = 'Sarah Jenkins' 
WHERE LOWER(department) LIKE '%product%' OR LOWER(department) LIKE '%design%';

-- Customer Success -> Jordan Lee (usr-005)
UPDATE employees SET manager_id = 'usr-005', manager_name = 'Jordan Lee' 
WHERE LOWER(department) LIKE '%customer%' OR LOWER(department) LIKE '%support%';

-- Finance Team -> Claire Dupont (usr-006)
UPDATE employees SET manager_id = 'usr-006', manager_name = 'Claire Dupont' 
WHERE LOWER(department) LIKE '%finance%' OR LOWER(department) LIKE '%account%';

-- Engineering Squad -> Alex Chen (usr-002)
UPDATE employees SET manager_id = 'usr-002', manager_name = 'Alex Chen' 
WHERE LOWER(department) LIKE '%engin%' OR LOWER(department) LIKE '%tech%' OR LOWER(department) LIKE '%software%';
