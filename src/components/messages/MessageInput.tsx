import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CameraCapture } from './CameraCapture';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || attachments.length > 0) && !disabled) {
      onSendMessage(trimmedMessage, attachments);
      setMessage('');
      setAttachments([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (file: File) => {
    setAttachments(prev => [...prev, file]);
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          className="hidden"
        />
        
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
                  className={`text-muted-foreground hover:text-white active:text-white active:scale-95 transition-all ${
                    isMobile ? 'p-2 h-8 w-8 min-w-[44px]' : 'p-1 h-6 w-6'
                  }`}
                >
                  <Smile size={isMobile ? 18 : 14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end" side="top">
                <div className={`grid gap-1 ${isMobile ? 'grid-cols-6' : 'grid-cols-8'}`}>
                  {EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className={`text-lg hover:bg-secondary active:bg-secondary active:scale-95 transition-all ${
                        isMobile ? 'p-2 h-10 w-10 min-w-[44px]' : 'p-1 h-8 w-8'
                      }`}
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
              onClick={handleAttachClick}
              className={`text-muted-foreground hover:text-white active:text-white active:scale-95 transition-all ${
                isMobile ? 'p-2 h-8 w-8 min-w-[44px]' : 'p-1 h-6 w-6'
              }`}
              title="Attach files"
            >
              <Paperclip size={isMobile ? 18 : 14} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCameraOpen(true)}
              className={`text-muted-foreground hover:text-white active:text-white active:scale-95 transition-all ${
                isMobile ? 'p-2 h-8 w-8 min-w-[44px]' : 'p-1 h-6 w-6'
              }`}
              title="Take photo"
            >
              <Camera size={isMobile ? 18 : 14} />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() && attachments.length === 0 || disabled}
          size="sm"
          className={`mb-2 rounded-full p-0 love-gradient active:scale-95 transition-transform ${
            isMobile ? 'h-12 w-12 min-w-[48px]' : 'h-10 w-10'
          }`}
        >
          <Send size={isMobile ? 20 : 16} />
        </Button>
      </div>

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};