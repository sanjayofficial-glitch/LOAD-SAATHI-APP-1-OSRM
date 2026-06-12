"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight, Loader2, Mail } from 'lucide-react';
import { showError } from '@/utils/toast';

interface ChatConversation {
  id: string;
  request_id: string;
  other_user: {
    id: string;
    full_name: string;
    user_type: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const ChatList = () => {
  const { userProfile } = useAuth();
  const { getToken } = useClerkAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const fetchConversations = async () => {
      try {
        const supabaseToken = await getToken({ template: 'supabase' });
        if (!supabaseToken) throw new Error('No Supabase token');
        
        const supabase = createClerkSupabaseClient(supabaseToken);

        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            *,
            request:requests(
              id,
              trip:trips(
                id,
                origin_city,
                destination_city
              ),
              shipper:users!requests_shipper_id_fkey(
                id,
                full_name,
                user_type
              ),
              trip:trip_id
            )
          `)
          .or(`sender_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const conversationMap = new Map<string, ChatConversation>();
        
        messages?.forEach(msg => {
          const requestId = msg.request_id;
          if (!requestId) return;

          const existing = conversationMap.get(requestId);
          const isFromMe = msg.sender_id === userProfile.id;
          const otherUserId = isFromMe ? msg.recipient_id : msg.sender_id;
          
          const request = msg.request as { shipper?: { id: string; full_name: string; user_type: string } };
          const otherUser = request?.shipper || { id: otherUserId, full_name: 'Unknown', user_type: '' };

          if (!existing) {
            conversationMap.set(requestId, {
              id: requestId,
              request_id: requestId,
              other_user: otherUser,
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: !isFromMe && !msg.is_read ? 1 : 0
            });
          } else {
            if (new Date(msg.created_at) > new Date(existing.last_message_time)) {
              existing.last_message = msg.content;
              existing.last_message_time = msg.created_at;
            }
            if (!isFromMe && !msg.is_read) {
              existing.unread_count += 1;
            }
          }
        });

        const conversationsList = Array.from(conversationMap.values())
          .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

        setConversations(conversationsList);
      } catch (error: unknown) {
        console.error('[ChatList] Error:', error);
        showError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userProfile, getToken]);

  const getRequestTitle = (conv: ChatConversation) => {
    return `${conv.other_user.full_name}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg shadow-sm">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Messages</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Your conversations with shippers and truckers</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="border-orange-100 dark:border-orange-800 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="bg-orange-50 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-orange-300 dark:text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No conversations yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Start a conversation by booking a trip or accepting a request.</p>
              <Button 
                onClick={() => navigate(userProfile?.user_type === 'trucker' ? '/trucker/dashboard' : '/browse-trucks')}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-md"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {conversations.map((conv, i) => (
            <Card 
              key={conv.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-orange-100 dark:border-orange-800 hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(`/chat/${conv.request_id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <span className="text-sm font-bold text-white">
                        {conv.other_user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                          {getRequestTitle(conv)}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                          {new Date(conv.last_message_time).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.last_message}</p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge className="bg-orange-600 text-white ml-2 shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                  <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 ml-2 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
