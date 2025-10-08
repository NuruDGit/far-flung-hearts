import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentDropZoneProps {
  onFilesDropped: (files: File[]) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  return FileText;
};

export const AttachmentDropZone: React.FC<AttachmentDropZoneProps> = ({ onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFileType, setDraggedFileType] = useState<string>('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    if (e.dataTransfer.items.length > 0) {
      const type = e.dataTransfer.items[0].type;
      setDraggedFileType(type);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDraggedFileType('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDraggedFileType('');

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  const FileIcon = draggedFileType ? getFileIcon(draggedFileType) : Upload;

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="max-w-md w-full mx-4"
          >
            <div className={cn(
              "relative rounded-2xl border-4 border-dashed p-12 text-center transition-colors",
              "border-primary bg-primary/5"
            )}>
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
              </motion.div>
              
              <h3 className="text-2xl font-display font-semibold mb-2">
                Drop your files here
              </h3>
              <p className="text-muted-foreground">
                Release to upload {draggedFileType && `• ${draggedFileType.split('/')[0]}`}
              </p>

              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 hsl(var(--primary) / 0)',
                    '0 0 0 20px hsl(var(--primary) / 0.1)',
                    '0 0 0 0 hsl(var(--primary) / 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
