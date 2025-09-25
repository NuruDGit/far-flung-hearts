import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Video, Heart, Calendar, Download, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
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
          .single();

        if (pairData) {
          setPair(pairData);

          // Get all media messages from the pair
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('pair_id', pairData.id)
            .eq('type', 'media')
            .not('media_url', 'is', null)
            .order('created_at', { ascending: false });

          setMemories(messagesData || []);
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
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

  const handleFileUpload = async (files: FileList) => {
    if (!files.length || !pair) {
      console.log('No files or no pair:', { filesLength: files.length, pair });
      return;
    }

    console.log('Starting upload for', files.length, 'files');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        console.log('Processing file:', file.name, 'Size:', file.size);
        
        // File size limit: 20MB
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 20MB.`);
          continue;
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('Uploading to path:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        console.log('File uploaded successfully, getting public URL...');

        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        console.log('Public URL obtained:', data.publicUrl);

        // Save as message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            pair_id: pair.id,
            sender_id: user.id,
            type: 'media',
            media_url: data.publicUrl,
            body: { 
              caption: '',
              file_name: file.name,
              file_size: file.size,
              file_type: file.type 
            }
          });

        if (messageError) {
          console.error('Message insert error:', messageError);
          toast.error(`Failed to save ${file.name}: ${messageError.message}`);
        } else {
          console.log('Message saved successfully');
          toast.success(`${file.name} uploaded successfully!`);
        }
      }

      // Refresh memories
      console.log('Refreshing memories list...');
      const { data: messagesData, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('pair_id', pair.id)
        .eq('type', 'media')
        .not('media_url', 'is', null)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching updated memories:', fetchError);
      } else {
        setMemories(messagesData || []);
        console.log('Memories updated, count:', messagesData?.length || 0);
      }

    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast.error('An unexpected error occurred during upload');
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Upload Memories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-love-coral/30 rounded-lg p-6 text-center">
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-love-coral" size={32} />
                <p className="text-sm font-medium mb-1">
                  {uploading ? 'Uploading...' : 'Click to upload photos and videos'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 20MB per file. Supports JPG, PNG, WEBP, MP4, MOV, AVI
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="mx-auto mb-2 text-love-coral" size={20} />
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
              <Heart className="mx-auto mb-2 text-pink-500" size={20} />
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold">{memories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 text-blue-500" size={20} />
              <p className="text-sm text-muted-foreground">This Month</p>
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
        {memories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Camera className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
              <p className="text-muted-foreground">
                Start uploading photos and videos to create your shared memory vault.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="group overflow-hidden">
                <div className="aspect-square relative">
                  {memory.body?.file_type?.startsWith('image/') ? (
                    <img
                      src={memory.media_url}
                      alt={memory.body?.file_name || 'Memory'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={memory.media_url}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button size="sm" variant="secondary" asChild>
                        <a href={memory.media_url} target="_blank" rel="noopener noreferrer">
                          <Download size={14} />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/50 text-white rounded-full p-1">
                      {getFileTypeIcon(memory.body?.file_type)}
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {memory.body?.file_name || 'Unknown file'}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryVault;