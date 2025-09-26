import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Download, Heart, Share2 } from 'lucide-react';

interface Memory {
  id: string;
  media_url: string;
  body?: {
    file_name?: string;
    file_type?: string;
    attachments?: string[];
  };
  created_at: string;
  is_favorited?: boolean;
}

interface MemoryLightboxProps {
  memories: Memory[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleFavorite?: (memory: Memory) => void;
  onShare?: (memory: Memory) => void;
}

export const MemoryLightbox: React.FC<MemoryLightboxProps> = ({
  memories,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onToggleFavorite,
  onShare
}) => {
  const currentMemory = memories[currentIndex];
  
  if (!currentMemory) return null;

  const mediaUrl = currentMemory.media_url || (currentMemory.body?.attachments && currentMemory.body.attachments[0]);
  const fileName = currentMemory.body?.file_name || 'Memory';
  const fileType = currentMemory.body?.file_type || '';
  
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : memories.length - 1;
    onNavigate(newIndex);
  };
  
  const handleNext = () => {
    const newIndex = currentIndex < memories.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-screen-lg max-h-screen w-full h-full p-0 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X size={24} />
          </Button>

          {/* Action Buttons */}
          <div className="absolute top-4 right-16 z-50 flex gap-2">
            {/* Favorite Button */}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onToggleFavorite(currentMemory)}
              >
                <Heart 
                  size={20} 
                  className={currentMemory.is_favorited ? 'fill-red-500 text-red-500' : 'text-white'}
                />
              </Button>
            )}
            
            {/* Share Button */}
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onShare(currentMemory)}
              >
                <Share2 size={20} />
              </Button>
            )}
            
            {/* Download Button */}
            <Button
              variant="ghost"
              size="icon" 
              className="text-white hover:bg-white/20"
              asChild
            >
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                <Download size={20} />
              </a>
            </Button>
          </div>

          {/* Navigation Buttons */}
          {memories.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft size={32} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight size={32} />
              </Button>
            </>
          )}

          {/* Media Content */}
          <div className="w-full h-full flex items-center justify-center p-8">
            {fileType.startsWith('image/') || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={mediaUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                loading="eager"
              />
            ) : (
              <video
                src={mediaUrl}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>

          {/* Counter */}
          {memories.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {memories.length}
            </div>
          )}

          {/* File Name */}
          <div className="absolute bottom-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded text-sm max-w-md truncate">
            {fileName}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};