import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Bot, User, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import proximaAvatar from '@/assets/proxima-avatar.jpg';
import loveLifestyle from '@/assets/love-lifestyle.jpg';
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
  const { user, subscription } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyQuestionCount, setDailyQuestionCount] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const dismissed = localStorage.getItem('loveAdvisorDisclaimerDismissed');
    return dismissed !== 'true';
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
            // Use safe view for partner data (excludes email, phone, birth_date)
            const { data: partner } = await supabase
              .from('profiles_partner_safe')
              .select('*')
              .eq('id', partnerId)
              .single();
            
            if (partner) {
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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

    // Check free tier limit
    if (subscription.tier === 'free' && dailyQuestionCount >= 3) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all 3 free questions today. Upgrade to Premium for unlimited AI chat!",
        variant: "destructive",
      });
      return;
    }

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

      // Handle blocked content response
      if (data.error && data.resources) {
        const crisisMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `${data.error}\n\n**Crisis Resources:**\n${data.resources.map((r: any) => `• ${r.name}: ${r.contact}`).join('\n')}\n\nPlease reach out to these professionals who can provide the help you need. Your wellbeing is important. 💙`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, crisisMessage]);
        setIsLoading(false);
        return;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Increment daily count for free users
      if (subscription.tier === 'free') {
        setDailyQuestionCount(prev => prev + 1);
      }
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

  const handleDismissDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('loveAdvisorDisclaimerDismissed', 'true');
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Professional Disclaimer - Dismissible */}
      {showDisclaimer && (
        <Alert className="mx-auto my-4 max-w-2xl border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 flex-shrink-0">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200 pr-6">
            <strong>Important:</strong> This AI advisor provides general relationship suggestions 
            and is not a substitute for professional therapy or counseling. For serious issues 
            (abuse, mental health crises, etc.), please consult a licensed professional.
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
            onClick={handleDismissDisclaimer}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Welcoming image section */}
      {messages.length === 1 && partnerData && (
        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border flex-shrink-0">
          <div className="text-center animate-fade-in">
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
              <img 
                src={loveLifestyle} 
                alt="Beautiful romantic lifestyle" 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-24"></div>
              <div className="mx-3 text-primary/60">✨</div>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-24"></div>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 space-y-6"
      >
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* Message */}
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in ${message.isUser ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {!message.isUser && (
              <Avatar className="w-8 h-8 ring-1 ring-primary/20">
                <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary">
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
                    ? 'bg-primary text-primary-foreground border-primary/20'
                    : 'bg-card text-card-foreground border-border'
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
                <div className="text-xs text-muted-foreground">
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
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 ring-offset-2 hover-scale">
                <AvatarImage 
                  src={userProfile?.avatar_url} 
                  alt={userProfile?.display_name || userProfile?.first_name || "User"} 
                  className="object-cover" 
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userProfile?.display_name?.[0] || userProfile?.first_name?.[0] || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Quick Suggestions after first message */}
          {index === 0 && showQuickSuggestions && (
            <div className="flex flex-wrap gap-2 justify-center mt-4 mb-2">
              {getPersonalizedSuggestions().map((suggestion, suggestionIndex) => (
                <button
                  key={suggestionIndex}
                  onClick={() => {
                    setInputMessage(suggestion);
                    setShowQuickSuggestions(false);
                  }}
                  className="text-xs px-3 py-2 bg-primary/10 border border-border rounded-full hover:bg-primary/20 transition-all duration-200 text-foreground hover-scale"
                >
                  ✨ {suggestion}
                </button>
              ))}
            </div>
          )}
          </div>
        ))}
        
        {/* Enhanced Loading Animation */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <Avatar className="w-8 h-8 ring-1 ring-primary/20">
              <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-card backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border max-w-[75%]">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-foreground font-medium">Proxima is crafting the perfect advice...</span>
              </div>
            </div>
          </div>
        )}
        
      </div>
      
      {/* Enhanced Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4 flex-shrink-0">
        <div className="relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="💭 Ask Proxima anything about love, relationships, or date ideas..."
            className="pr-14 min-h-[52px] max-h-[120px] resize-none rounded-xl text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="absolute right-2 bottom-2 w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Character counter for longer messages */}
        {inputMessage.length > 100 && (
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {inputMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default LoveAdvisor;