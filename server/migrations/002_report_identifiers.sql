-- server/migrations/002_report_identifiers.sql
-- Persist hashed identifiers with reports so admin bans survive reconnects (socket ids do not).
-- Idempotent: migrations run on every start.

ALTER TABLE reports ADD COLUMN IF NOT EXISTS reported_client_id VARCHAR(255);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reported_ip_hash VARCHAR(64);
