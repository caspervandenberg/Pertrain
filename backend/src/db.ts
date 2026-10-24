import { DatabaseSync } from "node:sqlite";
import path from "node:path";

// Database file lives outside src/, in the project's top-level data/ folder.
const dbPath = path.join(import.meta.dirname, "..", "data", "pertrain.db");

export const db = new DatabaseSync(dbPath);

// SQLite only enforces foreign keys when this is on, and it has to be set per connection.
db.exec("PRAGMA foreign_keys = ON");

// USERS
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        display_name  TEXT NOT NULL CHECK (length(display_name) <= 64),
        password_hash TEXT NOT NULL
    )
`);

// TRAINS
db.exec(`
    CREATE TABLE IF NOT EXISTS trains (
        train_number INTEGER PRIMARY KEY CHECK (train_number BETWEEN 0 AND 9999)
    )
`);

// RIDES
db.exec(`
    CREATE TABLE IF NOT EXISTS rides (
        id           TEXT PRIMARY KEY,
        user_id      TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        train_number INTEGER NOT NULL REFERENCES trains(train_number),
        timestamp    TEXT    NOT NULL -- ISO 8601, from Date.toISOString()
    )
`);

// SESSIONS
db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, -- SHA-256 of the token; only the client knows the token itself
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL     -- ISO 8601, from Date.toISOString()
    )
`);
