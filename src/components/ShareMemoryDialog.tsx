import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, X } from 'lucide-react';

interface Memory {
  id: string;
  media_url: string;
  body?: {
    file_name?: string;
    file_type?: string;
    attachments?: string[];
  };
  created_at: string;
}

interface ShareMemoryDialogProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  pairId: string;
}

export const ShareMemoryDialog: React.FC<ShareMemoryDialogProps> = ({
  memory,
  isOpen,
  onClose,
  pairId
}) => {
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  if (!memory) return null;

  const mediaUrl = memory.media_url || (memory.body?.attachments && memory.body.attachments[0]);
  const fileName = memory.body?.file_name || 'Shared Memory';
  const fileType = memory.body?.file_type || '';

  const handleShare = async () => {
    if (!mediaUrl) return;

    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const messageBody = {
        text: message.trim() || 'Shared a memory',
        file_name: fileName,
        file_type: fileType,
        attachments: [mediaUrl]
      };

      const { error } = await supabase
        .from('messages')
        .insert({
          pair_id: pairId,
          sender_id: user.id,
          type: fileType.startsWith('image/') ? 'image' : 'video',
          media_url: mediaUrl,
          body: messageBody
        });

      if (error) throw error;

      toast({
        title: "Memory shared!",
        description: "Your memory has been shared in the chat."
      });

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sharing memory:', error);
      toast({
        title: "Failed to share memory",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Share Memory
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media Preview */}
          <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
            {fileType.startsWith('image/') || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={mediaUrl}
                alt={fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                muted
              />
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a message (optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share this special moment..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSharing}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? (
                "Sharing..."
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};