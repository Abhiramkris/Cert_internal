-- DIRECT MESSAGES
CREATE TABLE direct_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages they sent or received
CREATE POLICY "Users can read own direct messages" ON direct_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Users can insert messages if they are the sender
CREATE POLICY "Users can insert direct messages" ON direct_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Users can update messages if they are the receiver (to mark as read)
CREATE POLICY "Receivers can update direct messages" ON direct_messages FOR UPDATE USING (
  auth.uid() = receiver_id
);

-- UPDATE REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
