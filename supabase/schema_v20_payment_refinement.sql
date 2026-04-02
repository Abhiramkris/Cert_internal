-- SCHEMA V20: PAYMENT REFINEMENT
-- Adds notes column and unifies payment status/method naming
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE payments RENAME COLUMN payment_method TO method; -- Optional, but let's keep it safe
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT; -- Re-add if we renamed it
