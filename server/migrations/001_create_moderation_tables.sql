-- server/migrations/001_create_moderation_tables.sql
-- Schema migration for Miloo persistent moderation storage

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(255) PRIMARY KEY,
  reporter_id VARCHAR(255),
  reported_user VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  context TEXT,
  session_id VARCHAR(255),
  recent_messages JSONB,
  timestamp BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  admin_action_timestamp BIGINT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp DESC);

CREATE TABLE IF NOT EXISTS user_bans (
  identifier VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  timestamp BIGINT NOT NULL,
  strike_count INT DEFAULT 1,
  expires_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_user_bans_expires ON user_bans(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_bans_status ON user_bans(status);

CREATE TABLE IF NOT EXISTS moderation_state (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at BIGINT NOT NULL
);

