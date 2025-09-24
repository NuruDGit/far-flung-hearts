import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  body: any;
  sender_id: string;
  created_at: string;
  type: string;
  media_url?: string;
}

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  profiles: Record<string, Profile>;
  loading?: boolean;
  onEditMessage?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
  onReplyToMessage?: (id: string) => void;
}

export const MessagesList = ({
  messages,
  currentUserId,
  profiles,
  loading = false,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
            <div className="flex flex-col gap-2 max-w-[70%]">
              <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'bg-primary/20' : 'bg-muted'}`} style={{ width: `${Math.random() * 100 + 100}px` }} />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-love-gradient rounded-full flex items-center justify-center">
            <MessageCircle className="text-white" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Start your conversation</h3>
            <p className="text-muted-foreground text-sm">
              Send your first message to begin connecting with your partner. Every great love story starts with a simple "hello" ❤️
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-1"
      onScroll={handleScroll}
    >
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const sender = profiles[message.sender_id];
        
        let content = '';
        if (typeof message.body === 'string') {
          content = message.body;
        } else if (message.body && typeof message.body === 'object') {
          content = message.body.text || message.body.content || JSON.stringify(message.body);
        }

        return (
          <MessageBubble
            key={message.id}
            id={message.id}
            content={content}
            senderId={message.sender_id}
            createdAt={message.created_at}
            isOwn={isOwn}
            type={message.type}
            senderName={sender?.display_name || 'Partner'}
            senderAvatar={sender?.avatar_url}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReply={onReplyToMessage}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};