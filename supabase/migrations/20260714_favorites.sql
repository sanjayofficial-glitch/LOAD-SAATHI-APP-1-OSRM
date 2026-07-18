-- Favorites / Bookmarks table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('trip', 'shipment', 'user')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid()::text);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_favorites_entity ON favorites(entity_type, entity_id);
