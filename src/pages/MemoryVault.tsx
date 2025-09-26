import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Camera, Video, Heart, Calendar, Download, Trash2, Archive } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import MemoryVaultFilters, { FilterState } from '@/components/MemoryVaultFilters';
import MemoryVaultBulkActions from '@/components/MemoryVaultBulkActions';
import { MemoryLightbox } from '@/components/MemoryLightbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Memory {
  id: string;
  sender_id: string;
  created_at: string;
  type: string;
  media_url: string;
  body: any;
}

const MemoryVault = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pair, setPair] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    mediaType: 'all',
    dateRange: { from: null, to: null },
    sortBy: 'date',
    sortDirection: 'desc'
  });

  // Filtered and sorted memories
  const filteredMemories = useMemo(() => {
    let filtered = [...memories];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(memory => {
        const fileName = memory.body?.file_name || '';
        return fileName.toLowerCase().includes(searchLower);
      });
    }

    // Apply media type filter
    if (filters.mediaType !== 'all') {
      filtered = filtered.filter(memory => {
        const fileType = memory.body?.file_type || '';
        if (filters.mediaType === 'image') {
          return fileType.startsWith('image/');
        } else if (filters.mediaType === 'video') {
          return fileType.startsWith('video/');
        }
        return true;
      });
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(memory => {
        const memoryDate = new Date(memory.created_at);
        const from = filters.dateRange.from;
        const to = filters.dateRange.to;
        
        if (from && memoryDate < from) return false;
        if (to && memoryDate > to) return false;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
          const nameA = a.body?.file_name || '';
          const nameB = b.body?.file_name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'size':
          const sizeA = a.body?.file_size || 0;
          const sizeB = b.body?.file_size || 0;
          comparison = sizeA - sizeB;
          break;
      }
      
      return filters.sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [memories, filters]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get user's active pair
        const { data: pairData } = await supabase
          .from('pairs')
          .select('*')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .eq('status', 'active')
          .maybeSingle();

        if (pairData) {
          setPair(pairData);

          // Fetch memories from messages table
          console.log('Fetching memories for pair:', pairData.id);
          
          const { data: memoriesData, error } = await supabase
            .from('messages')
            .select('*')
            .eq('pair_id', pairData.id)
            .eq('type', 'media')
            .not('media_url', 'is', null)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching memories:', error);
          } else {
            console.log('Memories found:', memoriesData?.length || 0);
            setMemories(memoriesData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
        <AppNavigation />
        <div className="container mx-auto p-4 max-w-md lg:max-w-4xl pt-6 pb-24">
          <Card className="text-center">
            <CardContent className="p-8">
              <Camera className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h2 className="text-xl font-semibold mb-2">Memory Vault</h2>
              <p className="text-muted-foreground">
                Connect with your partner to start creating shared memories together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !pair) return;

    setUploading(true);
    console.log('Starting upload for', files.length, 'files');

    try {
      for (const file of Array.from(files)) {
        console.log('Processing file:', file.name, 'Size:', file.size);

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('Uploading to path:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully, getting public URL...');

        // Get public URL (bucket is public)
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const mediaUrl = publicUrl;
        console.log('Public URL obtained:', mediaUrl);

        // Create message record in database
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            pair_id: pair.id,
            sender_id: user.id,
            type: 'media',
            media_url: mediaUrl,
            body: {
              attachments: [mediaUrl],
              text: '',
              file_name: file.name,
              file_size: file.size,
              file_type: file.type
            }
          })
          .select()
          .single();

        if (messageError) {
          console.error('Message insert error:', messageError);
          throw messageError;
        }

        console.log('Memory saved to database:', messageData);

        // Add to local state
        setMemories(prev => [messageData, ...prev]);
      }

      toast.success(`Successfully uploaded ${files.length} file(s)!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType?.startsWith('video/')) return <Video size={16} />;
    return <Camera size={16} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('messages')
        .delete()
        .in('id', itemIds);

      if (dbError) throw dbError;

      // Delete from storage
      const memoriesToDelete = memories.filter(m => itemIds.includes(m.id));
      const filePaths = memoriesToDelete
        .map(m => {
          const url = m.media_url;
          if (url) {
            // Extract file path from full URL
            const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
            return match ? match[1] : null;
          }
          return null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove(filePaths);

        if (storageError) console.error('Storage deletion error:', storageError);
      }

      // Update local state
      setMemories(prev => prev.filter(m => !itemIds.includes(m.id)));
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  };

  const handleBulkDownload = (itemIds: string[]) => {
    const memoriesToDownload = memories.filter(m => itemIds.includes(m.id));
    
    memoriesToDownload.forEach(memory => {
      if (memory.media_url) {
        const fileName = memory.body?.file_name || `memory-${memory.id}`;
        
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = memory.media_url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedItems(newSelection);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-6xl pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-love-heart/20 flex items-center justify-center">
            <Camera className="text-love-heart" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-love-deep">Memory Vault</h1>
            <p className="text-muted-foreground">Your shared photos and videos</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">Upload New Memories</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your photos and videos here, or click to browse
              </p>
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <Button asChild disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? "Uploading..." : "Choose Files"}
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <div className="mb-6">
          <MemoryVaultFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={memories.length}
            filteredCount={filteredMemories.length}
          />
        </div>

        {/* Bulk Actions Section */}
        <div className="mb-6">
          <MemoryVaultBulkActions
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
            allItemIds={filteredMemories.map(m => m.id)}
            onBulkDelete={handleBulkDelete}
            onBulkDownload={handleBulkDownload}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="mx-auto mb-2 text-love-heart" size={20} />
              <p className="text-sm text-muted-foreground">Photos</p>
              <p className="font-semibold">
                {memories.filter(m => m.body?.file_type?.startsWith('image/')).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Video className="mx-auto mb-2 text-love-deep" size={20} />
              <p className="text-sm text-muted-foreground">Videos</p>
              <p className="font-semibold">
                {memories.filter(m => m.body?.file_type?.startsWith('video/')).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Archive className="mx-auto mb-2 text-love-heart" size={20} />
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold">{memories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 text-love-coral" size={20} />
              <p className="text-sm text-muted-foreground">{new Date().toLocaleString('default', { month: 'long' })}</p>
              <p className="font-semibold">
                {memories.filter(m => {
                  const created = new Date(m.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Memories Grid */}
        {filteredMemories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Camera className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">
                {memories.length === 0 ? "No memories yet" : "No memories match your filters"}
              </h3>
              <p className="text-muted-foreground">
                {memories.length === 0 
                  ? "Start uploading photos and videos to create your shared memory vault."
                  : "Try adjusting your filters to see more memories."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMemories.map((memory) => {
              // Get the media URL (could be direct media_url or from attachments array)
              const mediaUrl = memory.media_url || (memory.body?.attachments && memory.body.attachments[0]);
              const fileName = memory.body?.file_name || 'Memory';
              const fileType = memory.body?.file_type || '';
              const isSelected = selectedItems.includes(memory.id);
              
              console.log('Memory item:', { 
                id: memory.id, 
                mediaUrl, 
                fileName, 
                fileType,
                media_url: memory.media_url,
                attachments: memory.body?.attachments 
              });
              
              if (!mediaUrl) {
                console.log('No media URL found for memory:', memory);
                return null;
              }
              
              return (
                <Card key={memory.id} className={`group overflow-hidden relative ${isSelected ? 'ring-2 ring-love-heart' : ''}`}>
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleItemSelection(memory.id)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="aspect-square relative">
                    {fileType.startsWith('image/') || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={mediaUrl}
                        alt={fileName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onLoad={() => {
                          console.log('Image loaded successfully:', mediaUrl);
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', mediaUrl);
                          console.error('Error details:', e);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
                        poster="/placeholder.svg"
                      />
                    )}
                    <div 
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer"
                      onClick={() => setLightboxIndex(filteredMemories.findIndex(m => m.id === memory.id))}
                    >
                    </div>
                    <div className="absolute top-2 left-2">
                      <div className="bg-black/50 text-white rounded-full p-1">
                        {getFileTypeIcon(fileType)}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground truncate">
                      {fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(memory.created_at), 'MMM d, yyyy')}
                    </p>
                    {memory.body?.file_size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(memory.body.file_size)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Lightbox */}
        <MemoryLightbox
          memories={filteredMemories}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex >= 0}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
        />
      </div>
    </div>
  );
};

export default MemoryVault;