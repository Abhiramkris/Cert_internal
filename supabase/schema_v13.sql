-- SCHEMA V13: PAYMENTS & COMMENTS ALIGNMENT
-- 1. FIX PAYMENTS TABLE
-- Add notes column and align naming with modern actions
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT;

-- (Optional) Cleanup old names if they exist and are empty
-- ALTER TABLE payments DROP COLUMN IF EXISTS payment_method;
-- ALTER TABLE payments DROP COLUMN IF EXISTS payment_status;

-- 2. FIX COMMENTS TABLE
-- Rename or add columns to match RealtimeComments.tsx
ALTER TABLE comments ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT true;

-- Copy data from old columns if they exist
UPDATE comments SET content = comment_text WHERE content IS NULL;

-- 3. RLS FOR PAYMENTS (INSERT)
-- Ensure authenticated users can record payments
DROP POLICY IF EXISTS "Authenticated users can record payments" ON payments;
CREATE POLICY "Authenticated users can record payments" ON payments 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. RLS FOR COMMENTS (INSERT)
-- Ensure authenticated users can post comments
DROP POLICY IF EXISTS "Authenticated users can post comments" ON comments;
CREATE POLICY "Authenticated users can post comments" ON comments 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. REALTIME ENABLEMENT (REDUNDANT BUT SAFE)
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
