-- SCHEMA V15: HARDENING DATA PERSISTENCE
-- This migration resolves "Failed to post comment" errors by clearing old NOT NULL constraints 
-- and unifying naming conventions for payments and comments.

-- 1. UNIFY COMMENTS SCHEMA
-- Make old comment_text nullable and ensure visibility doesn't conflict
ALTER TABLE comments ALTER COLUMN comment_text DROP NOT NULL;
ALTER TABLE comments ALTER COLUMN visibility DROP NOT NULL;

-- Migrate any remaining data from comment_text to content if content is null
UPDATE comments SET content = comment_text WHERE content IS NULL AND comment_text IS NOT NULL;

-- 2. UNIFY PAYMENTS SCHEMA
-- Ensure payment_status is nullable if we are using the new 'status' column
ALTER TABLE payments ALTER COLUMN payment_status DROP NOT NULL;

-- 3. REINFORCE RLS POLICIES
-- Sometimes multiple policies conflict. Let's drop and recreate simply for the current scope.
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON comments;
CREATE POLICY "Staff can insert comments" ON comments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON payments;
CREATE POLICY "Staff can insert payments" ON payments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. VERIFY READ PERMISSIONS
-- Ensure authenticated users can see all payments and comments as per global pipeline rules
DROP POLICY IF EXISTS "Authenticated users can read comments" ON comments;
CREATE POLICY "Authenticated users can read all comments" ON comments 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read payments" ON payments;
CREATE POLICY "Authenticated users can read all payments" ON payments 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. ENABLE REALTIME (Idempotent Check)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comments') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE comments;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payments') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE payments;
    END IF;
  END IF;
END $$;
