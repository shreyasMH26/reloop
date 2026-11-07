import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCheck, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { timeAgo } from '../../lib/utils';

export const MessagesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { messages, conversations, update } = useMockStore(user?.id || 'guest');

  const [activeConversationId, setActiveConversationId] = useState(
    conversations.length > 0 ? conversations[0].id : ''
  );
  const [inputText, setInputText] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const conversationMessages = messages.filter((m) => m.conversation_id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      conversation_id: activeConversationId,
      sender_id: user?.id || 'guest_user',
      receiver_id: 'other_user',
      content: inputText.trim(),
      created_at: new Date().toISOString(),
      listing_id: activeConversation?.listing_id,
      listing_title: activeConversation?.listing_title,
    };

    update((s) => ({
      ...s,
      messages: [...s.messages, newMsg],
      conversations: s.conversations.map((c) =>
        c.id === activeConversationId
          ? { ...c, last_message: inputText.trim(), last_message_at: new Date().toISOString() }
          : c
      ),
    }));

    setInputText('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="pb-4 border-b border-cream-200">
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Community Chat & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Coordinate product questions, inspection locations, and handovers in Davanagere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 border border-cream-200 rounded-3xl overflow-hidden bg-cream-50 min-h-[460px]">
          
          {/* Conversation List */}
          <div className="md:col-span-5 bg-white border-r border-cream-200 divide-y divide-cream-100 overflow-y-auto max-h-[460px]">
            {conversations.length > 0 ? (
              conversations.map((c) => {
                const isSelected = c.id === activeConversationId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-sage-50/80 border-l-4 border-sage-500' : 'hover:bg-cream-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {c.listing_title ? c.listing_title[0] : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-charcoal-900 truncate">
                          {c.listing_title || 'General Inquiry'}
                        </p>
                        <span className="text-[10px] text-charcoal-400">
                          {c.last_message_at ? timeAgo(c.last_message_at) : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500 truncate mt-0.5">
                        {c.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-charcoal-400">
                No active conversations
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="md:col-span-7 flex flex-col justify-between bg-cream-50/60 p-4">
            
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white p-3.5 rounded-2xl border border-cream-200 flex items-center justify-between mb-4 shadow-2xs">
                  <div>
                    <h4 className="font-bold text-xs text-charcoal-900">
                      Re: {activeConversation.listing_title}
                    </h4>
                    <p className="text-[10px] text-sage-700 font-semibold">Local neighborhood coordination</p>
                  </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 max-h-[300px]">
                  {conversationMessages.map((msg) => {
                    const isMe = msg.sender_id === (user?.id || 'guest_user') || msg.sender_id === 'user_seed_1';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                            isMe
                              ? 'bg-sage-600 text-white rounded-br-xs'
                              : 'bg-white text-charcoal-800 border border-cream-200 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-charcoal-400 mt-1 px-1">
                          {timeAgo(msg.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-2xs"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                Select a conversation on the left to start messaging
              </div>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
