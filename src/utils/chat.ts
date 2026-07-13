import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { Message } from '@/types/chat';
// The base supabase client (anon key, no auth header) is used ONLY for Realtime
// subscriptions. Realtime uses RLS policies to filter events — no auth header needed.
// All mutations use the Clerk-authenticated client below.
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Sanitize message content — strip HTML tags and trim whitespace.
 * Prevents XSS if messages are ever rendered as HTML.
 */
function sanitizeContent(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

/**
 * Send a new message in a chat conversation.
 */
export const sendMessage = async (payload: {
  recipientId: string;
  content: string;
  requestId?: string;
  getToken: () => Promise<string | null>;
  userId: string;
}): Promise<Message> => {
  const { recipientId, content, requestId, getToken, userId } = payload;

  if (!recipientId || !content) {
    throw new Error('Recipient ID and message content are required');
  }

  const sanitized = sanitizeContent(content);
  if (!sanitized) {
    throw new Error('Message content is empty after sanitization');
  }

  try {
    const supabaseToken = await getToken();
    if (!supabaseToken) {
      throw new Error('Failed to get Supabase token');
    }

    const supabaseClient = createClerkSupabaseClient(supabaseToken);

    const { data, error } = await supabaseClient
      .from('messages')
      .insert({
        sender_id: userId,
        recipient_id: recipientId,
        content: sanitized,
        request_id: requestId,
        is_read: false,
      })
      .select('id, sender_id, recipient_id, content, created_at, is_read, request_id')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to send message');
    }

    return data as Message;
  } catch (err: unknown) {
    console.error('[sendMessage] Error:', err);
    throw err;
  }
};

/**
 * Fetch all messages for a specific request using an authenticated client.
 */
export const fetchMessages = async (requestId: string, getToken: () => Promise<string | null>): Promise<Message[]> => {
  try {
    const token = await getToken();
    if (!token) throw new Error('No token');
    const supabaseClient = createClerkSupabaseClient(token);

    const { data, error } = await supabaseClient
      .from('messages')
      .select('id, sender_id, recipient_id, content, created_at, is_read, request_id')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch messages');
    }

    return (data || []) as Message[];
  } catch (err: unknown) {
    console.error('[fetchMessages] Error:', err);
    throw err;
  }
};

/**
 * Mark messages as read for a specific user in a chat using an authenticated client.
 */
export const markMessagesAsRead = async (requestId: string, userId: string, getToken: () => Promise<string | null>): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) return;
    const supabaseClient = createClerkSupabaseClient(token);

    await supabaseClient
      .from('messages')
      .update({ is_read: true })
      .eq('request_id', requestId)
      .eq('recipient_id', userId)
      .eq('is_read', false);
  } catch (err: unknown) {
    console.error('[markMessagesAsRead] Error:', err);
  }
};

/**
 * Subscribe to real-time message updates.
 */
export const subscribeToMessages = (
  requestId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel => {
  const channelName = `chat:${requestId}`;

  // Remove any existing channel with this name to prevent the
  // "cannot add postgres_changes callbacks after subscribe" error
  const existingChannels = supabase.getChannels();
  for (const ch of existingChannels) {
    if (ch.topic === channelName) {
      supabase.removeChannel(ch);
    }
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${requestId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};