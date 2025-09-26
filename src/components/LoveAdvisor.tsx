import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import proximaAvatar from '@/assets/proxima-avatar.jpg';
import { BookCard } from './BookCard';
import { BookRecommendations } from './BookRecommendations';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface LoveAdvisorProps {
  pairId?: string;
}

const LoveAdvisor = ({ pairId }: LoveAdvisorProps) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Proxima 💕 Ready to help with your relationship questions!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('love-advisor', {
        body: {
          message: inputMessage,
          pairId: pairId
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't get a response right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-love-light/30 to-white">
      {/* Welcome Message for First Time Users */}
      {messages.length === 1 && (
        <div className="p-4 bg-white/60 border-b border-love-coral/10">
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Your personal love assistant with access to your relationship data
            </p>
          </div>
        </div>
      )}

      {/* Quick Suggestions for First Time Users */}
      {messages.length === 1 && (
        <div className="p-4 bg-white/60 border-b border-love-coral/10">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Creative date ideas",
              "Communication tips",
              "Relationship goals"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(`Give me ${suggestion.toLowerCase()}`)}
                className="text-xs px-3 py-2 bg-white border border-love-coral/20 rounded-full hover:bg-love-light/30 hover:border-love-coral/40 transition-all duration-200 text-love-deep hover-scale"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in ${message.isUser ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {!message.isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-love-coral/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-love-coral" />
              </div>
            )}
            
            <div
              className={`max-w-[75%] relative group ${
                message.isUser
                  ? 'order-1'
                  : 'order-2'
              }`}
            >
              <div
                className={`p-4 rounded-2xl shadow-sm border backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                  message.isUser
                    ? 'bg-gradient-to-br from-love-heart to-love-coral text-white border-love-heart/20'
                    : 'bg-white/90 text-gray-900 border-gray-200/50'
                }`}
              >
                <div 
                  className="text-sm leading-relaxed whitespace-pre-line break-words"
                  dangerouslySetInnerHTML={{
                    __html: message.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
                
                {/* Render book recommendations if present */}
                {message.text.includes('📚 BOOK_RECOMMENDATION:') && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <BookRecommendations messageText={message.text} />
                  </div>
                )}
              </div>
              
              {/* Timestamp - Shows on hover */}
              <div className={`text-xs mt-1 opacity-0 group-hover:opacity-70 transition-opacity duration-200 ${
                message.isUser ? 'text-right text-gray-500' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {message.isUser && (
              <Avatar className="w-10 h-10 ring-2 ring-love-heart/20 ring-offset-2 hover-scale">
                <AvatarImage 
                  src={userProfile?.avatar_url} 
                  alt={userProfile?.display_name || userProfile?.first_name || "User"} 
                  className="object-cover" 
                />
                <AvatarFallback className="bg-love-heart/10 text-love-heart">
                  {userProfile?.display_name?.[0] || userProfile?.first_name?.[0] || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {/* Enhanced Loading Animation */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-love-coral/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-love-coral" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200/50 max-w-[75%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Enhanced Input Area */}
      <div className="border-t border-love-coral/10 bg-white/80 backdrop-blur-sm p-4">
        <div className="relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="💭 Ask Proxima anything about love, relationships, or date ideas..."
            className="pr-14 min-h-[52px] max-h-[120px] resize-none border-love-coral/20 focus:border-love-coral/40 focus:ring-love-coral/20 rounded-xl text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white/20 hover-scale"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Character counter for longer messages */}
        {inputMessage.length > 100 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {inputMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default LoveAdvisor;