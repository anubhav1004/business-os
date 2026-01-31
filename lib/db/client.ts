/**
 * SQLite Database Client
 *
 * Provides a simple interface for interacting with the SQLite database.
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'business-ai.db');

// Initialize database connection
let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Initialize schema if not exists
    initializeSchema();
  }

  return db;
}

function initializeSchema() {
  if (!db) return;

  try {
    const schemaSQL = readFileSync(
      join(process.cwd(), 'lib', 'db', 'schema.sql'),
      'utf-8'
    );

    db.exec(schemaSQL);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}

// User operations
export interface User {
  id: number;
  email: string;
  name: string;
  team: 'business' | 'product' | 'marketing' | 'growth' | 'executive';
  created_at: string;
  updated_at: string;
}

export function createUser(email: string, name: string, team: User['team']): User {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT INTO users (email, name, team) VALUES (?, ?, ?)'
  );
  const result = stmt.run(email, name, team);

  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserById(id: number): User | undefined {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

// Session operations
export interface Session {
  id: string;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export function createSession(sessionId: string, userId: number, title?: string): Session {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)'
  );
  stmt.run(sessionId, userId, title || null);

  return getSessionById(sessionId)!;
}

export function getSessionById(id: string): Session | undefined {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(id) as Session | undefined;
}

export function getUserSessions(userId: number): Session[] {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC'
  );
  return stmt.all(userId) as Session[];
}

export function updateSessionTitle(sessionId: string, title: string): void {
  const db = getDB();
  const stmt = db.prepare('UPDATE sessions SET title = ? WHERE id = ?');
  stmt.run(title, sessionId);
}

// Message operations
export interface Message {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id: string | null;
  metadata: string | null;
  created_at: string;
}

export function createMessage(
  sessionId: string,
  role: Message['role'],
  content: string,
  agentId?: string,
  metadata?: object
): Message {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT INTO messages (session_id, role, content, agent_id, metadata) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    sessionId,
    role,
    content,
    agentId || null,
    metadata ? JSON.stringify(metadata) : null
  );

  return getMessageById(result.lastInsertRowid as number)!;
}

export function getMessageById(id: number): Message | undefined {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
  return stmt.get(id) as Message | undefined;
}

export function getSessionMessages(sessionId: string): Message[] {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
  );
  return stmt.all(sessionId) as Message[];
}

// API Credentials operations
export interface APICredentials {
  id: number;
  user_id: number;
  service: string;
  credentials: string;
  created_at: string;
  updated_at: string;
}

export function saveAPICredentials(
  userId: number,
  service: string,
  credentials: object
): APICredentials {
  const db = getDB();

  // Note: In production, encrypt the credentials before storing
  const credentialsJSON = JSON.stringify(credentials);

  const stmt = db.prepare(`
    INSERT INTO api_credentials (user_id, service, credentials)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, service) DO UPDATE SET
      credentials = excluded.credentials,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(userId, service, credentialsJSON);

  return getAPICredentials(userId, service)!;
}

export function getAPICredentials(
  userId: number,
  service: string
): APICredentials | undefined {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM api_credentials WHERE user_id = ? AND service = ?'
  );
  return stmt.get(userId, service) as APICredentials | undefined;
}

export function getAllUserCredentials(userId: number): APICredentials[] {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM api_credentials WHERE user_id = ?'
  );
  return stmt.all(userId) as APICredentials[];
}

// Close database connection
export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}
