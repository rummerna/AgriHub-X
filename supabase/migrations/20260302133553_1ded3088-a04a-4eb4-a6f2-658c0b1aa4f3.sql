
-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for question images
INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat-images bucket
CREATE POLICY "Public read chat images" ON storage.objects FOR SELECT USING (bucket_id = 'chat-images');
CREATE POLICY "Auth users upload chat images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own chat images" ON storage.objects FOR DELETE USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies for post-images bucket
CREATE POLICY "Public read post images" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Auth users upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own post images" ON storage.objects FOR DELETE USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies for question-images bucket
CREATE POLICY "Public read question images" ON storage.objects FOR SELECT USING (bucket_id = 'question-images');
CREATE POLICY "Auth users upload question images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'question-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own question images" ON storage.objects FOR DELETE USING (bucket_id = 'question-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL,
  participant_2_id UUID NOT NULL,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_sender_id UUID,
  is_archived_by_1 BOOLEAN NOT NULL DEFAULT false,
  is_archived_by_2 BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_text TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  image_urls TEXT[] DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  reply_to_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see messages in own conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users send messages in own conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Blocked users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own blocks" ON public.blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users create blocks" ON public.blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users remove blocks" ON public.blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- Add image_urls columns to posts and questions
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Enable realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster message queries
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
