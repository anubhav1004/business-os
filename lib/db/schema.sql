-- Business AI Database Schema
-- SQLite database for storing users, sessions, messages, and API credentials

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    team TEXT NOT NULL CHECK(team IN ('business', 'product', 'marketing', 'growth', 'executive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (stores Agent SDK session data)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,  -- Agent SDK session ID
    user_id INTEGER NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_id TEXT,  -- Which agent generated this (e.g., 'product', 'marketing')
    metadata TEXT,  -- JSON string for charts, visualizations, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- API Credentials table (encrypted storage)
CREATE TABLE IF NOT EXISTS api_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL CHECK(service IN (
        'mixpanel',
        'google_analytics',
        'app_store',
        'google_sheets',
        'google_ads',
        'meta_ads',
        'linkedin_ads',
        'tiktok_ads'
    )),
    credentials TEXT NOT NULL,  -- Encrypted JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, service)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id ON api_credentials(user_id);

-- Trigger to update updated_at on users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at on sessions
CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp
AFTER UPDATE ON sessions
BEGIN
    UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at on api_credentials
CREATE TRIGGER IF NOT EXISTS update_api_credentials_timestamp
AFTER UPDATE ON api_credentials
BEGIN
    UPDATE api_credentials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Sample data for development
INSERT OR IGNORE INTO users (id, email, name, team) VALUES
    (1, 'admin@business-ai.com', 'Admin User', 'business'),
    (2, 'product@business-ai.com', 'Product Manager', 'product'),
    (3, 'marketing@business-ai.com', 'Marketing Lead', 'marketing'),
    (4, 'growth@business-ai.com', 'Growth Manager', 'growth'),
    (5, 'ceo@scanandlearn.com', 'Anubhav', 'executive');
