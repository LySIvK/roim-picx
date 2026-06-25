-- =============================================
-- roim-picx D1 Database Schema
-- Version: 0012_folders_table
-- Description: Create folders table to persist
--              folder creation independent of images
-- =============================================

CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    user_id INTEGER,
    user_login TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(path, user_login)
);

CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);
CREATE INDEX IF NOT EXISTS idx_folders_user_login ON folders(user_login);
