import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Archive, Share2, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BulkActionsBarProps {
  selectedCount: number;
  onDownload: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onCancel: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onDownload,
  onDelete,
  onArchive,
  onShare,
  onFavorite,
  onCancel,
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-card border shadow-elevation-4 rounded-full px-6 py-3 flex items-center gap-4">
        <Badge variant="secondary" className="rounded-full">
          {selectedCount} selected
        </Badge>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onFavorite}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <Heart className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onDownload}
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onShare}
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onArchive}
            className="rounded-full hover:bg-warning/10 hover:text-warning"
          >
            <Archive className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
