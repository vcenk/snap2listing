-- ==================================================================
-- MULTI-CHANNEL MIGRATION - SAFE VERSION (Handles Existing Objects)
-- ==================================================================

-- 1. Add channel_overrides to listings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'channel_overrides'
  ) THEN
    ALTER TABLE listings ADD COLUMN channel_overrides JSONB DEFAULT '{}';
  END IF;
END $$;

-- 2. Add selected_channels to listings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'selected_channels'
  ) THEN
    ALTER TABLE listings ADD COLUMN selected_channels TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 3. Add ai_generated_base to listings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'ai_generated_base'
  ) THEN
    ALTER TABLE listings ADD COLUMN ai_generated_base JSONB DEFAULT '{}';
  END IF;
END $$;

-- 4. Create listings_exports table (if not exists)
CREATE TABLE IF NOT EXISTS listings_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_slug TEXT NOT NULL,
  exported_at TIMESTAMPTZ DEFAULT now(),
  export_format TEXT NOT NULL, -- 'csv', 'json', 'api'
  export_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create ai_generation_history table (if not exists)
CREATE TABLE IF NOT EXISTS ai_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_slug TEXT NOT NULL,
  prompt_data JSONB NOT NULL,
  generated_content JSONB NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_listings_selected_channels ON listings USING GIN(selected_channels);
CREATE INDEX IF NOT EXISTS idx_listings_channel_overrides ON listings USING GIN(channel_overrides);
CREATE INDEX IF NOT EXISTS idx_listings_exports_listing ON listings_exports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_exports_channel ON listings_exports(channel_slug);
CREATE INDEX IF NOT EXISTS idx_ai_history_listing ON ai_generation_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user ON ai_generation_history(user_id);

-- 7. Enable RLS
ALTER TABLE listings_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;

-- 8. Create policies (DROP first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own exports" ON listings_exports;
CREATE POLICY "Users can view own exports" ON listings_exports
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create exports" ON listings_exports;
CREATE POLICY "Users can create exports" ON listings_exports
  FOR INSERT WITH CHECK (
    listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own history" ON ai_generation_history;
CREATE POLICY "Users can view own history" ON ai_generation_history
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create history" ON ai_generation_history;
CREATE POLICY "Users can create history" ON ai_generation_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. Create helper function for getting channel info
CREATE OR REPLACE FUNCTION get_channel_info(channel_slug TEXT)
RETURNS TABLE (id UUID, name TEXT, slug TEXT) AS $$
  SELECT id, name, slug FROM channels WHERE slug = channel_slug LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ✅ Migration Complete
SELECT 'Multi-channel migration completed successfully!' as status;
