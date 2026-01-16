-- Snippet Vault Schema Migration
-- Add language, tags, and created_at columns to snippets table

-- Add new columns
ALTER TABLE snippets
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update created_at for existing records (use current timestamp)
UPDATE snippets
SET created_at = NOW()
WHERE created_at IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS snippets_created_at_idx ON snippets(created_at DESC);
CREATE INDEX IF NOT EXISTS snippets_language_idx ON snippets(language);
CREATE INDEX IF NOT EXISTS snippets_tags_idx ON snippets USING GIN(tags);

-- Verify the schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'snippets'
ORDER BY ordinal_position;
