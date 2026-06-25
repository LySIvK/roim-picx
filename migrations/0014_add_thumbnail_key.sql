-- =============================================
-- roim-picx D1 Database Schema
-- Version: 0014_add_thumbnail_key
-- Description: Add thumbnail_key column to images
--              for fast thumbnail loading
-- =============================================

ALTER TABLE images ADD COLUMN thumbnail_key TEXT DEFAULT '';
