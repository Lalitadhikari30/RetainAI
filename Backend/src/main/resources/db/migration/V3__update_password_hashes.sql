-- Update user password hashes to valid 60-character BCrypt hash for "password123"
UPDATE users SET password_hash = '$2a$10$3j22Ky4AN5GYakJ1LPPfqOM6.FMuZGO5UFs/YQqlcnItsu58gtkne';
