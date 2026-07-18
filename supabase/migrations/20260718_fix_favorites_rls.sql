-- ============================================================
-- FIX favorites table: RLS + UNIQUE constraint
-- Safe migration — no data loss
-- ============================================================

-- Step 1: Drop the old UNIQUE constraint (was built on UUID type)
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_entity_type_entity_id_key;

-- Step 2: Make sure entity_id is TEXT (idempotent — copies UUID data as text)
ALTER TABLE favorites ALTER COLUMN entity_id TYPE TEXT;

-- Step 3: Re-add the UNIQUE constraint on TEXT columns
ALTER TABLE favorites 
  ADD CONSTRAINT favorites_user_id_entity_type_entity_id_key 
  UNIQUE (user_id, entity_type, entity_id);

-- Step 4: Drop all existing favorites policies
DROP POLICY IF EXISTS "Users manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can select own favorites" ON favorites;

-- Step 5: Recreate with proper USING + WITH CHECK for Clerk JWT
CREATE POLICY "favorites_select" ON favorites
  FOR SELECT TO authenticated 
  USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE TO authenticated 
  USING (user_id = auth.jwt()->>'sub');

-- Step 6: Make sure RLS is enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
