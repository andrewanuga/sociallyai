-- Create support chats table
CREATE TABLE IF NOT EXISTS support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create support messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES support_chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS support_chats_user_id_idx ON support_chats(user_id);
CREATE INDEX IF NOT EXISTS support_messages_chat_id_idx ON support_messages(chat_id);
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx ON support_messages(created_at);

-- RLS
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_chats
CREATE POLICY "Users can view their own support chats" 
    ON support_chats FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support chats" 
    ON support_chats FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support chats"
    ON support_chats FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for support_messages
CREATE POLICY "Users can view messages in their chats" 
    ON support_messages FOR SELECT 
    USING (EXISTS (SELECT 1 FROM support_chats WHERE support_chats.id = support_messages.chat_id AND support_chats.user_id = auth.uid()));

CREATE POLICY "Users can insert messages in their chats" 
    ON support_messages FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM support_chats WHERE support_chats.id = support_messages.chat_id AND support_chats.user_id = auth.uid()));

-- Also allow service role full access
CREATE POLICY "Service role full access on support_chats" ON support_chats FOR ALL USING (true);
CREATE POLICY "Service role full access on support_messages" ON support_messages FOR ALL USING (true);
