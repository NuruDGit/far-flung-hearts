import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, Image, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface FileUpload {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  preview?: string;
}

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, maxFiles = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const newUploads: FileUpload[] = files.slice(0, maxFiles).map((file, index) => ({
      file,
      id: `${Date.now()}-${index}`,
      progress: 0,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Simulate upload progress
    for (const upload of newUploads) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'uploading' as const } : u
      ));

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress: i } : u
        ));
      }

      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'success' as const, progress: 100 } : u
      ));
    }

    // Upload to backend
    try {
      await onUpload(files);
      
      // Success celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Clear uploads after 2 seconds
      setTimeout(() => {
        setUploads([]);
      }, 2000);
    } catch (error) {
      setUploads(prev => prev.map(u => ({ ...u, status: 'error' as const })));
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <motion.div
        animate={{
          borderColor: isDragging ? 'hsl(var(--primary))' : 'hsl(var(--border))',
          backgroundColor: isDragging ? 'hsl(var(--primary) / 0.05)' : 'transparent',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-muted/50"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <motion.div
          animate={{
            scale: isDragging ? 1.1 : 1,
            y: isDragging ? -10 : 0,
          }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? 'Drop your files here' : 'Upload memories'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to browse • Images & Videos
          </p>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>

      {/* Upload queue */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-2"
          >
            {uploads.map(upload => (
              <motion.div
                key={upload.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-card border rounded-lg"
              >
                {/* Preview */}
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                  {upload.preview && (
                    upload.file.type.startsWith('image/') ? (
                      <img src={upload.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={upload.progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">{upload.progress}%</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {upload.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {upload.status === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </motion.div>
                  )}
                  {upload.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUpload(upload.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
