-- ==============================================================================
-- Chat History Schema
-- Allows saving AI chat sessions for the "Create Agent".
-- ==============================================================================

-- 1. Chats table (stores the conversation sessions)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by workspace
CREATE INDEX IF NOT EXISTS idx_chats_workspace_id ON public.chats(workspace_id);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Policy: Workspace members can view their chats
CREATE POLICY "Workspace access for chats select"
    ON public.chats
    FOR SELECT
    USING (
        auth.uid() = workspace_id OR public.is_workspace_member(workspace_id, auth.uid())
    );

-- Policy: Workspace members can create chats
CREATE POLICY "Workspace access for chats insert"
    ON public.chats
    FOR INSERT
    WITH CHECK (
        auth.uid() = workspace_id OR public.is_workspace_member(workspace_id, auth.uid())
    );

-- Policy: Workspace members can update chats
CREATE POLICY "Workspace access for chats update"
    ON public.chats
    FOR UPDATE
    USING (
        auth.uid() = workspace_id OR public.is_workspace_member(workspace_id, auth.uid())
    );

-- Policy: Workspace members can delete chats
CREATE POLICY "Workspace access for chats delete"
    ON public.chats
    FOR DELETE
    USING (
        auth.uid() = workspace_id OR public.is_workspace_member(workspace_id, auth.uid())
    );

-- 2. Chat messages table (stores individual messages)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering messages quickly
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Workspace members can view messages of their chats
CREATE POLICY "Workspace access for chat messages select"
    ON public.chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = chat_messages.chat_id
            AND (c.workspace_id = auth.uid() OR public.is_workspace_member(c.workspace_id, auth.uid()))
        )
    );

-- Policy: Workspace members can insert messages into their chats
CREATE POLICY "Workspace access for chat messages insert"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = chat_messages.chat_id
            AND (c.workspace_id = auth.uid() OR public.is_workspace_member(c.workspace_id, auth.uid()))
        )
    );

-- Policy: Workspace members can update messages
CREATE POLICY "Workspace access for chat messages update"
    ON public.chat_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = chat_messages.chat_id
            AND (c.workspace_id = auth.uid() OR public.is_workspace_member(c.workspace_id, auth.uid()))
        )
    );

-- Policy: Workspace members can delete messages
CREATE POLICY "Workspace access for chat messages delete"
    ON public.chat_messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = chat_messages.chat_id
            AND (c.workspace_id = auth.uid() OR public.is_workspace_member(c.workspace_id, auth.uid()))
        )
    );