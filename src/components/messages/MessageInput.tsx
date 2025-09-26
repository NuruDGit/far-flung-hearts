import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, Camera, FileText, Mic, MapPin, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CameraCapture } from './CameraCapture';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EMOJI_CATEGORIES = [
  {
    title: "❤️ Love & Hearts",
    emojis: ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '💋', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎']
  },
  {
    title: "😊 Happy & Positive", 
    emojis: ['😊', '😍', '🥰', '😘', '😂', '🤣', '😁', '😄', '😃', '😀', '🤗', '🥳', '😋', '😌', '🤤', '😇']
  },
  {
    title: "😜 Playful & Fun",
    emojis: ['😜', '🤪', '😝', '🤭', '😏', '😎', '🤓', '🥸', '🤯', '😮', '😯', '😲', '🤩', '✨', '🌟', '⭐']
  },
  {
    title: "🥺 Cute & Sweet",
    emojis: ['🥺', '🥹', '😚', '😙', '🤏', '👌', '✌️', '🤞', '🫶', '👍', '👏', '🙌', '🤝', '💪', '🦋', '🌈']
  },
  {
    title: "🌹 Nature & Flowers",
    emojis: ['🌹', '🌺', '🌸', '🌻', '🌷', '🏵️', '💐', '🌿', '🍀', '🌱', '🌲', '🌳', '🎋', '🎍', '🌾', '🌴']
  },
  {
    title: "🎉 Celebration",
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻', '☀️', '🌞', '🌙', '🌛', '💫', '⚡']
  }
];

export const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
    setIsAttachOpen(false);
  };

  const handleDocumentClick = () => {
    documentInputRef.current?.click();
    setIsAttachOpen(false);
  };

  const handleAudioClick = () => {
    audioInputRef.current?.click();
    setIsAttachOpen(false);
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationText = `📍 My location: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
          setMessage(prev => prev + locationText);
          setIsAttachOpen(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback - just add location emoji
          setMessage(prev => prev + '📍 ');
          setIsAttachOpen(false);
        }
      );
    } else {
      setMessage(prev => prev + '📍 ');
      setIsAttachOpen(false);
    }
  };

  const handleContactShare = () => {
    // Create a more comprehensive contact sharing experience
    const contactInfo = `👤 Contact Info:
📧 Email: 
📱 Phone: 
🏠 Address: `;
    setMessage(prev => prev + contactInfo);
    setIsAttachOpen(false);
  };

  const handleMemoryVaultAccess = () => {
    // Open memory vault in new tab so users can share without losing chat context
    window.open('/app/memory-vault', '_blank');
    setIsAttachOpen(false);
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
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={documentInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          multiple
          accept="audio/*"
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
              <PopoverContent className="w-80 p-0" align="end" side="top">
                <div className="max-h-80 overflow-y-auto p-3">
                  {EMOJI_CATEGORIES.map((category) => (
                    <div key={category.title} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        {category.title}
                      </h4>
                      <div className={`grid gap-1 ${isMobile ? 'grid-cols-6' : 'grid-cols-8'}`}>
                        {category.emojis.map((emoji) => (
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
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover open={isAttachOpen} onOpenChange={setIsAttachOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-muted-foreground hover:text-white active:text-white active:scale-95 transition-all ${
                    isMobile ? 'p-2 h-8 w-8 min-w-[44px]' : 'p-1 h-6 w-6'
                  }`}
                  title="Share content"
                >
                  <Paperclip size={isMobile ? 18 : 14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end" side="top">
                <div className="grid grid-cols-1 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCameraOpen(true);
                      setIsAttachOpen(false);
                    }}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <Camera size={16} className="text-blue-500" />
                    Take Photo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAttachClick}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <FileText size={16} className="text-green-500" />
                    Photos & Videos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDocumentClick}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <FileText size={16} className="text-orange-500" />
                    Documents
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAudioClick}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <Mic size={16} className="text-purple-500" />
                    Audio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLocationShare}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <MapPin size={16} className="text-red-500" />
                    Location
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleContactShare}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <User size={16} className="text-blue-600" />
                    Contact
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMemoryVaultAccess}
                    className="justify-start gap-3 h-10 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  >
                    <Heart size={16} className="text-pink-500" />
                    Memory Vault
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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