-- Reusable Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trip', 'shipment')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON templates
  FOR ALL USING (user_id = auth.uid()::text);

CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id, type);
