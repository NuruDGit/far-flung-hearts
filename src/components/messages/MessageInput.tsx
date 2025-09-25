import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EMOJIS = ['❤️', '😍', '🥰', '😘', '💕', '💖', '💗', '💓', '💘', '💝', '😊', '😂', '🤗', '😴', '🎉', '🎊', '🌹', '🌺', '🌸', '⭐'];

export const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setIsEmojiOpen(false);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[120px] resize-none pr-20 rounded-3xl border-border focus:ring-primary"
            rows={1}
          />
          
          {/* Emoji and attachment buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-muted-foreground hover:text-white"
                >
                  <Smile size={14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end" side="top">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 text-lg hover:bg-secondary"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-muted-foreground hover:text-white"
              title="Attach file (coming soon)"
            >
              <Paperclip size={14} />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="sm"
          className="mb-2 rounded-full h-10 w-10 p-0 love-gradient"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};