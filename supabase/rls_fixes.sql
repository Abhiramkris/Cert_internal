-- MISSION CONTROL: RLS & REALTIME ENABLER
-- Run this in your Supabase SQL Editor to enable live notifications and chat.

-- 1. NOTIFICATIONS POLICIES
-- Ensures users can see and manage only their own activity/mentions.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- 2. DIRECT MESSAGES POLICIES
-- Ensures private transmissions are only visible to the sender and recipient.
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON direct_messages;
CREATE POLICY "Users can view their own messages" 
ON direct_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON direct_messages;
CREATE POLICY "Users can insert their own messages" 
ON direct_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- 3. REALTIME PUBLICATION
-- Force-add tables to the realtime engine to trigger live UI updates.
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'notifications table already in publication or publication missing';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
  EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'direct_messages table already in publication or publication missing';
  END;
END $$;
