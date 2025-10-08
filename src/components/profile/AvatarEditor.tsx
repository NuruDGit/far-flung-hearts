import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarEditorProps {
  currentAvatar?: string;
  userName: string;
  onSave: (file: File) => Promise<void>;
  onCancel: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentAvatar,
  userName,
  onSave,
  onCancel,
}) => {
  const [imageUrl, setImageUrl] = useState<string>(currentAvatar || '');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
    }
  };

  const handleSave = async () => {
    if (!file) return;
    
    setSaving(true);
    try {
      await onSave(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card border rounded-lg shadow-elevation-4 p-6 max-w-md w-full"
      >
        <h3 className="text-lg font-semibold mb-4">Edit Profile Photo</h3>

        {/* Avatar preview */}
        <div className="relative mb-6">
          <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-border">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover transition-transform"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            ) : (
              <Avatar className="w-full h-full">
                <AvatarFallback className="text-4xl">
                  {userName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Upload button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Photo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imageUrl && (
            <>
              {/* Zoom control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Rotation */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="w-full"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!file || saving}
          >
            {saving ? (
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
