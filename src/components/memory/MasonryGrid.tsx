import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Download, Share2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Memory {
  id: string;
  media_url: string;
  type: string;
  created_at: string;
  body?: any;
  is_favorited?: boolean;
}

interface MasonryGridProps {
  memories: Memory[];
  selectedItems: string[];
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (index: number) => void;
  onToggleFavorite: (id: string) => void;
  selectionMode: boolean;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  memories,
  selectedItems,
  onToggleSelect,
  onOpenLightbox,
  onToggleFavorite,
  selectionMode,
}) => {
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!gridRef.current) return;
      const width = gridRef.current.offsetWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute memories into columns
  const columnArrays: Memory[][] = Array.from({ length: columns }, () => []);
  memories.forEach((memory, index) => {
    columnArrays[index % columns].push(memory);
  });

  return (
    <div ref={gridRef} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {columnArrays.map((columnMemories, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {columnMemories.map((memory, index) => {
              const isSelected = selectedItems.includes(memory.id);
              const globalIndex = memories.findIndex(m => m.id === memory.id);
              
              return (
                <motion.div
                  key={memory.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -8 }}
                    transition={{ type: "spring", damping: 20 }}
                    className={cn(
                      "relative rounded-lg overflow-hidden cursor-pointer shadow-elevation-2 hover:shadow-elevation-4 transition-shadow",
                      isSelected && "ring-4 ring-primary"
                    )}
                    onClick={() => !selectionMode && onOpenLightbox(globalIndex)}
                  >
                    {memory.type === 'image' ? (
                      <img
                        src={memory.media_url}
                        alt={`Memory from ${format(new Date(memory.created_at), 'MMM d, yyyy')}`}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={memory.media_url}
                        className="w-full h-auto object-cover"
                        preload="metadata"
                      />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium">
                          {format(new Date(memory.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>

                      {/* Quick actions */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Button
                            size="icon"
                            variant={memory.is_favorited ? "default" : "secondary"}
                            className="w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(memory.id);
                            }}
                          >
                            <Heart className={cn("h-4 w-4", memory.is_favorited && "fill-current text-destructive")} />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Selection checkbox */}
                    {selectionMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary" : "bg-white/90 backdrop-blur-sm border-2 border-white"
                        )}>
                          {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(memory.id)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
