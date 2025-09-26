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
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch user profile and partner data
  useEffect(() => {
    const fetchUserAndPartnerData = async () => {
      if (!user) return;
      
      try {
        // Get current user's profile
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(currentUserProfile);

        // Get partner data if pairId exists
        if (pairId) {
          const { data: pair } = await supabase
            .from('pairs')
            .select('*')
            .eq('id', pairId)
            .single();

          if (pair) {
            const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a;
            const { data: partner } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', partnerId)
              .single();
            
            if (partner) {
              console.log('Partner data fetched:', partner);
              setPartnerData(partner);
            }
          }
        }

        // Set personalized welcome message
        if (currentUserProfile || partnerData) {
          const welcomeMessage = {
            id: 'welcome',
            text: generateWelcomeMessage(currentUserProfile, partnerData),
            isUser: false,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error fetching user/partner data:', error);
        // Set default welcome message on error
        setMessages([{
          id: 'welcome',
          text: "Hi! I'm Proxima 💕 Ready to help with your relationship questions!",
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    };

    fetchUserAndPartnerData();
  }, [user, pairId]);

  // Generate personalized welcome message
  const generateWelcomeMessage = (user: any, partner: any) => {
    if (partner) {
      const monthsTogether = Math.floor((new Date().getTime() - new Date(partner.relationship_start_date || '2024-01-01').getTime()) / (30.44 * 24 * 60 * 60 * 1000));
      return `Hi ${user?.display_name || user?.first_name || 'there'}! 💕 I'm Proxima, and I'm so excited to help you and ${partner.display_name} with your relationship! I can see you've been together for ${monthsTogether} months - what a beautiful journey! I have access to both your profiles, so I can give you personalized advice. What's on your mind today?`;
    }
    return `Hi ${user?.display_name || user?.first_name || 'there'}! 💕 I'm Proxima, your personal love assistant. I can help with dating advice, relationship tips, and anything love-related. What would you like to talk about?`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Smart conversation starters based on user data
  const getPersonalizedSuggestions = () => {
    const suggestions = [];
    
    if (partnerData) {
      suggestions.push(`Plan a ${partnerData.city} date night`);
      if (partnerData.interests?.includes('Cooking')) {
        suggestions.push('Cooking date ideas for us');
      }
      if (partnerData.interests?.includes('Travel')) {
        suggestions.push('Travel plans for couples');
      }
      suggestions.push('Communication tips for us');
    } else {
      suggestions.push('Creative date ideas');
      suggestions.push('Communication tips');
      suggestions.push('Relationship goals');
    }
    
    return suggestions.slice(0, 3);
  };

  // Add reaction to message
  const addReaction = (messageId: string, emoji: string) => {
    // This would typically save to database
    console.log(`Added ${emoji} reaction to message ${messageId}`);
  };

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
    setShowQuickSuggestions(false);

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
      {/* Smart Welcome Section */}
      {messages.length === 1 && partnerData && (
        <div className="p-4 bg-gradient-to-r from-love-light/30 to-love-coral/10 border-b border-love-coral/10">
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground mb-3">
              💕 I know all about you and {partnerData.display_name} to give you the best advice!
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <span className="px-2 py-1 bg-white/60 rounded-full">📍 {partnerData.city}, {partnerData.country}</span>
              <span className="px-2 py-1 bg-white/60 rounded-full">💝 Together since {new Date(partnerData.relationship_start_date || '2024-01-01').toLocaleDateString()}</span>
              {partnerData.interests?.slice(0, 2).map((interest: string) => (
                <span key={interest} className="px-2 py-1 bg-white/60 rounded-full">🎯 {interest}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {showQuickSuggestions && (
        <div className="p-4 bg-white/60 border-b border-love-coral/10">
          <div className="flex flex-wrap gap-2 justify-center">
            {getPersonalizedSuggestions().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(suggestion);
                  setShowQuickSuggestions(false);
                }}
                className="text-xs px-3 py-2 bg-gradient-to-r from-love-heart/10 to-love-coral/10 border border-love-coral/20 rounded-full hover:from-love-heart/20 hover:to-love-coral/20 transition-all duration-200 text-love-deep hover-scale"
              >
                ✨ {suggestion}
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
              <Avatar className="w-8 h-8 ring-1 ring-love-coral/20">
                <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
                <AvatarFallback className="bg-love-coral/10 text-love-coral">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[75%] relative group ${
                message.isUser
                  ? 'order-1'
                  : 'order-2'
              }`}
            >
              <div
                className={`p-4 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                  message.isUser
                    ? 'bg-gradient-to-br from-love-heart to-love-coral text-white border-love-heart/20 shadow-love-heart/20'
                    : 'bg-white/95 text-gray-900 border-love-coral/20 shadow-love-coral/10'
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
              
              {/* Enhanced timestamp and reactions */}
              <div className={`flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                message.isUser ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* Quick reactions for AI messages */}
                {!message.isUser && (
                  <div className="flex gap-1">
                    {['❤️', '👍', '💡', '🎯'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        className="text-xs hover:scale-125 transition-transform duration-150 opacity-60 hover:opacity-100"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
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
            <Avatar className="w-8 h-8 ring-1 ring-love-coral/20">
              <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
              <AvatarFallback className="bg-love-coral/10 text-love-coral">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-love-coral/20 max-w-[75%]">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-love-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-love-deep font-medium">Proxima is crafting the perfect advice...</span>
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